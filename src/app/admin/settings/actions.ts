"use server";

import { prisma } from "@/lib/prisma";
import { shopSettingsId } from "@/lib/production-time";
import { readSettingsForm } from "@/lib/settings-input";
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
