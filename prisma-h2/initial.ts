import { PrismaClient } from "./generated/prisma/client";
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const rootId = 1;

  //   Raw query safeguards againt sql injection.
  const tree = await prisma.$queryRaw`
  WITH RECURSIVE comment_tree AS (
    SELECT * FROM "Comment" WHERE id = ${rootId}
    UNION ALL
    SELECT c.* FROM "Comment" c
    JOIN comment_tree ct ON c."parentId" = ct.id
  )
  SELECT * FROM comment_tree;
`;

  // soft delete
  const extendedPrisma = prisma.$extends({
    query: {
      comment: {
        async $allOperations({ operation, args, query }) {
          // 1. Handle soft delete transformations safely
          if (operation === "delete") {
            // Divert to update and cast to 'any' to bypass Prisma's rigid return-type compiler
            return (prisma as any).comment.update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }

          // 2. Safely apply the findMany global filter
          if (operation === "findMany") {
            // Initialize args and where objects if they don't exist
            args.where = args.where ?? {};

            // Only apply the filter if they haven't explicitly asked for deleted records
            if (args.where.deletedAt === undefined) {
              args.where.deletedAt = null;
            }
          }

          if (operation === "update" || operation === "updateMany") {
            args.data = args.data || {};

            args.data.updatedAt = new Date();
          }

          // Proceed normally for all other operations (findFirst, update, etc.)
          return query(args);
        },
      },
    },
  });

  //   await extendedPrisma.comment.delete({
  //     where: {
  //       id: 1,
  //     },
  //   });

  //   4. auto timestamped updatedAt by extendedPrisma middleware.
  //   await extendedPrisma.comment.updateMany({
  //     where: {},
  //     data: {},
  //   });

  //   stretch goals: log prisma action, model, execution time.

  const reExtendedPrimsa = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = performance.now();
          const result = query(args);
          const end = performance.now();

          const duration = end - start;
          console.log(
            `[Prisma Query] ${model}.${operation} took ${duration} ms`,
          );
        },
      },
    },
  });

  //   await reExtendedPrimsa.comment.findMany();

  await reExtendedPrimsa.$executeRaw`
  update "Comment" set "repliesCount" = "repliesCount" + 1;
  `;
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
