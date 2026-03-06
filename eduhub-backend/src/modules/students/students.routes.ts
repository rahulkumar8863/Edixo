import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate, requireOrgAccess);

// ─── GET /api/students?orgId=:orgId ─────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, batchId, isActive } = req.query;
        const orgId = req.user!.orgDbId || req.params.orgId;
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const skip = (Number(page) - 1) * Number(limit);
        const where: any = { orgId: org.id };
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { studentId: { contains: search as string, mode: 'insensitive' } },
                { mobile: { contains: search as string } },
            ];
        }
        if (batchId) {
            where.batchEnrollments = { some: { batchId: batchId as string } };
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { enrolledAt: 'desc' },
                select: {
                    id: true, studentId: true, name: true, email: true, mobile: true,
                    isActive: true, enrolledAt: true, testsCompleted: true,
                    personalizationUnlocked: true, photoUrl: true,
                    batchEnrollments: { select: { batch: { select: { id: true, name: true } } } },
                },
            }),
            prisma.student.count({ where }),
        ]);

        res.json({ success: true, data: { students, total, page: Number(page) } });
    } catch (err) { next(err); }
});

// ─── POST /api/students ──────────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            parentMobile: z.string().optional(),
            password: z.string().min(6),
            dateOfBirth: z.string().optional(),
            address: z.string().optional(),
            batchIds: z.array(z.string()).default([]),
        });
        const body = schema.parse(req.body);

        const org = await prisma.organization.findFirstOrThrow({
            where: { orgId: req.user!.orgId },
        });

        // Check plan limits
        const planLimits: Record<string, number> = {
            SMALL: 200, MEDIUM: 1000, LARGE: 5000, ENTERPRISE: 999999
        };
        if (org.studentCount >= planLimits[org.plan]) {
            throw new AppError(`Plan limit reached: ${planLimits[org.plan]} students max for ${org.plan} plan`, 403);
        }

        // Generate Student ID: GK-STU-XXXXX
        const count = await prisma.student.count({ where: { orgId: org.id } });
        const studentId = `GK-STU-${String(count + 1).padStart(5, '0')}`;

        const passwordHash = await bcrypt.hash(body.password, 12);

        const student = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: body.email,
                    mobile: body.mobile,
                    passwordHash,
                    role: 'STUDENT',
                },
            });

            const newStudent = await tx.student.create({
                data: {
                    studentId,
                    userId: user.id,
                    orgId: org.id,
                    name: body.name,
                    email: body.email,
                    mobile: body.mobile,
                    parentMobile: body.parentMobile,
                    address: body.address,
                    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
                },
            });

            // Enroll in batches
            if (body.batchIds.length > 0) {
                await tx.batchStudent.createMany({
                    data: body.batchIds.map(batchId => ({ batchId, studentId: newStudent.id })),
                    skipDuplicates: true,
                });
            }

            // Update org student count
            await tx.organization.update({
                where: { id: org.id },
                data: { studentCount: { increment: 1 } },
            });

            return newStudent;
        });

        res.status(201).json({ success: true, data: student, message: `Student ${studentId} created` });
    } catch (err) { next(err); }
});

// ─── GET /api/students/:id ───────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: req.params.id },
            include: {
                batchEnrollments: { include: { batch: true } },
                feeTransactions: { orderBy: { createdAt: 'desc' }, take: 5 },
                attendance: { orderBy: { date: 'desc' }, take: 30 },
            },
        });
        if (!student) throw new AppError('Student not found', 404);
        res.json({ success: true, data: student });
    } catch (err) { next(err); }
});

// ─── PATCH /api/students/:id ─────────────────────────────────
router.patch('/:id', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2).optional(),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            parentMobile: z.string().optional(),
            isActive: z.boolean().optional(),
            address: z.string().optional(),
        });
        const body = schema.parse(req.body);

        const student = await prisma.student.update({
            where: { id: req.params.id },
            data: body,
        });

        res.json({ success: true, data: student });
    } catch (err) { next(err); }
});

export default router;
