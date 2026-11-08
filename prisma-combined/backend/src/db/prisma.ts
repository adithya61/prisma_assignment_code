import { PrismaClient } from "../../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { env } from "../config/env.js";

const pool = new pg.Pool({ connectionString: env.databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const softDeleteHandler = async ({ operation, args, query }: any) => {
  if (operation === "delete") {
    args.where = args.where ?? {};
    if (args.where.deletedAt !== undefined && args.where.deletedAt !== null) {
      throw new Error("Record already deleted");
    }
    return query({ ...args, data: { deletedAt: new Date() } });
  }

  const readOps = ["findMany", "findFirst", "findUnique", "count", "aggregate"];
  if (readOps.includes(operation)) {
    args.where = args.where ?? {};
    if (args.where.deletedAt === undefined) {
      args.where.deletedAt = null;
    }
  }

  if (operation === "update" || operation === "updateMany") {
    args.data = args.data || {};
    args.data.updatedAt = new Date();

    args.where = args.where ?? {};
    if (args.where.deletedAt === undefined) {
      args.where.deletedAt = null;
    }
  }

  return query(args);
};

export const prismaClient = prisma.$extends({
  query: {
    card: { $allOperations: softDeleteHandler },
    board: { $allOperations: softDeleteHandler },
  },
});

/** @deprecated Prefer `prismaClient` — kept for older imports */
export const extendedPrisma = prismaClient;
