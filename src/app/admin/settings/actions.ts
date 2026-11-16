"use server";

import { prisma } from "@/lib/prisma";
import { shopSettingsId } from "@/lib/production-time";
import { readSettingsForm } from "@/lib/settings-input";
import { parseShippingProvider } from "@/lib/shipping-provider";
import { getSession } from "@/lib/session";
import type { ISettingsFormState } from "@/types/admin-settings";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const deniedForm: ISettingsFormState = {
  status: "error",
  message: "Acesso negado.",
  fieldErrors: {},
};

async function assertAdmin() {
  const session = await getSession();
  return session?.user.role === "admin";
}

export async function saveShopSettings(
  _previous: ISettingsFormState,
  formData: FormData,
): Promise<ISettingsFormState> {
  if (!(await assertAdmin())) return deniedForm;

  const parsed = readSettingsForm(formData);
  if (!parsed.input) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  await prisma.shopSettings.upsert({
    where: { id: shopSettingsId },
    create: {
      id: shopSettingsId,
      productionTimeTemplate: parsed.input.productionTimeTemplate,
    },
    update: {
      productionTimeTemplate: parsed.input.productionTimeTemplate,
    },
  });

  updateTag("products");
  redirect("/admin/settings?notice=saved");
}

export async function saveShippingProvider(
  _previous: ISettingsFormState,
  formData: FormData,
): Promise<ISettingsFormState> {
  if (!(await assertAdmin())) return deniedForm;

  const provider = parseShippingProvider(formData.get("shippingProvider"));
  if (!provider) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: {
        shippingProvider: "Escolha Melhor Envio ou Central do Frete.",
      },
    };
  }

  try {
    await prisma.shopSettings.upsert({
      where: { id: shopSettingsId },
      create: {
        id: shopSettingsId,
        shippingProvider: provider,
      },
      update: { shippingProvider: provider },
    });
  } catch {
    console.error("Não foi possível gravar o provedor de frete.");
    return {
      status: "error",
      message: "Não foi possível salvar o provedor de frete.",
      fieldErrors: {},
    };
  }

  redirect("/admin/settings?notice=saved");
}
