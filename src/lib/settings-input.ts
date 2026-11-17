import { parseProductionTimeTemplate } from "@/lib/production-time";
import type { ISettingsFieldErrors } from "@/types/admin-settings";

export interface ISettingsInput {
  productionTimeTemplate: string;
}

export interface IParsedSettingsForm {
  input: ISettingsInput | null;
  fieldErrors: ISettingsFieldErrors;
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readSettingsForm(formData: FormData): IParsedSettingsForm {
  const parsed = parseProductionTimeTemplate(
    readString(formData, "productionTimeTemplate"),
    { allowEmpty: false },
  );

  if ("error" in parsed || !parsed.value) {
    return {
      input: null,
      fieldErrors: {
        productionTimeTemplate:
          "error" in parsed
            ? parsed.error
            : "Informe o texto e inclua {dias}.",
      },
    };
  }

  return {
    input: { productionTimeTemplate: parsed.value },
    fieldErrors: {},
  };
}
