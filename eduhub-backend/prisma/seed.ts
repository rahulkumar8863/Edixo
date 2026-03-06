import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Seeding database...');

    // ─── Super Admin ──────────────────────────────────────────
    const passwordHash = await bcrypt.hash('SuperAdmin@123', 12);

    const saUser = await prisma.user.upsert({
        where: { email: 'admin@eduhub.in' },
        update: {},
        create: {
            email: 'admin@eduhub.in',
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    await prisma.superAdmin.upsert({
        where: { userId: saUser.id },
        update: {},
        create: {
            userId: saUser.id,
            name: 'EduHub Super Admin',
            email: 'admin@eduhub.in',
        },
    });

    console.log('✅ Super Admin created: admin@eduhub.in / SuperAdmin@123');

    // ─── Global Q-Bank Folders (SSC, NEET, JEE, Banking, etc.) ─
    const globalFolders = [
        { name: 'SSC', children: ['CGL', 'CHSL', 'CPO', 'MTS'] },
        { name: 'Banking', children: ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'RBI Grade B'] },
        { name: 'NEET', children: ['Biology', 'Chemistry', 'Physics'] },
        { name: 'JEE', children: ['JEE Mains', 'JEE Advanced'] },
        { name: 'UPSC', children: ['Prelims', 'Mains', 'Optional'] },
        { name: 'Railways', children: ['RRB NTPC', 'RRB Group D', 'RRB JE'] },
        { name: 'State PSC', children: ['UPPSC', 'BPSC', 'MPPSC', 'RPSC'] },
    ];

    for (const folder of globalFolders) {
        const parent = await prisma.qBankFolder.upsert({
            where: { id: `global-${folder.name.toLowerCase().replace(/\s/g, '-')}` },
            update: {},
            create: {
                id: `global-${folder.name.toLowerCase().replace(/\s/g, '-')}`,
                name: folder.name,
                path: '/',
                depth: 0,
                scope: 'GLOBAL',
            },
        });

        for (const child of folder.children) {
            await prisma.qBankFolder.upsert({
                where: { id: `global-${parent.id}-${child.toLowerCase().replace(/\s/g, '-')}` },
                update: {},
                create: {
                    id: `global-${parent.id}-${child.toLowerCase().replace(/\s/g, '-')}`,
                    name: child,
                    parentId: parent.id,
                    path: `/${parent.id}`,
                    depth: 1,
                    scope: 'GLOBAL',
                },
            });
        }

        console.log(`✅ Global folder: ${folder.name} (${folder.children.length} sub-folders)`);
    }

    // ─── Demo Organization ────────────────────────────────────
    const demoPasswordHash = await bcrypt.hash('DemoOrg@123', 12);

    const demoOrg = await prisma.organization.upsert({
        where: { orgId: 'GK-ORG-00001' },
        update: {},
        create: {
            orgId: 'GK-ORG-00001',
            name: 'Demo Coaching Institute',
            email: 'demo@coaching.in',
            plan: 'MEDIUM',
            status: 'ACTIVE',
            aiCredits: 2000,
            orgAdminEmail: 'admin@demo-coaching.in',
            orgAdminPassword: demoPasswordHash,
        },
    });

    const demoAdminUser = await prisma.user.upsert({
        where: { email: 'admin@demo-coaching.in' },
        update: {},
        create: {
            email: 'admin@demo-coaching.in',
            passwordHash: demoPasswordHash,
            role: 'ORG_STAFF',
        },
    });

    await prisma.orgStaff.upsert({
        where: { staffId: 'GK-TCH-00001' },
        update: {},
        create: {
            staffId: 'GK-TCH-00001',
            userId: demoAdminUser.id,
            orgId: demoOrg.id,
            name: 'Demo Org Admin',
            email: 'admin@demo-coaching.in',
            role: 'ORG_ADMIN',
        },
    });

    // Feature flags for demo org
    await prisma.orgFeatureFlag.createMany({
        data: [
            { orgId: demoOrg.id, key: 'ai_question_generation', value: true },
            { orgId: demoOrg.id, key: 'pdf_extraction', value: true },
            { orgId: demoOrg.id, key: 'whatsapp_bot', value: false },
            { orgId: demoOrg.id, key: 'razorpay_integration', value: false },
        ],
        skipDuplicates: true,
    });

    await prisma.orgPersonalizationSettings.upsert({
        where: { orgId: demoOrg.id },
        update: {},
        create: { orgId: demoOrg.id },
    });

    console.log('✅ Demo org created: GK-ORG-00001');
    console.log('   Org Admin: admin@demo-coaching.in / DemoOrg@123');
    console.log('\n🎉 Seeding complete!');
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
