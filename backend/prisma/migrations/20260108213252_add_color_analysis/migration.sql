-- CreateTable
CREATE TABLE "ColorAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "skinTone" TEXT NOT NULL,
    "skinToneDetails" TEXT,
    "eyeColor" TEXT NOT NULL,
    "hairColor" TEXT NOT NULL,
    "lipColor" TEXT,
    "season" TEXT NOT NULL,
    "bestColors" TEXT[],
    "avoidColors" TEXT[],
    "recommendations" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColorAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ColorAnalysis_userId_idx" ON "ColorAnalysis"("userId");

-- CreateIndex
CREATE INDEX "ColorAnalysis_createdAt_idx" ON "ColorAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "ColorAnalysis" ADD CONSTRAINT "ColorAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
