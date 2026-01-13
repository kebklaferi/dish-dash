-- CreateTable
CREATE TABLE "order_logs" (
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

    CONSTRAINT "order_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_logs_timestamp_idx" ON "order_logs"("timestamp");

-- CreateIndex
CREATE INDEX "order_logs_level_idx" ON "order_logs"("level");

-- CreateIndex
CREATE INDEX "order_logs_correlationId_idx" ON "order_logs"("correlationId");
