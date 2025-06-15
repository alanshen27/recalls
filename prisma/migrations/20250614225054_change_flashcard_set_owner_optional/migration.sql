/*
  Warnings:

  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worksheet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_worksheetId_fkey";

-- DropForeignKey
ALTER TABLE "Worksheet" DROP CONSTRAINT "Worksheet_userId_fkey";

-- AlterTable
ALTER TABLE "FlashcardSet" ALTER COLUMN "ownerId" DROP NOT NULL;

-- DropTable
DROP TABLE "Block";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "Worksheet";
