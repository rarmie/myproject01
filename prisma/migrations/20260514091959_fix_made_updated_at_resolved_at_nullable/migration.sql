/*
  Warnings:

  - Made the column `createdAt` on table `Concern` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Concern" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "resolvedAt" DROP NOT NULL;
