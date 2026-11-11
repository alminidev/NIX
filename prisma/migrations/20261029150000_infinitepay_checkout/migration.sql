-- AlterTable
ALTER TABLE "order" ADD COLUMN     "checkoutUrl" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentTransactionNsu" TEXT,
ADD COLUMN     "paymentInvoiceSlug" TEXT,
ADD COLUMN     "paymentAmount" DECIMAL(10,2),
ADD COLUMN     "paidAmount" DECIMAL(10,2),
ADD COLUMN     "paymentInstallments" INTEGER,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentReviewReason" TEXT;

-- CreateTable
CREATE TABLE "payment_event" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER,
    "transactionNsu" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_paymentTransactionNsu_key" ON "order"("paymentTransactionNsu");

-- CreateIndex
CREATE INDEX "order_paymentReview_idx" ON "order"("paymentReview");

-- CreateIndex
CREATE INDEX "payment_event_orderId_idx" ON "payment_event"("orderId");

-- AddForeignKey
ALTER TABLE "payment_event" ADD CONSTRAINT "payment_event_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
