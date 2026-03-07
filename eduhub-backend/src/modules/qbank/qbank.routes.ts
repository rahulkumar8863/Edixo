import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate, requireOrgAccess);

// ─── GET /api/qbank/folders ──────────────────────────────────
router.get('/folders', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });

        // Return global + org folders
        const folders = await prisma.qBankFolder.findMany({
            where: {
                OR: [
                    { scope: 'GLOBAL' },
                    { orgId: org?.id, scope: 'ORG' },
                ],
                isActive: true,
            },
            orderBy: [{ depth: 'asc' }, { sortOrder: 'asc' }],
        });
        res.json({ success: true, data: folders });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/folders ─────────────────────────────────
router.post('/folders', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            parentId: z.string().optional(),
            scope: z.enum(['GLOBAL', 'ORG']).default('ORG').optional(),
        });
        const body = schema.parse(req.body);

        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        let depth = 0;
        let path = '';

        if (body.parentId) {
            const parent = await prisma.qBankFolder.findUniqueOrThrow({ where: { id: body.parentId } });
            depth = parent.depth + 1;
            if (depth >= 10) throw new AppError('Maximum folder depth (10) reached', 400);
            path = `${parent.path}/${parent.id}`;
        } else {
            path = '/';
        }

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        const finalScope = (isSuperAdmin && body.scope === 'GLOBAL') ? 'GLOBAL' : 'ORG';

        const folder = await prisma.qBankFolder.create({
            data: {
                orgId: finalScope === 'GLOBAL' ? null : org.id,
                name: body.name,
                parentId: body.parentId,
                path,
                depth,
                scope: finalScope,
            },
        });

        res.status(201).json({ success: true, data: folder });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/folders/:id ────────────────────────────
router.patch('/folders/:id', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1).optional(),
            scope: z.enum(['GLOBAL', 'ORG']).optional(),
        });
        const body = schema.parse(req.body);

        const folder = await prisma.qBankFolder.findUnique({ where: { id: req.params.id } });
        if (!folder) throw new AppError('Folder not found', 404);

        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        // Permission check
        if (!isSuperAdmin && folder.orgId !== org?.id) {
            throw new AppError('Unauthorized: You can only edit your own folders', 403);
        }

        const data: any = {};
        if (body.name) data.name = body.name;
        if (body.scope && isSuperAdmin) data.scope = body.scope;

        const updated = await prisma.qBankFolder.update({
            where: { id: req.params.id },
            data,
        });

        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/folders/:id ────────────────────────────
router.delete('/folders/:id', async (req, res, next) => {
    try {
        const folder = await prisma.qBankFolder.findUnique({
            where: { id: req.params.id },
            include: { _count: { select: { children: true, questions: true } } }
        });
        if (!folder) throw new AppError('Folder not found', 404);

        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        // Permission check
        if (!isSuperAdmin && folder.orgId !== org?.id) {
            throw new AppError('Unauthorized: You can only delete your own folders', 403);
        }

        // Check if empty
        if (folder._count.children > 0 || folder._count.questions > 0) {
            throw new AppError('Cannot delete folder: It is not empty (contains sub-folders or questions)', 400);
        }

        await prisma.qBankFolder.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Folder deleted' });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/dashboard ────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        // 1. Basic Stats
        const [totalQuestions, publicQuestions, setMapCount] = await Promise.all([
            prisma.question.count({ where: isSuperAdmin ? {} : { orgId: org?.id } }),
            prisma.question.count({ where: { isGlobal: true } }),
            prisma.questionSet.count({ where: isSuperAdmin ? {} : { orgId: org?.id } }),
        ]);

        // 2. Questions by Subject (Root folders)
        const rootFolders = await prisma.qBankFolder.findMany({
            where: { depth: 0, isActive: true },
            select: { id: true, name: true }
        });

        const bySubject = await Promise.all(rootFolders.map(async (folder) => {
            const count = await prisma.question.count({
                where: {
                    OR: [
                        { folderId: folder.id },
                        { folder: { path: { contains: folder.id } } }
                    ],
                    ...(isSuperAdmin ? {} : { orgId: org?.id })
                }
            });
            return { subject: folder.name, questions: count };
        }));

        // 3. Usage Trend (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        const usageTrend = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await prisma.studentQuestionHistory.count({
                where: {
                    lastAttemptAt: {
                        gte: date,
                        lt: nextDay
                    },
                    ...(isSuperAdmin ? {} : { orgId: org?.id })
                }
            });
            return { day: date.toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit' }), usage: count };
        }));

        // 4. Recent Usage
        const recentHistory = await prisma.studentQuestionHistory.findMany({
            where: isSuperAdmin ? {} : { orgId: org?.id },
            take: 5,
            orderBy: { lastAttemptAt: 'desc' },
            include: {
                question: { select: { textEn: true, textHi: true } },
                student: { select: { name: true, org: { select: { name: true } } } }
            }
        });

        const recentUsage = recentHistory.map(h => ({
            id: h.id,
            question: h.question.textEn || h.question.textHi || 'Untitled Question',
            org: h.student.org.name,
            teacher: 'System',
            date: h.lastAttemptAt?.toLocaleDateString('en-IN') || 'N/A',
            points: 1
        }));

        res.json({
            success: true,
            data: {
                totalQuestions,
                newQuestions: 0,
                publicQuestions,
                newPublic: 0,
                totalSets: setMapCount,
                newSets: 0,
                totalPoints: 0,
                newPoints: 0,
                bySubject,
                usageTrend,
                recentUsage
            }
        });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/sets ─────────────────────────────────────
router.get('/sets', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const sets = await prisma.questionSet.findMany({
            where: isSuperAdmin ? {} : { orgId: org?.id },
            include: { _count: { select: { items: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const formattedSets = sets.map(s => ({
            id: s.id,
            name: s.name,
            code: s.setId,
            password: s.pin,
            subject: 'Multiple',
            questions: s._count.items,
            visibility: 'org_only',
            usedBy: 0,
            created: s.createdAt.toLocaleDateString('en-IN')
        }));

        res.json({ success: true, data: { sets: formattedSets, total: sets.length } });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/usage-logs ───────────────────────────────
router.get('/usage-logs', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const history = await prisma.studentQuestionHistory.findMany({
            where: isSuperAdmin ? {} : { orgId: org?.id },
            orderBy: { lastAttemptAt: 'desc' },
            include: {
                question: { select: { textEn: true, textHi: true, type: true } },
                student: { select: { name: true, org: { select: { name: true } } } }
            }
        });

        const logs = history.map(h => ({
            id: h.id,
            question: h.question.textEn || h.question.textHi || 'Untitled Question',
            type: h.question.type.toLowerCase().includes('mcq') ? 'question' : 'set',
            org: h.student.org.name,
            user: h.student.name,
            points: 1,
            balanceAfter: 0,
            usedAt: h.lastAttemptAt?.toLocaleString('en-IN') || 'N/A'
        }));

        res.json({ success: true, data: logs });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/questions ────────────────────────────────
router.get('/questions', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, folderId, difficulty, type, search, scope = 'all', filters, groupBy } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            deletedAt: null,
        };

        if (scope === 'global') {
            where.isGlobal = true;
        } else if (scope === 'public') {
            where.isApproved = true;
            where.isGlobal = false;
            where.orgId = { not: org?.id };
        } else if (scope === 'mine') {
            where.orgId = org?.id;
        } else {
            where.OR = [
                { isGlobal: true },
                { orgId: org?.id },
                { isApproved: true, isGlobal: false }
            ];
        }

        if (folderId) where.folderId = folderId;
        if (difficulty && difficulty !== 'all') where.difficulty = difficulty;
        if (type && type !== 'all') where.type = type;
        if (search) {
            where.OR = [
                { textEn: { contains: search as string, mode: 'insensitive' } },
                { textHi: { contains: search as string, mode: 'insensitive' } },
                { questionId: { contains: search as string } },
            ];
        }

        // Dynamic filters (Airtable-style)
        if (filters && typeof filters === 'string') {
            try {
                const parsedFilters = JSON.parse(filters);
                if (Array.isArray(parsedFilters)) {
                    parsedFilters.forEach((f: any) => {
                        if (!f.field) return;

                        const numFields = ['year', 'syncCode', 'pointCost', 'usageCount', 'questionUniqueId'];

                        if (f.operator === 'isEmpty') {
                            // Prisma treats null and "" differently, but for simplicity we check null
                            where[f.field] = null;
                        } else if (f.operator === 'isNotEmpty') {
                            where[f.field] = { not: null };
                        } else if (f.value !== undefined && f.value !== '') {
                            let val = f.value;
                            if (numFields.includes(f.field)) val = Number(val);

                            if (f.operator === 'equals' || !f.operator) {
                                where[f.field] = val;
                            } else if (f.operator === 'not_equals') {
                                where[f.field] = { not: val };
                            } else if (f.operator === 'contains') {
                                where[f.field] = { contains: String(val), mode: 'insensitive' };
                            } else if (f.operator === 'doesNotContain') {
                                where[f.field] = { not: { contains: String(val), mode: 'insensitive' } };
                            } else if (f.operator === 'startsWith') {
                                where[f.field] = { startsWith: String(val), mode: 'insensitive' };
                            } else if (f.operator === 'endsWith') {
                                where[f.field] = { endsWith: String(val), mode: 'insensitive' };
                            }
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to parse filters param:", e);
            }
        }

        const orderBy: any = [];
        if (groupBy && typeof groupBy === 'string' && groupBy !== 'none') {
            orderBy.push({ [groupBy]: 'asc' });
        }
        orderBy.push({ createdAt: 'desc' });

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip,
                take: Number(limit),
                include: { options: true, folder: { select: { id: true, name: true } } },
                orderBy,
            }),
            prisma.question.count({ where }),
        ]);

        res.json({ success: true, data: { questions, total } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions ───────────────────────────────
router.post('/questions', async (req, res, next) => {
    try {
        const optionSchema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            imageUrl: z.string().optional(),
            isCorrect: z.boolean().default(false),
            sortOrder: z.number().default(0),
        });

        const schema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            explanationEn: z.string().optional(),
            explanationHi: z.string().optional(),
            type: z.enum(['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'DESCRIPTIVE']).default('MCQ_SINGLE'),
            difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
            folderId: z.string().optional(),
            topicId: z.string().optional(),
            tags: z.array(z.string()).default([]),
            imageUrl: z.string().optional(),
            visibility: z.string().default('private'),
            isGlobal: z.boolean().default(false),
            options: z.array(optionSchema).default([]),
        });

        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        // Generate Question ID: GK-Q-XXXXXXX (Use global count + timestamp fraction for uniqueness)
        const globalCount = await prisma.question.count();
        const questionId = `GK-Q-${String(globalCount + 1).padStart(7, '0')}`;

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        const isGlobal = isSuperAdmin && body.isGlobal;
        const isApproved = isGlobal || body.visibility === 'public'; // If made public, mark as approved

        const question = await prisma.question.create({
            data: {
                questionId,
                orgId: isGlobal ? null : org.id,
                isGlobal,
                isApproved,
                textEn: body.textEn,
                textHi: body.textHi,
                explanationEn: body.explanationEn,
                explanationHi: body.explanationHi,
                type: body.type,
                difficulty: body.difficulty,
                folderId: body.folderId,
                topicId: body.topicId,
                tags: body.tags,
                imageUrl: body.imageUrl,
                options: { create: body.options },
            },
            include: { options: true },
        });

        res.status(201).json({ success: true, data: question });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/questions/:id ────────────────────────────
router.get('/questions/:id', async (req, res, next) => {
    try {
        const question = await prisma.question.findUnique({
            where: { id: req.params.id },
            include: { options: true, folder: { select: { id: true, name: true } } },
        });
        if (!question) throw new AppError('Question not found', 404);

        // Return without org check for Super Admin or if it's public. Otherwise enforce org check.
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin && !question.isGlobal && !question.isApproved && question.orgId !== org?.id) {
            throw new AppError('Unauthorized access', 403);
        }

        res.json({ success: true, data: question });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/questions/:id ──────────────────────────
router.patch('/questions/:id', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const question = await prisma.question.findUnique({ where: { id: req.params.id } });
        if (!question) throw new AppError('Question not found', 404);

        // Permission Check: Super Admin can edit all. Org can only edit their own.
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin && question.orgId !== org?.id) {
            throw new AppError('Unauthorized: Only the creator can edit this question', 403);
        }

        const optionSchema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            imageUrl: z.string().optional(),
            isCorrect: z.boolean().default(false),
            sortOrder: z.number().default(0),
        });

        const schema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            explanationEn: z.string().optional(),
            explanationHi: z.string().optional(),
            type: z.enum(['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'DESCRIPTIVE']).optional(),
            difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
            folderId: z.string().optional(),
            topicId: z.string().optional(),
            tags: z.array(z.string()).optional(),
            imageUrl: z.string().optional(),
            visibility: z.string().optional(),
            isGlobal: z.boolean().optional(),
            options: z.array(optionSchema).optional(),
            isApproved: z.boolean().optional(),
        });

        const body = schema.parse(req.body);

        let isApproved = question.isApproved;
        let isGlobal = question.isGlobal;
        if (body.visibility === 'public') isApproved = true;
        if (body.visibility === 'private') isApproved = false;
        if (body.isGlobal !== undefined) isGlobal = body.isGlobal;
        if (body.isApproved !== undefined) isApproved = body.isApproved;

        const updateData: any = {
            textEn: body.textEn,
            textHi: body.textHi,
            explanationEn: body.explanationEn,
            explanationHi: body.explanationHi,
            type: body.type,
            difficulty: body.difficulty,
            folderId: body.folderId,
            topicId: body.topicId,
            tags: body.tags,
            imageUrl: body.imageUrl,
            isGlobal,
            isApproved,
        };

        if (body.options) {
            updateData.options = {
                deleteMany: {},
                create: body.options
            };
        }

        const updated = await prisma.question.update({
            where: { id: req.params.id },
            data: updateData,
            include: { options: true },
        });
        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/questions/:id ──────────────────────────
router.delete('/questions/:id', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const question = await prisma.question.findUnique({ where: { id: req.params.id } });
        if (!question) throw new AppError('Question not found', 404);

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin && question.orgId !== org?.id) {
            throw new AppError('Unauthorized: Only the creator can delete this question', 403);
        }

        await prisma.question.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Question deleted' });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/questions (Bulk) ───────────────────────
router.delete('/questions', async (req, res, next) => {
    try {
        const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (isSuperAdmin) {
            await prisma.question.deleteMany({ where: { id: { in: ids } } });
        } else {
            await prisma.question.deleteMany({
                where: {
                    id: { in: ids },
                    orgId: org?.id
                }
            });
        }
        res.json({ success: true, message: 'Requested questions deleted (if authorized)' });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/bulk-upload ─────────────────────────────
// (Consolidated logic below at line 639)

// ─── GET /api/qbank/sets ─────────────────────────────────────
router.get('/sets', async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const skip = (Number(page) - 1) * Number(limit);

        const [sets, total] = await Promise.all([
            prisma.questionSet.findMany({
                where: { orgId: org!.id },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { items: true } } },
            }),
            prisma.questionSet.count({ where: { orgId: org!.id } }),
        ]);

        res.json({ success: true, data: { sets, total } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/sets ────────────────────────────────────
router.post('/sets', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            durationMins: z.number().optional(),
            questionIds: z.array(z.string()).default([]),
        });
        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        // Generate 6-digit Set ID
        const setId = String(Math.floor(100000 + Math.random() * 900000));
        const pin = String(Math.floor(100000 + Math.random() * 900000));

        const set = await prisma.questionSet.create({
            data: {
                setId,
                pin,
                orgId: org.id,
                name: body.name,
                description: body.description,
                durationMins: body.durationMins,
                totalQuestions: body.questionIds.length,
                items: {
                    create: body.questionIds.map((qId, idx) => ({
                        questionId: qId,
                        sortOrder: idx,
                    })),
                },
            },
            include: { items: true },
        });

        res.status(201).json({ success: true, data: set });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/sets/:id ─────────────────────────────────
router.get('/sets/:id', async (req, res, next) => {
    try {
        const set = await prisma.questionSet.findUniqueOrThrow({
            where: { id: req.params.id },
            include: { items: { include: { question: { include: { options: true } } } } },
        });
        res.json({ success: true, data: set });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/sets/:id ──────────────────────────────
router.delete('/sets/:id', async (req, res, next) => {
    try {
        await prisma.questionSet.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Set deleted' });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/sets (Bulk) ───────────────────────────
router.delete('/sets', async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new AppError('An array of ids is required', 400);
        }

        // Ideally check permissions here if sets belong to specific users
        // For now, assuming super admin/org admin bulk action
        await prisma.questionSet.deleteMany({ where: { id: { in: ids } } });
        res.json({ success: true, message: 'Requested sets deleted' });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/bulk-upload ─────────────────────────────
router.post('/bulk-upload', async (req, res, next) => {
    try {
        const rowSchema = z.object({
            question_eng: z.string().optional().nullable(),
            question_hin: z.string().optional().nullable(),
            type: z.string().optional().default('mcq'),
            subject: z.string().optional().nullable(),
            chapter: z.string().optional().nullable(),
            difficulty: z.string().optional().default('medium'),
            option1_eng: z.string().optional().nullable(),
            option1_hin: z.string().optional().nullable(),
            option2_eng: z.string().optional().nullable(),
            option2_hin: z.string().optional().nullable(),
            option3_eng: z.string().optional().nullable(),
            option3_hin: z.string().optional().nullable(),
            option4_eng: z.string().optional().nullable(),
            option4_hin: z.string().optional().nullable(),
            option5_eng: z.string().optional().nullable(),
            option5_hin: z.string().optional().nullable(),
            answer: z.enum(['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4', '5']).or(z.string()).optional(),
            solution_eng: z.string().optional().nullable(),
            solution_hin: z.string().optional().nullable(),
            // Rich Schema Fields
            record_id: z.string().optional().nullable(),
            question_unique_id: z.union([z.number(), z.string()]).optional().nullable(),
            collection: z.string().optional().nullable(),
            previous_of: z.string().optional().nullable(),
            exam: z.string().optional().nullable(),
            year: z.union([z.number(), z.string()]).optional().nullable(),
            video: z.string().optional().nullable(),
            section: z.string().optional().nullable(),
            date: z.string().optional().nullable(),
            airtable_table_name: z.string().optional().nullable(),
            action: z.string().optional().nullable(),
            current_status: z.string().optional().nullable(),
            sync_code: z.union([z.number(), z.string()]).optional().nullable(),
        });

        const schema = z.object({
            fileName: z.string(),
            rows: z.array(z.any()),
        });

        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        // 1. Create Batch
        const batchId = `UL-${String(Date.now()).slice(-8)}`;
        const batch = await prisma.bulkUploadBatch.create({
            data: {
                batchId,
                orgId: org.id,
                uploadFileName: body.fileName,
                uploadFileType: body.fileName.split('.').pop(),
                totalRowsFound: body.rows.length,
                totalFailedRows: 0,
                uploadStatus: 'Processing',
            },
        });

        let savedCount = 0;
        let failedCount = 0;
        const failedRows = [];

        // 2. Process rows
        for (let i = 0; i < body.rows.length; i++) {
            try {
                const row = body.rows[i];
                const parsedRow = rowSchema.parse(row);

                // Better Unique ID Generation for bulk upload
                // Using a combination of timestamp + random to avoid collisions
                const uniqueSuffix = Math.random().toString(36).substring(2, 7);
                const questionId = `GK-Q-${Date.now().toString().slice(-6)}${uniqueSuffix}`;

                let qType: any = 'MCQ_SINGLE';
                if (parsedRow.type?.toLowerCase() === 'integer') qType = 'FILL_IN_BLANK';
                if (parsedRow.type?.toLowerCase() === 'true_false') qType = 'TRUE_FALSE';

                let qDiff: any = 'MEDIUM';
                const d = parsedRow.difficulty?.toUpperCase();
                if (d === 'EASY') qDiff = 'EASY';
                else if (d === 'HARD') qDiff = 'HARD';

                // Find or create subject folder (depth 0)
                const subjectName = parsedRow.subject || 'Uncategorized';
                let subjectFolder = await prisma.qBankFolder.findFirst({
                    where: { name: subjectName, depth: 0, orgId: org.id }
                });
                if (!subjectFolder) {
                    subjectFolder = await prisma.qBankFolder.create({
                        data: {
                            name: subjectName,
                            depth: 0,
                            path: '/',
                            scope: 'ORG',
                            orgId: org.id
                        }
                    });
                }

                // Find or create chapter folder (depth 1)
                const chapterName = parsedRow.chapter || 'Section 1';
                let chapterFolder = await prisma.qBankFolder.findFirst({
                    where: { name: chapterName, parentId: subjectFolder.id, depth: 1 }
                });
                if (!chapterFolder) {
                    chapterFolder = await prisma.qBankFolder.create({
                        data: {
                            name: chapterName,
                            depth: 1,
                            path: `/${subjectFolder.id}`,
                            parentId: subjectFolder.id,
                            scope: 'ORG',
                            orgId: org.id
                        }
                    });
                }

                // Prepare options array (handles up to 5)
                const options = [];
                const optRows = [
                    { en: parsedRow.option1_eng, hi: parsedRow.option1_hin, val: '1', char: 'A' },
                    { en: parsedRow.option2_eng, hi: parsedRow.option2_hin, val: '2', char: 'B' },
                    { en: parsedRow.option3_eng, hi: parsedRow.option3_hin, val: '3', char: 'C' },
                    { en: parsedRow.option4_eng, hi: parsedRow.option4_hin, val: '4', char: 'D' },
                    { en: parsedRow.option5_eng, hi: parsedRow.option5_hin, val: '5', char: 'E' },
                ];

                for (let idx = 0; idx < optRows.length; idx++) {
                    const o = optRows[idx];
                    if (o.en || o.hi) {
                        const isCorrect =
                            parsedRow.answer === o.char ||
                            parsedRow.answer === o.val ||
                            parsedRow.answer === o.en ||
                            parsedRow.answer === o.hi;

                        options.push({
                            textEn: o.en || null,
                            textHi: o.hi || null,
                            isCorrect: isCorrect || false,
                            sortOrder: idx
                        });
                    }
                }

                await prisma.question.create({
                    data: {
                        questionId,
                        orgId: org.id,
                        folderId: chapterFolder.id,
                        textEn: parsedRow.question_eng || null,
                        textHi: parsedRow.question_hin || null,
                        explanationEn: parsedRow.solution_eng || null,
                        explanationHi: parsedRow.solution_hin || null,
                        type: qType,
                        difficulty: qDiff,
                        isApproved: true,
                        // --- Rich Schema Fields ---
                        recordId: parsedRow.record_id || null,
                        questionUniqueId: parsedRow.question_unique_id ? Number(parsedRow.question_unique_id) : null,
                        subjectName: parsedRow.subject || null,
                        chapterName: parsedRow.chapter || null,
                        collection: parsedRow.collection || null,
                        previousOf: parsedRow.previous_of || null,
                        exam: parsedRow.exam || "SSC CGL",
                        year: parsedRow.year ? Number(parsedRow.year) : null,
                        videoUrl: parsedRow.video || null,
                        currentStatus: parsedRow.current_status || "UPDATED",
                        syncCode: parsedRow.sync_code ? Number(parsedRow.sync_code) : 2,
                        section: parsedRow.section || null,
                        date: parsedRow.date || null,
                        airtableTableName: parsedRow.airtable_table_name || null,
                        action: parsedRow.action || null,
                        options: {
                            create: options,
                        },
                    },
                });
                savedCount++;
            } catch (err: any) {
                failedCount++;
                failedRows.push({
                    batchInternalId: batch.id,
                    rowNumber: i + 1,
                    rawQuestionText: String(body.rows[i].question_eng || body.rows[i].question_hin || 'Error').substring(0, 100),
                    errorMessage: err.message || 'Validation failed',
                });
            }
        }

        // 3. Log errors
        if (failedRows.length > 0) {
            await prisma.bulkUploadRow.createMany({ data: failedRows });
        }

        // 4. Update Batch
        await prisma.bulkUploadBatch.update({
            where: { id: batch.id },
            data: {
                totalQuestionsSaved: savedCount,
                totalFailedRows: failedCount,
                uploadStatus: 'Completed',
            },
        });

        res.json({
            success: true,
            data: { batchId, savedCount, failedCount },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/taxonomy ─────────────────────────────────
router.get('/taxonomy', async (req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                OR: [
                    { orgId: null },
                    { orgId: (await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } }))?.id }
                ]
            },
            include: {
                chapters: {
                    include: {
                        topics: true
                    }
                }
            }
        });
        res.json({ success: true, data: subjects });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/usage-logs ───────────────────────────────
router.get('/usage-logs', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });
        const logs = await prisma.studentQuestionHistory.findMany({
            where: { orgId: org.id },
            include: {
                student: { select: { id: true, name: true } },
                question: { select: { id: true, textEn: true, textHi: true } }
            },
            take: 100,
            orderBy: { updatedAt: 'desc' }
        });

        // Calculate stats
        const totalAttempts = logs.reduce((acc, log) => acc + log.attemptCount, 0);
        const correctRate = logs.length > 0
            ? (logs.reduce((acc, log) => acc + log.correctCount, 0) / totalAttempts) * 100
            : 0;

        res.json({
            success: true,
            data: {
                logs: logs.map(l => ({
                    id: l.id,
                    question: l.question.textEn || l.question.textHi,
                    org: org.name,
                    teacher: 'System', // Placeholder
                    date: l.lastAttemptAt?.toLocaleDateString() || l.updatedAt.toLocaleDateString(),
                    points: 10, // Placeholder
                    status: l.lastResult === 'correct' ? 'success' : 'failed'
                })),
                stats: {
                    totalUsage: totalAttempts,
                    avgCorrectRate: Math.round(correctRate),
                    activeTeachers: 1,
                    pointsGenerated: totalAttempts * 10
                }
            }
        });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/dashboard ────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        const [totalQuestions, publicQuestions, totalSets, totalPoints] = await Promise.all([
            prisma.question.count({ where: { orgId: org.id } }),
            prisma.question.count({ where: { isGlobal: true } }),
            prisma.questionSet.count({ where: { orgId: org.id } }),
            prisma.studentQuestionHistory.aggregate({
                where: { orgId: org.id },
                _sum: { correctCount: true } // Just an example
            })
        ]);

        res.json({
            success: true,
            data: {
                totalQuestions,
                newQuestions: 0,
                publicQuestions,
                newPublic: 0,
                totalSets,
                newSets: 0,
                totalPoints: (totalPoints._sum.correctCount || 0) * 10,
                newPoints: 0,
                bySubject: [], // Could implement if needed
                usageTrend: [],
                recentUsage: []
            }
        });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions/:id/report ───────────────────
router.post('/questions/:id/report', async (req, res, next) => {
    try {
        const schema = z.object({
            reason: z.string(),
            description: z.string().optional(),
        });
        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });

        const report = await prisma.questionReport.create({
            data: {
                questionId: req.params.id,
                reporterId: org?.id || req.user!.orgId,
                reporterName: org?.name || 'Staff',
                reason: body.reason,
                description: body.description,
            },
        });

        res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/reports ──────────────────────────────────
router.get('/reports', async (req, res, next) => {
    try {
        const { status } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const where: any = {};
        if (status) where.status = status;

        if (!isSuperAdmin) {
            // Org only sees reports for THEIR questions
            where.question = { orgId: org?.id };
        }

        const reports = await prisma.questionReport.findMany({
            where,
            include: {
                question: {
                    select: {
                        id: true,
                        questionId: true,
                        textEn: true,
                        textHi: true,
                        orgId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: reports });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/reports/:id ────────────────────────────
router.patch('/reports/:id', async (req, res, next) => {
    try {
        const schema = z.object({
            status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']),
        });
        const body = schema.parse(req.body);

        const report = await prisma.questionReport.update({
            where: { id: req.params.id },
            data: { status: body.status },
        });

        res.json({ success: true, data: report });
    } catch (err) { next(err); }
});

export default router;
