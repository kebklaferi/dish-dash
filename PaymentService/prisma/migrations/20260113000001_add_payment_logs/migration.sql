-- CreateTable
CREATE TABLE "payment_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "level" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_logs_timestamp_idx" ON "payment_logs"("timestamp");

-- CreateIndex
CREATE INDEX "payment_logs_level_idx" ON "payment_logs"("level");

-- CreateIndex
CREATE INDEX "payment_logs_correlationId_idx" ON "payment_logs"("correlationId");
