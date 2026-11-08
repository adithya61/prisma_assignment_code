import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.package.create({
        data: {
            name: 'action Figure pokemon',
            price: 33.2,
            description: "limited edition pikachu figurine table toy",
            category: "kids",
            priceInr: 0
        }
    })

}

main()
.catch((e) => console.error(e))
.finally(async () => await prisma.$disconnect());
