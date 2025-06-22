-- AlterTable
ALTER TABLE "FlashcardSet" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StudyingSet" (
    "id" TEXT NOT NULL,
    "flashcardSetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyingSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyingSet_flashcardSetId_userId_key" ON "StudyingSet"("flashcardSetId", "userId");

-- AddForeignKey
ALTER TABLE "StudyingSet" ADD CONSTRAINT "StudyingSet_flashcardSetId_fkey" FOREIGN KEY ("flashcardSetId") REFERENCES "FlashcardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyingSet" ADD CONSTRAINT "StudyingSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
