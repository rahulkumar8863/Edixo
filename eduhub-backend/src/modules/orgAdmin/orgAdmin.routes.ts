import { Router } from 'express';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();
router.use(authenticate, requireOrgAccess);

// GET /api/org-admin/dashboard
router.get('/dashboard', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.user!.orgId },
            include: { featureFlags: true, personalizationSettings: true },
        });
        if (!org) return res.status(404).json({ success: false, message: 'Org not found' });

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            studentCount,
            staffCount,
            pendingFees,
            recentStudents,
            monthlyRevenue,
            testAttemptCount,
            customQuestionCount,
            batchCount
        ] = await Promise.all([
            prisma.student.count({ where: { orgId: org.id, isActive: true } }),
            prisma.orgStaff.count({ where: { orgId: org.id, isActive: true } }),
            prisma.feeTransaction.aggregate({
                where: { orgId: org.id, status: 'PENDING' },
                _sum: { amount: true },
            }),
            prisma.student.findMany({
                where: { orgId: org.id },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, studentId: true, name: true, createdAt: true, email: true }
            }),
            prisma.feeTransaction.aggregate({
                where: {
                    orgId: org.id,
                    status: 'PAID',
                    paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                },
                _sum: { amount: true }
            }),
            prisma.testAttempt.count({
                where: {
                    student: { orgId: org.id },
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            prisma.question.count({ where: { orgId: org.id } }),
            prisma.batch.count({ where: { orgId: org.id } })
        ]);

        res.json({
            success: true,
            data: {
                org: {
                    orgId: org.orgId, name: org.name, plan: org.plan,
                    status: org.status, aiCredits: org.aiCredits,
                    logoUrl: org.logoUrl, primaryColor: org.primaryColor,
                },
                stats: {
                    studentCount,
                    staffCount,
                    pendingFees: pendingFees._sum.amount || 0,
                    monthlyRevenue: monthlyRevenue._sum.amount || 0,
                    testAttemptCount,
                    customQuestionCount,
                    batchCount
                },
                recentAdmissions: recentStudents,
                features: Object.fromEntries(org.featureFlags.map(f => [f.key, f.value])),
            },
        });
    } catch (err) { next(err); }
});

export default router;
