-- CreateTable
CREATE TABLE "CachedWeatherSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "weatherData" JSONB NOT NULL,
    "suggestion" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedWeatherSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedTripPacking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "activities" TEXT[],
    "tripType" TEXT NOT NULL,
    "packingList" JSONB NOT NULL,
    "tripData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedTripPacking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedWeatherSuggestion_userId_key" ON "CachedWeatherSuggestion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CachedTripPacking_userId_key" ON "CachedTripPacking"("userId");

-- AddForeignKey
ALTER TABLE "CachedWeatherSuggestion" ADD CONSTRAINT "CachedWeatherSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CachedTripPacking" ADD CONSTRAINT "CachedTripPacking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
