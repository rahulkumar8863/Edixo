import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/', async (req, res, next) => {
    try {
        const schema = z.object({
            orgId: z.string(),
            title: z.string().min(1),
            body: z.string().min(1),
            channel: z.enum(['APP_PUSH', 'WHATSAPP', 'SMS', 'EMAIL']),
            targetType: z.enum(['ALL', 'BATCH', 'STUDENT', 'STAFF']),
            targetIds: z.array(z.string()).default([]),
            scheduledAt: z.string().optional(),
        });
        const data = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: data.orgId } });

        const notification = await prisma.orgNotification.create({
            data: { ...data, orgId: org.id, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined },
        });

        res.status(201).json({ success: true, data: notification });
    } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const notifications = await prisma.orgNotification.findMany({
            where: { orgId: org!.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: notifications });
    } catch (err) { next(err); }
});

export default router;
