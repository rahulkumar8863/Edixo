import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';

const router = Router();
router.use(authenticate, requireOrgAccess);

router.get('/', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const staff = await prisma.orgStaff.findMany({
            where: { orgId: org!.id },
            include: { user: { select: { email: true, lastLoginAt: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: staff });
    } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            mobile: z.string().optional(),
            role: z.enum(['TEACHER', 'CONTENT_MANAGER', 'FEE_MANAGER', 'RECEPTIONIST', 'ANALYTICS_VIEWER']),
            password: z.string().min(8),
        });
        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        const count = await prisma.orgStaff.count({ where: { orgId: org.id } });
        const isTeacher = body.role === 'TEACHER' || body.role === 'CONTENT_MANAGER';
        const staffId = isTeacher
            ? `GK-TCH-${String(count + 1).padStart(5, '0')}`
            : `GK-STF-${String(count + 1).padStart(5, '0')}`;

        const passwordHash = await bcrypt.hash(body.password, 12);

        const staff = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email: body.email, passwordHash, role: 'ORG_STAFF' },
            });
            return tx.orgStaff.create({
                data: { staffId, userId: user.id, orgId: org.id, name: body.name, email: body.email, mobile: body.mobile, role: body.role },
            });
        });

        res.status(201).json({ success: true, data: staff });
    } catch (err) { next(err); }
});

export default router;
