import {
  maxDimension,
  maxWeight,
  parseDimension,
  parseWeight,
} from "@/lib/product-dimensions";
import type { IProductFieldErrors } from "@/types/admin-product";
import type { IProductDimensions } from "@/types/product";

export interface IProductImageInput {
  url: string;
  isPrimary: boolean;
}

export interface IProductInput {
  sku: string;
  name: string;
  categoryId: number;
  capacity: string;
  dimensions: IProductDimensions;
  /** Peso unitário em kg */
  weight: number;
  price: string;
  installments: string;
  description: string;
  specifications: string[];
  images: IProductImageInput[];
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

export interface IParsedProductForm {
  id: number | null;
  input: IProductInput | null;
  fieldErrors: IProductFieldErrors;
}

export const productFieldLimits = {
  sku: 64,
  name: 160,
  capacity: 120,
  installments: 120,
  description: 1000,
  specification: 240,
  specifications: 30,
  image: 500,
  images: 12,
  sortOrder: 9999,
  price: 99_999_999.99,
} as const;

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

function parsePrice(raw: string): { value: string } | { error: string } {
  const cleaned = raw.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!cleaned) return { error: "Informe o preço." };

  let normalized = cleaned;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return { error: "Use um valor como 1.190,00." };
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric > productFieldLimits.price) {
    return { error: "O preço passa do limite permitido." };
  }

  return { value: numeric.toFixed(2) };
}

function isSafeImageUrl(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url.length > 1 && !url.includes("\\") && !url.includes("..");
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function readProductForm(formData: FormData): IParsedProductForm {
  const fieldErrors: IProductFieldErrors = {};
  const id = readId(formData);

  if (Number.isNaN(id)) {
    return { id, input: null, fieldErrors: {} };
  }

  const sku = readString(formData, "sku").toUpperCase();
  const name = readString(formData, "name");
  const categoryRaw = readString(formData, "categoryId");
  const capacity = readString(formData, "capacity");
  const length = parseDimension(readString(formData, "dimensionLength"));
  const width = parseDimension(readString(formData, "dimensionWidth"));
  const height = parseDimension(readString(formData, "dimensionHeight"));
  const weight = parseWeight(readString(formData, "weight"));
  const installments = readString(formData, "installments");
  const description = readString(formData, "description");
  const sortRaw = readString(formData, "sortOrder");
  const priceResult = parsePrice(readString(formData, "price"));

  if (sku.length < 2) {
    fieldErrors.sku = "Informe um SKU com pelo menos 2 caracteres.";
  } else if (sku.length > productFieldLimits.sku || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(sku)) {
    fieldErrors.sku = "Use letras, números e hífens. Exemplo: NIX-DB12.";
  }

  if (name.length < 2) {
    fieldErrors.name = "Informe o nome do produto.";
  } else if (name.length > productFieldLimits.name) {
    fieldErrors.name = `O nome pode ter no máximo ${productFieldLimits.name} caracteres.`;
  }

  if (!/^\d+$/.test(categoryRaw)) {
    fieldErrors.categoryId = "Selecione uma categoria.";
  }

  if (!capacity) {
    fieldErrors.capacity = "Informe a capacidade.";
  } else if (capacity.length > productFieldLimits.capacity) {
    fieldErrors.capacity = `A capacidade pode ter no máximo ${productFieldLimits.capacity} caracteres.`;
  }

  if (length === null || width === null || height === null) {
    fieldErrors.dimensions = `Informe comprimento, largura e altura em cm, de 0,1 a ${maxDimension.toLocaleString("pt-BR")}, com no máximo uma casa decimal.`;
  }

  if (weight === null) {
    fieldErrors.weight = `Informe o peso em kg, de 0,001 a ${maxWeight.toLocaleString("pt-BR")}, com no máximo 3 casas decimais.`;
  }

  if (!installments) {
    fieldErrors.installments = "Informe o parcelamento.";
  } else if (installments.length > productFieldLimits.installments) {
    fieldErrors.installments = `O parcelamento pode ter no máximo ${productFieldLimits.installments} caracteres.`;
  }

  if (!description) {
    fieldErrors.description = "Informe a descrição.";
  } else if (description.length > productFieldLimits.description) {
    fieldErrors.description = `A descrição pode ter no máximo ${productFieldLimits.description} caracteres.`;
  }

  if (!/^\d+$/.test(sortRaw) || Number(sortRaw) > productFieldLimits.sortOrder) {
    fieldErrors.sortOrder = `Informe uma ordem de 0 a ${productFieldLimits.sortOrder}.`;
  }

  if ("error" in priceResult) {
    fieldErrors.price = priceResult.error;
  }

  const specificationValues = formData
    .getAll("specifications")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (specificationValues.length > productFieldLimits.specifications) {
    fieldErrors.specifications = `Use no máximo ${productFieldLimits.specifications} especificações.`;
  } else if (specificationValues.some((text) => text.length > productFieldLimits.specification)) {
    fieldErrors.specifications = `Cada especificação pode ter no máximo ${productFieldLimits.specification} caracteres.`;
  }

  const primaryIndex = Number(formData.get("primaryImage"));
  const imageRows = formData
    .getAll("images")
    .filter((value): value is string => typeof value === "string")
    .map((url, index) => ({ url: url.trim(), index }))
    .filter((image) => image.url.length > 0);

  if (imageRows.length === 0) {
    fieldErrors.images = "Informe ao menos uma imagem.";
  } else if (imageRows.length > productFieldLimits.images) {
    fieldErrors.images = `Use no máximo ${productFieldLimits.images} imagens.`;
  } else if (imageRows.some((image) => image.url.length > productFieldLimits.image || !isSafeImageUrl(image.url))) {
    fieldErrors.images = "Use um caminho do site (/images/...) ou um endereço http(s).";
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !("value" in priceResult) ||
    length === null ||
    width === null ||
    height === null ||
    weight === null
  ) {
    return { id, input: null, fieldErrors };
  }

  const images = imageRows.map((image) => ({
    url: image.url,
    isPrimary: image.index === primaryIndex,
  }));

  if (!images.some((image) => image.isPrimary)) {
    images[0].isPrimary = true;
  }

  return {
    id,
    input: {
      sku,
      name,
      categoryId: Number(categoryRaw),
      capacity,
      dimensions: { length, width, height },
      weight,
      price: priceResult.value,
      installments,
      description,
      specifications: specificationValues,
      images,
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
      sortOrder: Number(sortRaw),
    },
    fieldErrors,
  };
}
