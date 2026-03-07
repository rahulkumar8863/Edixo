import { PrismaClient, UserRole, StaffRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding demo users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Super Admin
    const superAdminUser = await prisma.user.upsert({
        where: { email: 'superadmin@eduhub.com' },
        update: { passwordHash },
        create: {
            email: 'superadmin@eduhub.com',
            passwordHash,
            role: UserRole.SUPER_ADMIN,
            isActive: true,
        },
    });

    await prisma.superAdmin.upsert({
        where: { email: 'superadmin@eduhub.com' },
        update: { name: 'Test Super Admin' },
        create: {
            userId: superAdminUser.id,
            name: 'Test Super Admin',
            email: 'superadmin@eduhub.com',
        },
    });
    console.log('Created Super Admin: superadmin@eduhub.com / password123');

    // 2. Organization Admin
    const org = await prisma.organization.upsert({
        where: { orgId: 'demo-org' },
        update: {},
        create: {
            orgId: 'demo-org',
            name: 'Demo Academy',
            status: 'ACTIVE',
            plan: 'LARGE',
            orgAdminEmail: 'orgadmin@eduhub.com',
            orgAdminPassword: passwordHash, // Organization model also has this field
        },
    });

    const orgAdminUser = await prisma.user.upsert({
        where: { email: 'orgadmin@eduhub.com' },
        update: { passwordHash },
        create: {
            email: 'orgadmin@eduhub.com',
            passwordHash,
            role: UserRole.ORG_STAFF,
            isActive: true,
        },
    });

    await prisma.orgStaff.upsert({
        where: { userId: orgAdminUser.id },
        update: { name: 'Test Org Admin', staffId: 'STF-ORG-001' },
        create: {
            userId: orgAdminUser.id,
            orgId: org.id,
            name: 'Test Org Admin',
            email: 'orgadmin@eduhub.com',
            staffId: 'STF-ORG-001',
            role: StaffRole.ORG_ADMIN,
        },
    });
    console.log('Created Org Admin: orgadmin@eduhub.com / password123');

    // 3. Creator
    const creatorUser = await prisma.user.upsert({
        where: { email: 'creator@eduhub.com' },
        update: { passwordHash },
        create: {
            email: 'creator@eduhub.com',
            passwordHash,
            role: UserRole.ORG_STAFF,
            isActive: true,
        },
    });

    await prisma.orgStaff.upsert({
        where: { userId: creatorUser.id },
        update: { name: 'Test Creator', staffId: 'STF-CRT-002' },
        create: {
            userId: creatorUser.id,
            orgId: org.id,
            name: 'Test Creator',
            email: 'creator@eduhub.com',
            staffId: 'STF-CRT-002',
            role: StaffRole.CONTENT_MANAGER,
        },
    });
    console.log('Created Creator (Content Manager): creator@eduhub.com / password123');

    // 4. Student
    const studentUser = await prisma.user.upsert({
        where: { email: 'student@eduhub.com' },
        update: { passwordHash },
        create: {
            email: 'student@eduhub.com',
            passwordHash,
            role: UserRole.STUDENT,
            isActive: true,
        },
    });

    await prisma.student.upsert({
        where: { userId: studentUser.id },
        update: { name: 'Test Student', studentId: 'STU-001' },
        create: {
            userId: studentUser.id,
            orgId: org.id,
            name: 'Test Student',
            email: 'student@eduhub.com',
            studentId: 'STU-001',
        },
    });
    console.log('Created Student: student@eduhub.com / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
