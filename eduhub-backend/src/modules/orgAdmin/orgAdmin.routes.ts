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

        const [studentCount, staffCount, pendingFees] = await Promise.all([
            prisma.student.count({ where: { orgId: org.id, isActive: true } }),
            prisma.orgStaff.count({ where: { orgId: org.id, isActive: true } }),
            prisma.feeTransaction.aggregate({
                where: { orgId: org.id, status: 'PENDING' },
                _sum: { amount: true },
            }),
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
                },
                features: Object.fromEntries(org.featureFlags.map(f => [f.key, f.value])),
            },
        });
    } catch (err) { next(err); }
});

export default router;
