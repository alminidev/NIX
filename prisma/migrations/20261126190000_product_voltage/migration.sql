-- Voltagem opcional no produto e snapshot no item do pedido.
-- Produtos e pedidos atuais ficam sem voltagem (false / null).

-- CreateEnum
CREATE TYPE "product_voltage" AS ENUM ('V110', 'V220');

-- AlterTable
ALTER TABLE "product" ADD COLUMN "requiresVoltage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN "voltage" "product_voltage";
