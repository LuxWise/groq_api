import 'dotenv/config'
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
    const roles = [
        { name: 'admin' },
        { name: 'user' },
        { name: 'external' },
    ];

    for (const role of roles) {
        const createdRole = await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: {
                name: role.name,
            },
        });
        console.log(`✅ Rol creado/actualizado: ${createdRole.name}`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });