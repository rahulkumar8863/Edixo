
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Organizations ---');
    const orgs = await prisma.organization.findMany();
    console.log(orgs);

    console.log('\n--- Students ---');
    const students = await prisma.student.findMany({
        include: { user: true }
    });
    console.log(students);

    console.log('\n--- Users ---');
    const users = await prisma.user.findMany();
    console.log(users);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
