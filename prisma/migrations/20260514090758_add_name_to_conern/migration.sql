/*
  Warnings:

  - Added the required column `name` to the `Concern` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Concern" ADD COLUMN     "name" TEXT NOT NULL;
