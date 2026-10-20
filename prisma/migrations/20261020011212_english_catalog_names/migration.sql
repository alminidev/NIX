-- Rename catalog tables and columns to English, preserving existing rows.

ALTER TABLE "especificacao" DROP CONSTRAINT "especificacao_produtoId_fkey";
ALTER TABLE "produto" DROP CONSTRAINT "produto_categoriaId_fkey";
ALTER TABLE "produto_imagem" DROP CONSTRAINT "produto_imagem_produtoId_fkey";

ALTER TABLE "categoria" RENAME TO "category";
ALTER TABLE "produto" RENAME TO "product";
ALTER TABLE "especificacao" RENAME TO "specification";
ALTER TABLE "produto_imagem" RENAME TO "product_image";

ALTER TABLE "category" RENAME COLUMN "nome" TO "name";
ALTER TABLE "category" RENAME COLUMN "ordem" TO "sortOrder";

ALTER TABLE "product" RENAME COLUMN "nome" TO "name";
ALTER TABLE "product" RENAME COLUMN "capacidade" TO "capacity";
ALTER TABLE "product" RENAME COLUMN "dimensoes" TO "dimensions";
ALTER TABLE "product" RENAME COLUMN "preco" TO "price";
ALTER TABLE "product" RENAME COLUMN "parcelamento" TO "installments";
ALTER TABLE "product" RENAME COLUMN "descricao" TO "description";
ALTER TABLE "product" RENAME COLUMN "destaque" TO "featured";
ALTER TABLE "product" RENAME COLUMN "ativo" TO "active";
ALTER TABLE "product" RENAME COLUMN "ordem" TO "sortOrder";
ALTER TABLE "product" RENAME COLUMN "categoriaId" TO "categoryId";

ALTER TABLE "specification" RENAME COLUMN "texto" TO "text";
ALTER TABLE "specification" RENAME COLUMN "ordem" TO "sortOrder";
ALTER TABLE "specification" RENAME COLUMN "produtoId" TO "productId";

ALTER TABLE "product_image" RENAME COLUMN "ordem" TO "sortOrder";
ALTER TABLE "product_image" RENAME COLUMN "principal" TO "isPrimary";
ALTER TABLE "product_image" RENAME COLUMN "produtoId" TO "productId";

ALTER TABLE "category" RENAME CONSTRAINT "categoria_pkey" TO "category_pkey";
ALTER TABLE "product" RENAME CONSTRAINT "produto_pkey" TO "product_pkey";
ALTER TABLE "specification" RENAME CONSTRAINT "especificacao_pkey" TO "specification_pkey";
ALTER TABLE "product_image" RENAME CONSTRAINT "produto_imagem_pkey" TO "product_image_pkey";

ALTER INDEX "categoria_slug_key" RENAME TO "category_slug_key";
ALTER INDEX "produto_sku_key" RENAME TO "product_sku_key";
ALTER INDEX "produto_categoriaId_idx" RENAME TO "product_categoryId_idx";
ALTER INDEX "produto_ativo_ordem_idx" RENAME TO "product_active_sortOrder_idx";
ALTER INDEX "especificacao_produtoId_idx" RENAME TO "specification_productId_idx";
ALTER INDEX "produto_imagem_produtoId_idx" RENAME TO "product_image_productId_idx";

ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "specification" ADD CONSTRAINT "specification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
