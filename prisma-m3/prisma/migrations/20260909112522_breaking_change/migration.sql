/*
  Warnings:

  - You are about to drop the column `priceInr` on the `Package` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "price_idx";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "priceInr";
