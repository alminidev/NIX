-- O item pode ficar sem produto quando o catálogo é excluído.
-- A chave continua RESTRICT: pedido em andamento ainda impede a exclusão.
-- O código zera productId só em pedido cancelado ou enviado, antes do DELETE.

-- AlterTable
ALTER TABLE "order_item" ALTER COLUMN "productId" DROP NOT NULL;
