import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── Exam Folders ─────────────────────────────────────────────
router.get('/folders', async (_req, res, next) => {
    try {
        const folders = await prisma.examFolder.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: folders });
    } catch (err) { next(err); }
});

router.post('/folders', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(req.body);
        const folder = await prisma.examFolder.create({ data: body });
        res.status(201).json({ success: true, data: folder });
    } catch (err) { next(err); }
});

router.patch('/folders/:id', async (req, res, next) => {
    try {
        const folder = await prisma.examFolder.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: folder });
    } catch (err) { next(err); }
});

router.delete('/folders/:id', async (req, res, next) => {
    try {
        await prisma.examFolder.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Folder deleted' });
    } catch (err) { next(err); }
});

// ─── Exam Categories ──────────────────────────────────────────
router.get('/categories', async (req, res, next) => {
    try {
        const { folderId } = req.query;
        const categories = await prisma.examCategory.findMany({
            where: folderId ? { folderId: folderId as string } : {},
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: categories });
    } catch (err) { next(err); }
});

router.post('/categories', async (req, res, next) => {
    try {
        const schema = z.object({
            folderId: z.string().min(1),
            name: z.string().min(1),
            description: z.string().optional(),
            icon: z.string().optional(),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(req.body);
        const category = await prisma.examCategory.create({ data: body });
        res.status(201).json({ success: true, data: category });
    } catch (err) { next(err); }
});

// ─── Exam SubCategories ───────────────────────────────────────
router.get('/subcategories', async (req, res, next) => {
    try {
        const { categoryId } = req.query;
        const subCategories = await prisma.examSubCategory.findMany({
            where: categoryId ? { categoryId: categoryId as string } : {},
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: subCategories });
    } catch (err) { next(err); }
});

router.post('/subcategories', async (req, res, next) => {
    try {
        const schema = z.object({
            categoryId: z.string().min(1),
            name: z.string().min(1),
            description: z.string().optional(),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(req.body);
        const subCategory = await prisma.examSubCategory.create({ data: body });
        res.status(201).json({ success: true, data: subCategory });
    } catch (err) { next(err); }
});

// ─── Public mock tests (MockVeda) ─────────────────────────────
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
