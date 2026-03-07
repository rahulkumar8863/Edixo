import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authenticate, requireSuperAdmin } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate, requireSuperAdmin);

// ─── GET /api/super-admin/dashboard ─────────────────────────
router.get('/dashboard', async (_req, res, next) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalOrgs, activeOrgs, trialOrgs, suspendedOrgs,
            totalStudents, totalStaff,
            testAttemptCount, globalQuestionCount,
            activeUserCount
        ] = await Promise.all([
            prisma.organization.count({ where: { deletedAt: null } }),
            prisma.organization.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            prisma.organization.count({ where: { status: 'TRIAL', deletedAt: null } }),
            prisma.organization.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
            prisma.student.count({ where: { isActive: true } }),
            prisma.orgStaff.count({ where: { isActive: true } }),
            prisma.testAttempt.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.question.count({ where: { orgId: null } }), // Global questions
            prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
        ]);

        // Monthly Recurring Revenue (MRR) calculation based on plans
        // SMALL: 5000, MEDIUM: 15000, LARGE: 40000, ENTERPRISE: 100000 (Mock values for calculation)
        const planRates: Record<string, number> = {
            SMALL: 5000,
            MEDIUM: 15000,
            LARGE: 40000,
            ENTERPRISE: 100000
        };

        const activeOrgsList = await prisma.organization.findMany({
            where: { status: 'ACTIVE', deletedAt: null },
            select: { plan: true }
        });

        const mrr = activeOrgsList.reduce((acc, org) => acc + (planRates[org.plan] || 0), 0);

        // Plan Distribution
        const planDistribution = await prisma.organization.groupBy({
            by: ['plan'],
            where: { deletedAt: null },
            _count: { _all: true }
        });

        // Trial expiring soon (next 3 days)
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const trialExpiringSoon = await prisma.organization.findMany({
            where: {
                status: 'TRIAL',
                trialEndsAt: { lte: threeDaysFromNow },
                deletedAt: null,
            },
            select: { orgId: true, name: true, trialEndsAt: true },
            take: 10,
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalOrgs,
                    activeOrgs,
                    trialOrgs,
                    suspendedOrgs,
                    totalStudents,
                    totalStaff,
                    mrr,
                    testAttemptCount,
                    globalQuestionCount,
                    activeUserCount
                },
                planDistribution: planDistribution.map(p => ({
                    name: p.plan,
                    value: p._count._all
                })),
                alerts: { trialExpiringSoon },
            },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations ─────────────────────
router.get('/organizations', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, status, plan } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };
        if (search) where.OR = [
            { name: { contains: search as string, mode: 'insensitive' } },
            { orgId: { contains: search as string, mode: 'insensitive' } },
        ];
        if (status) where.status = status;
        if (plan) where.plan = plan;

        const [orgs, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, orgId: true, name: true, plan: true,
                    status: true, billingCycle: true, trialEndsAt: true,
                    studentCount: true, staffCount: true, aiCredits: true,
                    createdAt: true, city: true, state: true,
                },
            }),
            prisma.organization.count({ where }),
        ]);

        res.json({
            success: true,
            data: { orgs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId ──────────────
router.get('/organizations/:orgId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
            include: {
                featureFlags: true,
                personalizationSettings: true,
            },
        });
        if (!org) throw new AppError('Organization not found', 404);

        const [studentCount, staffCount, testAttemptCount] = await Promise.all([
            prisma.student.count({ where: { orgId: org.id, isActive: true } }),
            prisma.orgStaff.count({ where: { orgId: org.id, isActive: true } }),
            prisma.testAttempt.count({ where: { student: { orgId: org.id } } }),
        ]);

        res.json({
            success: true,
            data: {
                ...org,
                _count: {
                    students: studentCount,
                    staff: staffCount,
                    testAttempts: testAttemptCount,
                }
            },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/staff ────────
router.get('/organizations/:orgId/staff', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const staff = await prisma.orgStaff.findMany({
            where: { orgId: org.id },
            include: { user: { select: { lastLoginAt: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: staff });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/students ─────
router.get('/organizations/:orgId/students', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const students = await prisma.student.findMany({
            where: { orgId: org.id },
            include: { user: { select: { lastLoginAt: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ success: true, data: students });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/audit ────────
router.get('/organizations/:orgId/audit', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const audit = await prisma.orgAuditLog.findMany({
            where: { orgId: org.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json({ success: true, data: audit });
    } catch (err) { next(err); }
});

// ─── POST /api/super-admin/organizations ────────────────────
router.post('/organizations', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            plan: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).default('SMALL'),
            billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
            adminEmail: z.string().email(),
            adminPassword: z.string().min(8),
            trialDays: z.number().default(30),
        });
        const body = schema.parse(req.body);

        // Generate Org ID: GK-ORG-XXXXX (sequential)
        const count = await prisma.organization.count();
        const orgId = `GK-ORG-${String(count + 1).padStart(5, '0')}`;

        const passwordHash = await bcrypt.hash(body.adminPassword, 12);
        const trialEndsAt = new Date(Date.now() + body.trialDays * 24 * 60 * 60 * 1000);

        // AI credits by plan
        const planCredits: Record<string, number> = {
            SMALL: 500, MEDIUM: 2000, LARGE: 8000, ENTERPRISE: 999999
        };

        const [org] = await prisma.$transaction(async (tx) => {
            const newOrg = await tx.organization.create({
                data: {
                    orgId,
                    name: body.name,
                    email: body.email,
                    mobile: body.mobile,
                    plan: body.plan,
                    billingCycle: body.billingCycle,
                    status: 'TRIAL',
                    trialEndsAt,
                    aiCredits: planCredits[body.plan],
                    orgAdminEmail: body.adminEmail,
                    orgAdminPassword: passwordHash,
                },
            });

            // Create org admin user
            const user = await tx.user.create({
                data: { email: body.adminEmail, passwordHash, role: 'ORG_STAFF' },
            });

            const staffCount = await tx.orgStaff.count({ where: { orgId: newOrg.id } });
            const staffId = `GK-TCH-${String(staffCount + 1).padStart(5, '0')}`;

            await tx.orgStaff.create({
                data: {
                    staffId,
                    userId: user.id,
                    orgId: newOrg.id,
                    name: 'Org Admin',
                    email: body.adminEmail,
                    role: 'ORG_ADMIN',
                },
            });

            // Default feature flags
            await tx.orgFeatureFlag.createMany({
                data: [
                    { orgId: newOrg.id, key: 'ai_question_generation', value: false },
                    { orgId: newOrg.id, key: 'pdf_extraction', value: true },
                    { orgId: newOrg.id, key: 'video_recordings', value: false },
                    { orgId: newOrg.id, key: 'advanced_analytics', value: false },
                    { orgId: newOrg.id, key: 'whatsapp_bot', value: false },
                    { orgId: newOrg.id, key: 'razorpay_integration', value: false },
                ],
            });

            // Default personalization settings
            await tx.orgPersonalizationSettings.create({
                data: { orgId: newOrg.id },
            });

            return [newOrg];
        });

        res.status(201).json({ success: true, data: org, message: `Organization ${orgId} created` });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId/status ─────
router.patch('/organizations/:orgId/status', async (req, res, next) => {
    try {
        const { status } = z.object({
            status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED']),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.organization.update({
            where: { id: org.id },
            data: { status },
        });

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) { next(err); }
});

// ─── POST /api/super-admin/organizations/:orgId/ai-credits ──
router.post('/organizations/:orgId/ai-credits', async (req, res, next) => {
    try {
        const { amount, description } = z.object({
            amount: z.number(),
            description: z.string().optional(),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.$transaction([
            prisma.organization.update({
                where: { id: org.id },
                data: { aiCredits: { increment: amount } },
            }),
            prisma.aiCreditTransaction.create({
                data: {
                    orgId: org.id,
                    action: 'topup',
                    credits: amount,
                    description: description || 'Super Admin topup',
                },
            }),
        ]);

        res.json({ success: true, message: `${amount} AI credits added` });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/feature-flags 
router.get('/organizations/:orgId/feature-flags', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId },
            include: { featureFlags: true },
        });
        if (!org) throw new AppError('Organization not found', 404);
        res.json({ success: true, data: org.featureFlags });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId/feature-flags
router.patch('/organizations/:orgId/feature-flags', async (req, res, next) => {
    try {
        const { key, value } = z.object({
            key: z.string(),
            value: z.boolean(),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.orgFeatureFlag.upsert({
            where: { orgId_key: { orgId: org.id, key } },
            update: { value },
            create: { orgId: org.id, key, value },
        });

        res.json({ success: true, message: `Feature flag "${key}" set to ${value}` });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/users ─────────────────────────────
router.get('/users', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { mobile: { contains: search as string, mode: 'insensitive' } },
                { student: { name: { contains: search as string, mode: 'insensitive' } } },
                { orgStaff: { name: { contains: search as string, mode: 'insensitive' } } },
            ];
        }
        if (role) where.role = role;
        if (status) where.isActive = status === 'ACTIVE';

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    student: { select: { name: true, studentId: true, org: { select: { name: true, orgId: true } } } },
                    orgStaff: { select: { name: true, staffId: true, org: { select: { name: true, orgId: true } } } },
                },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) { next(err); }
});

export default router;
