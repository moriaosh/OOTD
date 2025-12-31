-- CreateIndex
CREATE INDEX "Clothe_userId_idx" ON "Clothe"("userId");

-- CreateIndex
CREATE INDEX "Clothe_category_idx" ON "Clothe"("category");

-- CreateIndex
CREATE INDEX "Clothe_createdAt_idx" ON "Clothe"("createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_isPublic_idx" ON "Post"("isPublic");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_isPublic_createdAt_idx" ON "Post"("isPublic", "createdAt");
