import { prisma } from "@/lib/prisma";
import {
  defaultProductionTimeTemplate,
  shopSettingsId,
} from "@/lib/production-time";
import "server-only";

export async function getProductionTimeTemplate() {
  const settings = await prisma.shopSettings.findUnique({
    where: { id: shopSettingsId },
    select: { productionTimeTemplate: true },
  });

  const template = settings?.productionTimeTemplate.trim();
  return template || defaultProductionTimeTemplate;
}
