-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ALTER COLUMN "achievements" SET DEFAULT '[]'::jsonb;
