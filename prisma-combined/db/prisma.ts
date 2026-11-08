/** Re-export for scripts outside `backend/` — prefer importing from backend/src/db */
export {
  prismaClient,
  extendedPrisma,
} from "../backend/src/db/prisma.js";
