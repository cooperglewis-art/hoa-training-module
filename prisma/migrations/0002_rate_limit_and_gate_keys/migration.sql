-- Add per-lesson gate tracking to module progress
ALTER TABLE "ModuleProgress"
ADD COLUMN "passedGateKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Persisted API rate-limit counters
CREATE TABLE "RateLimitCounter" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RateLimitCounter_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitCounter_resetAt_idx" ON "RateLimitCounter"("resetAt");
