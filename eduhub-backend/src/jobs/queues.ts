import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

const connection = redis;

// ─── Queue Definitions ───────────────────────────────────────
export const pdfExtractQueue = new Queue('pdfExtract', { connection });
export const masteryUpdateQueue = new Queue('masteryUpdate', { connection });
export const folderCountQueue = new Queue('folderCount', { connection });
export const notificationQueue = new Queue('notification', { connection });
export const receiptQueue = new Queue('receipt', { connection });
export const testScheduleQueue = new Queue('testSchedule', { connection });

// ─── Mastery Update Worker ───────────────────────────────────
export const masteryUpdateWorker = new Worker(
    'masteryUpdate',
    async (job) => {
        const { studentId, questionId, orgId, isCorrect, timeSecs, wasSkipped } = job.data;

        // Import here to avoid circular deps
        const { prisma } = await import('../config/database');

        const existing = await prisma.studentQuestionHistory.findUnique({
            where: { studentId_questionId: { studentId, questionId } },
        });

        const attemptCount = (existing?.attemptCount || 0) + 1;
        const correctCount = (existing?.correctCount || 0) + (isCorrect ? 1 : 0);
        const wrongCount = (existing?.wrongCount || 0) + (!isCorrect && !wasSkipped ? 1 : 0);
        const skipCount = (existing?.skipCount || 0) + (wasSkipped ? 1 : 0);

        const avgTimeSecs = existing
            ? ((existing.avgTimeSecs * existing.attemptCount) + timeSecs) / attemptCount
            : timeSecs;

        // Mastery score formula (from PRD section 4.3)
        const accuracy = correctCount / attemptCount;
        const exposure = Math.min(attemptCount / 5, 1);
        const targetTime = 90; // medium default
        const speedPenalty = Math.max(0, (avgTimeSecs - targetTime) / targetTime) * 0.5;

        const masteryScore = Math.max(0, Math.min(100,
            accuracy * 70 + exposure * 20 - speedPenalty * 10
        ));

        const masteryLevel =
            masteryScore === 0 ? 'UNATTEMPTED' :
                masteryScore <= 30 ? 'WEAK' :
                    masteryScore <= 60 ? 'DEVELOPING' :
                        masteryScore <= 85 ? 'PROFICIENT' : 'MASTERED';

        await prisma.studentQuestionHistory.upsert({
            where: { studentId_questionId: { studentId, questionId } },
            update: {
                attemptCount, correctCount, wrongCount, skipCount, avgTimeSecs,
                lastResult: wasSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong',
                masteryScore,
                masteryLevel: masteryLevel as any,
                lastAttemptAt: new Date(),
            },
            create: {
                studentId, questionId, orgId,
                attemptCount, correctCount, wrongCount, skipCount, avgTimeSecs,
                lastResult: wasSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong',
                masteryScore,
                masteryLevel: masteryLevel as any,
                lastAttemptAt: new Date(),
            },
        });

        logger.debug(`Mastery updated for student ${studentId}, question ${questionId}: ${masteryScore}`);
    },
    { connection, concurrency: 10 }
);

masteryUpdateWorker.on('failed', (job, err) => {
    logger.error(`masteryUpdate job ${job?.id} failed:`, err);
});

// ─── Notification Worker ─────────────────────────────────────
export const notificationWorker = new Worker(
    'notification',
    async (job) => {
        const { notificationId } = job.data;
        // TODO: integrate WhatsApp/SMS/Email services
        logger.info(`Processing notification ${notificationId}`);
    },
    { connection }
);

logger.info('✅ BullMQ queues initialized');
