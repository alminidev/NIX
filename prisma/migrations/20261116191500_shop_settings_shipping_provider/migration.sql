-- Provedor de frete ativo. Coluna nova, com padrão Melhor Envio.
-- A loja continua cotando como hoje enquanto ninguém troca a configuração.

ALTER TABLE "shop_settings" ADD COLUMN "shippingProvider" TEXT NOT NULL DEFAULT 'melhor_envio';
