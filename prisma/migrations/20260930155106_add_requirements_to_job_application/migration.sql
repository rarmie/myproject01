-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];
