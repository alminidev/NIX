import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  defaultProductionTimeTemplate,
  shopSettingsId,
} from "@/lib/production-time";
import {
  defaultShippingProvider,
  parseShippingProvider,
} from "@/lib/shipping-provider";
import "server-only";

function missingShippingColumn(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022" &&
    JSON.stringify(error.meta ?? {}).includes("shippingProvider")
  );
}

export async function getProductionTimeTemplate() {
  const settings = await prisma.shopSettings.findUnique({
    where: { id: shopSettingsId },
    select: { productionTimeTemplate: true },
  });

  const template = settings?.productionTimeTemplate.trim();
  return template || defaultProductionTimeTemplate;
}

/**
 * Provedor gravado. Sem linha, com valor desconhecido, ou enquanto a coluna
 * nova ainda não existe, usa o Melhor Envio.
 */
export async function getShippingProvider() {
  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: shopSettingsId },
      select: { shippingProvider: true },
    });

    return (
      parseShippingProvider(settings?.shippingProvider) ?? defaultShippingProvider
    );
  } catch (error) {
    if (missingShippingColumn(error)) return defaultShippingProvider;
    throw error;
  }
}
