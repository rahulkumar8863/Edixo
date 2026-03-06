import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [orgs, total] = await Promise.all([
            prisma.organization.findMany({
                where: { deletedAt: null },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.organization.count({ where: { deletedAt: null } }),
        ]);
        res.json({ success: true, data: { orgs, total } });
    } catch (err) { next(err); }
});

router.get('/:orgId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
            include: { featureFlags: true, personalizationSettings: true },
        });
        if (!org) throw new AppError('Organization not found', 404);
        res.json({ success: true, data: org });
    } catch (err) { next(err); }
});

export default router;
