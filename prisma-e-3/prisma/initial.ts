import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  //   await prisma.user.create({
  //     data: {
  //       email: "dev@test.com",
  //       name: "Dev",
  //       posts: { create: [{ title: "First Post", body: "..." }] },
  //     },
  //   });

  //   Link tag 1 and tag 2 to post 1.

  //   await prisma.post.update({
  //     where: { id: 1 },
  //     data: { tags: { connect: [{ id: 1 }, { id: 2 }] } },
  //   });

  //   const un = await prisma.user.findUnique({
  //     where: { id: 1 },
  //     include: { posts: true },
  //   });


  // select * from post where id = 1 left join on 
  const un = await prisma.post.findUnique({
    where: { id: 1 },
    include: { author: true, tags: true },
  });

  console.log(un);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
