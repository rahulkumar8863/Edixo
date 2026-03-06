import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate, requireOrgAccess);

// ─── GET /api/fees/transactions ──────────────────────────────
router.get('/transactions', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, studentId } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { orgId: org!.id };
        if (status) where.status = status;
        if (studentId) where.studentId = studentId;

        const [transactions, total] = await Promise.all([
            prisma.feeTransaction.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: { student: { select: { studentId: true, name: true } } },
            }),
            prisma.feeTransaction.count({ where }),
        ]);

        res.json({ success: true, data: { transactions, total } });
    } catch (err) { next(err); }
});

// ─── POST /api/fees/collect ──────────────────────────────────
router.post('/collect', async (req, res, next) => {
    try {
        const schema = z.object({
            studentId: z.string(),
            amount: z.number().positive(),
            paymentMethod: z.enum(['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER', 'RAZORPAY']),
            feeStructureId: z.string().optional(),
            notes: z.string().optional(),
        });
        const body = schema.parse(req.body);

        const org = await prisma.organization.findFirstOrThrow({ where: { orgId: req.user!.orgId } });

        // Generate receipt number: 2026-00458 (year-sequential per org)
        const year = new Date().getFullYear();
        const updatedOrg = await prisma.organization.update({
            where: { id: org.id },
            data: { receiptCounter: { increment: 1 } },
        });
        const receiptNumber = `${year}-${String(updatedOrg.receiptCounter).padStart(5, '0')}`;

        const transaction = await prisma.feeTransaction.create({
            data: {
                orgId: org.id,
                studentId: body.studentId,
                feeStructureId: body.feeStructureId,
                amount: body.amount,
                status: 'PAID',
                paymentMethod: body.paymentMethod,
                receiptNumber,
                notes: body.notes,
                paidAt: new Date(),
            },
            include: { student: { select: { name: true, studentId: true } } },
        });

        res.status(201).json({
            success: true,
            data: transaction,
            message: `Payment collected. Receipt: ${receiptNumber}`,
        });
    } catch (err) { next(err); }
});

// ─── GET /api/fees/summary ───────────────────────────────────
router.get('/summary', async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0);

        const [collected, pending] = await Promise.all([
            prisma.feeTransaction.aggregate({
                where: { orgId: org!.id, status: 'PAID', paidAt: { gte: startDate, lte: endDate } },
                _sum: { amount: true },
                _count: true,
            }),
            prisma.feeTransaction.aggregate({
                where: { orgId: org!.id, status: 'PENDING' },
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        res.json({
            success: true,
            data: {
                collected: { amount: collected._sum.amount || 0, count: collected._count },
                pending: { amount: pending._sum.amount || 0, count: pending._count },
            },
        });
    } catch (err) { next(err); }
});

export default router;
