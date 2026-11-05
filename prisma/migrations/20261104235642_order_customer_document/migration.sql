-- CreateEnum
CREATE TYPE "customer_kind" AS ENUM ('PERSON', 'COMPANY');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "customerDocument" TEXT,
ADD COLUMN     "customerKind" "customer_kind";

-- Os dois campos entram juntos. CPF tem 11 dígitos; CNPJ tem 14 caracteres,
-- e os dois últimos são os dígitos verificadores numéricos.
ALTER TABLE "order" ADD CONSTRAINT "order_customer_document_kind" CHECK (
  ("customerKind" IS NULL AND "customerDocument" IS NULL)
  OR ("customerKind" = 'PERSON' AND "customerDocument" ~ '^[0-9]{11}$')
  OR ("customerKind" = 'COMPANY' AND "customerDocument" ~ '^[0-9A-Z]{12}[0-9]{2}$')
);
