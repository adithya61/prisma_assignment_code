-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "deletedAt" TIMESTAMP(3);
