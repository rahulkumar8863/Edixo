import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// Public mock tests (MockVeda)  
router.get('/public', async (_req, res, next) => {
    try {
        const tests = await prisma.mockTest.findMany({
            where: { isPublic: true, status: 'LIVE' },
            select: { id: true, testId: true, name: true, description: true, durationMins: true, scheduledAt: true, endsAt: true },
            orderBy: { scheduledAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: tests });
    } catch (err) { next(err); }
});

// Leaderboard for a test
router.get('/:testId/leaderboard', async (req, res, next) => {
    try {
        const top100 = await prisma.testAttempt.findMany({
            where: { test: { testId: req.params.testId }, status: 'SUBMITTED' },
            orderBy: { score: 'desc' },
            take: 100,
            include: { student: { select: { name: true, studentId: true } } },
        });
        res.json({ success: true, data: top100 });
    } catch (err) { next(err); }
});

export default router;
