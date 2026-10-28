-- AlterTable
ALTER TABLE "product" ADD COLUMN "weight" DECIMAL(8,3) NOT NULL DEFAULT 1;
ALTER TABLE "product" ALTER COLUMN "weight" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order" ADD COLUMN "shippingService" TEXT;
ALTER TABLE "order" ADD COLUMN "deliveryDays" INTEGER;
