import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"], // enabling prisma logging.
});

async function main() {
  // User table has foreign key, tag table
  //   const result = await prisma.post.create({
  //     data: {
  //       title: "this is casablanca",
  //       body: "casablanca is a remarkable invention",
  //       User: {
  //         connect: { id: 1 },
  //       },
  //       Tag: {
  //         create: [{name: 'luxury'}, {name: "sample"}],
  //       },
  //     },
  //   });
  // set to updated connect items
  //   const result = await prisma.post.update({
  //     where: { id: 3 },
  //     data: {
  //       Tag: {
  //         set: { id: 1 },
  //       },
  //     },
  //   });
  //   for on delete cascade added later to schema run
  // npx prisma migrate.
  //   await prisma.user.delete({ where: { id: 2 } });
  // select vs include
  // const r = await prisma.post.findMany({
  //     select: {
  //         id: true,
  //         title: true,
  //         createdAt: true,
  //         User: {
  //             select: {
  //                 name: true
  //             }
  //         }
  //     },
  // })
  //   const posts = await prisma.post.findMany({
  //     include: {
  //         User: true
  //     }
  //   });
  //   console.log(posts);
  //   for (let post of posts) {
  //     console.log(
  //       await prisma.user.findFirst({
  //         where: { id: post.authorId },
  //       }),
  //     );
  //   }
  //   count no. of posts per user.
  //   const res = await prisma.user.findMany({
  //     include: { _count: { select: { Post: true } } },
  //   });
  // find total users in the table.
  //  const res = await prisma.user.count();
  //   filter across relations.
  //   const res = await prisma.post.findMany({
  //     where: { User: { email: { contains: "gmail" } } },
  //   });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
