import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
//   prisma.$executeRaw`create index card_title on "Card"  using GIN ((to_tsvector('english',"title")));`;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
