-- AlterEnum
ALTER TYPE "order_status" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "order_status_expiresAt_idx" ON "order"("status", "expiresAt");
