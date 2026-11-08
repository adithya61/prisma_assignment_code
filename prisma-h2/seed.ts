import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.comment.deleteMany();

  await prisma.comment.createMany({
    data: [
      // Top-level comments
      { id: 1, parentId: null },
      { id: 2, parentId: null },
      { id: 3, parentId: null },

      // First-level replies
      { id: 4, parentId: 1 },
      { id: 5, parentId: 1 },
      { id: 8, parentId: 2 },
      { id: 10, parentId: 3 },

      // Nested replies (Level 2)
      { id: 6, parentId: 4 },
      { id: 9, parentId: 8 },
      { id: 11, parentId: 10 },
      { id: 12, parentId: 10 },

      // Deeply nested reply (Level 3)
      { id: 7, parentId: 6 },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
