/*
  Warnings:

  - Added the required column `priceInr` to the `Package` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "priceInr" DOUBLE PRECISION NOT NULL;
