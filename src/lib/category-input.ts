import type { ICategoryFieldErrors } from "@/types/admin-category";

export interface ICategoryInput {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface IParsedCategoryForm {
  id: number | null;
  input: ICategoryInput | null;
  fieldErrors: ICategoryFieldErrors;
}

export const categoryFieldLimits = {
  name: 80,
  slug: 64,
  sortOrder: 9999,
} as const;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readId(formData: FormData) {
  const raw = readString(formData, "id");
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return Number.NaN;
  return Number(raw);
}

/** Identificador sugerido a partir do nome: minúsculas, sem acento, hífens. */
export function suggestCategorySlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, categoryFieldLimits.slug)
    .replace(/-+$/g, "");
}

export function readCategoryForm(formData: FormData): IParsedCategoryForm {
  const fieldErrors: ICategoryFieldErrors = {};
  const id = readId(formData);

  if (Number.isNaN(id)) {
    return { id, input: null, fieldErrors: {} };
  }

  const name = readString(formData, "name");
  const slug = readString(formData, "slug").toLowerCase();
  const sortRaw = readString(formData, "sortOrder");

  if (name.length < 2) {
    fieldErrors.name = "Informe o nome da categoria.";
  } else if (name.length > categoryFieldLimits.name) {
    fieldErrors.name = `O nome pode ter no máximo ${categoryFieldLimits.name} caracteres.`;
  }

  if (slug.length < 2) {
    fieldErrors.slug = "Informe um identificador com pelo menos 2 caracteres.";
  } else if (slug.length > categoryFieldLimits.slug || !slugPattern.test(slug)) {
    fieldErrors.slug =
      "Use letras minúsculas, números e hífens. Exemplo: armarios.";
  }

  if (!/^\d+$/.test(sortRaw) || Number(sortRaw) > categoryFieldLimits.sortOrder) {
    fieldErrors.sortOrder = `Informe uma ordem de 0 a ${categoryFieldLimits.sortOrder}.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { id, input: null, fieldErrors };
  }

  return {
    id,
    input: {
      name,
      slug,
      sortOrder: Number(sortRaw),
    },
    fieldErrors,
  };
}
