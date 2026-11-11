-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('AWAITING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "order_source" AS ENUM ('SITE', 'WHATSAPP', 'INSTAGRAM');

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "source" "order_source" NOT NULL DEFAULT 'SITE',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shipping" DECIMAL(10,2),
    "total" DECIMAL(10,2) NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "trackingCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_status_createdAt_idx" ON "order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "order_customerEmail_idx" ON "order"("customerEmail");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_item_productId_idx" ON "order_item"("productId");

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Safety net: stock can never go below zero, even if a write bypasses the
-- conditional update used when an order is created.
ALTER TABLE "product" ADD CONSTRAINT "product_stock_non_negative" CHECK ("stock" >= 0);

ALTER TABLE "order_item" ADD CONSTRAINT "order_item_quantity_positive" CHECK ("quantity" > 0);
