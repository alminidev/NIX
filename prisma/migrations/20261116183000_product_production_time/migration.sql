-- Tempo de produção por produto e modelo global do texto.
-- Colunas novas, opcionais no produto. A tabela de configuração nasce com o texto padrão.
-- Produtos já cadastrados ficam com productionDays nulo e não mostram a frase.

-- AlterTable
ALTER TABLE "product" ADD COLUMN "productionDays" INTEGER,
ADD COLUMN "productionTimeTemplate" TEXT;

-- CreateTable
CREATE TABLE "shop_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "productionTimeTemplate" TEXT NOT NULL DEFAULT 'Após a compra o tempo de produção do produto é de {dias}.',

    CONSTRAINT "shop_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "shop_settings" ("id", "productionTimeTemplate")
VALUES (1, 'Após a compra o tempo de produção do produto é de {dias}.');
