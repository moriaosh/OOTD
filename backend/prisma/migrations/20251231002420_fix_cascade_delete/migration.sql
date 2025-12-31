-- DropForeignKey
ALTER TABLE "Clothe" DROP CONSTRAINT "Clothe_userId_fkey";

-- DropForeignKey
ALTER TABLE "Outfit" DROP CONSTRAINT "Outfit_userId_fkey";

-- AddForeignKey
ALTER TABLE "Clothe" ADD CONSTRAINT "Clothe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
