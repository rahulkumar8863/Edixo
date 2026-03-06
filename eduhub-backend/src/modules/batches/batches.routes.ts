import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';

const router = Router();
router.use(authenticate, requireOrgAccess);

router.get('/', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const batches = await prisma.batch.findMany({
            where: { orgId: org!.id },
            include: { _count: { select: { students: true } } },
        });
        res.json({ success: true, data: batches });
    } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
    try {
        const body = z.object({ name: z.string().min(1), description: z.string().optional() }).parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });
        const batch = await prisma.batch.create({ data: { orgId: org.id, ...body } });
        res.status(201).json({ success: true, data: batch });
    } catch (err) { next(err); }
});

router.post('/:id/students', async (req, res, next) => {
    try {
        const { studentIds } = z.object({ studentIds: z.array(z.string()) }).parse(req.body);
        await prisma.batchStudent.createMany({
            data: studentIds.map(studentId => ({ batchId: req.params.id, studentId })),
            skipDuplicates: true,
        });
        res.json({ success: true, message: `${studentIds.length} students added to batch` });
    } catch (err) { next(err); }
});

export default router;
