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

        const folder = await prisma.qBankFolder.create({
            data: {
                orgId: org.id,
                name: body.name,
                parentId: body.parentId,
                path,
                depth,
                scope: 'ORG',
            },
        });

        res.status(201).json({ success: true, data: folder });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/questions ────────────────────────────────
router.get('/questions', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, folderId, difficulty, type, search } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            deletedAt: null,
            OR: [
                { isGlobal: true },
                { orgId: org?.id },
            ],
        };
        if (folderId) where.folderId = folderId;
        if (difficulty) where.difficulty = difficulty;
        if (type) where.type = type;
        if (search) where.OR = [
            { textEn: { contains: search as string, mode: 'insensitive' } },
            { textHi: { contains: search as string, mode: 'insensitive' } },
            { questionId: { contains: search as string } },
        ];

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip,
                take: Number(limit),
                include: { options: true, folder: { select: { id: true, name: true } } },
                orderBy: { createdAt: 'desc' },
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
            options: z.array(optionSchema).default([]),
        });

        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        // Generate Question ID: GK-Q-XXXXXXX (7 digits)
        const count = await prisma.question.count({ where: { orgId: org.id } });
        const questionId = `GK-Q-${String(count + 1).padStart(7, '0')}`;

        const question = await prisma.question.create({
            data: {
                questionId,
                orgId: org.id,
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

export default router;
