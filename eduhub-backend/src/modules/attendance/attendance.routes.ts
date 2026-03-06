import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate, requireOrgAccess);

// ─── POST /api/attendance/mark ───────────────────────────────
router.post('/mark', async (req, res, next) => {
    try {
        const schema = z.object({
            date: z.string(), // YYYY-MM-DD
            batchId: z.string().optional(),
            records: z.array(z.object({
                studentId: z.string(),
                isPresent: z.boolean(),
            })),
        });
        const body = schema.parse(req.body);
        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });
        const date = new Date(body.date);

        const staff = await prisma.orgStaff.findFirst({
            where: { userId: req.user!.userId, orgId: org.id },
        });

        const results = await prisma.$transaction(
            body.records.map(record =>
                prisma.attendanceRecord.upsert({
                    where: {
                        studentId_date_batchId: {
                            studentId: record.studentId,
                            date,
                            batchId: body.batchId || '',
                        },
                    },
                    update: { isPresent: record.isPresent, markedById: staff?.id },
                    create: {
                        orgId: org.id,
                        studentId: record.studentId,
                        batchId: body.batchId,
                        date,
                        isPresent: record.isPresent,
                        markedById: staff?.id,
                    },
                })
            )
        );

        res.json({ success: true, data: results, message: `${results.length} attendance records saved` });
    } catch (err) { next(err); }
});

// ─── GET /api/attendance/:studentId/summary ──────────────────
router.get('/:studentId/summary', async (req, res, next) => {
    try {
        const { month, year } = req.query;

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        const records = await prisma.attendanceRecord.findMany({
            where: {
                studentId: req.params.studentId,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'asc' },
        });

        const present = records.filter(r => r.isPresent).length;
        const total = records.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        res.json({ success: true, data: { records, present, total, percentage } });
    } catch (err) { next(err); }
});

export default router;
