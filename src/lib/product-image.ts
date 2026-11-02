export const productBucket = "produtos";

/** 4 MB. O mesmo limite vale no bucket e na Server Action. */
export const productImageLimitBytes = 4 * 1024 * 1024;

/** Um ano. O nome do arquivo muda a cada troca, então o objeto é imutável. */
export const productImageCacheControl = "31536000";

const publicPrefix = `/storage/v1/object/public/${productBucket}/`;

const siteImagePath = /^\/images\/[A-Za-z0-9._/-]+$/;

export const productImageMessages = {
  empty: "A imagem está vazia.",
  tooLarge: "A imagem passa de 4 MB.",
  type: "Use uma imagem JPEG, PNG ou WebP.",
  upload: "Não foi possível enviar a imagem. Tente novamente.",
  url: "Use uma imagem enviada pelo painel ou um caminho do site (/images/...).",
} as const;

export interface IProductImageFile {
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
}

export function detectProductImage(bytes: Uint8Array): IProductImageFile | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", extension: "png" };
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mime: "image/webp", extension: "webp" };
  }

  return null;
}

export function validateProductImageBytes(
  bytes: Uint8Array,
): { ok: true; file: IProductImageFile } | { ok: false; error: string } {
  if (bytes.byteLength === 0) {
    return { ok: false, error: productImageMessages.empty };
  }

  if (bytes.byteLength > productImageLimitBytes) {
    return { ok: false, error: productImageMessages.tooLarge };
  }

  const file = detectProductImage(bytes);
  if (!file) return { ok: false, error: productImageMessages.type };
  return { ok: true, file };
}

export function isSiteImagePath(url: string) {
  return siteImagePath.test(url) && !url.includes("..");
}

/** Caminho do objeto dentro do bucket, ou null se a URL não for nossa. */
export function productImageObjectPath(url: string, supabaseUrl: string) {
  let base: URL;
  let parsed: URL;

  try {
    base = new URL(supabaseUrl);
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.origin !== base.origin || parsed.username || parsed.password) return null;
  if (parsed.search || parsed.hash) return null;
  if (!parsed.pathname.startsWith(publicPrefix)) return null;

  let objectPath: string;
  try {
    objectPath = decodeURIComponent(parsed.pathname.slice(publicPrefix.length));
  } catch {
    return null;
  }

  if (
    !objectPath ||
    objectPath.startsWith("/") ||
    objectPath.includes("..") ||
    objectPath.includes("\\") ||
    objectPath.includes("\0")
  ) {
    return null;
  }

  return objectPath;
}

export function productImagePublicUrl(supabaseUrl: string, objectPath: string) {
  const origin = new URL(supabaseUrl).origin;
  const encoded = objectPath.split("/").map(encodeURIComponent).join("/");
  return `${origin}${publicPrefix}${encoded}`;
}

export function isProductImageUrl(url: string, supabaseUrl?: string) {
  if (isSiteImagePath(url)) return true;
  if (!supabaseUrl) return false;
  return productImageObjectPath(url, supabaseUrl) !== null;
}

/** `plain` é URL antiga de fora do bucket: o next/image não otimiza esse host. */
export type ProductImagePreview = "optimized" | "plain" | "hidden";

export function productImagePreview(url: string, supabaseUrl?: string): ProductImagePreview {
  const value = url.trim();
  if (isProductImageUrl(value, supabaseUrl)) return "optimized";
  if (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    (value.startsWith("/") && !value.startsWith("//"))
  ) {
    return "plain";
  }
  return "hidden";
}

export function removedProductImageUrls(previous: string[], next: string[]) {
  const kept = new Set(next);
  return previous.filter((url) => !kept.has(url));
}

export function productImagePathsToDelete(
  previous: string[],
  next: string[],
  supabaseUrl: string,
) {
  const paths: string[] = [];

  for (const url of removedProductImageUrls(previous, next)) {
    const objectPath = productImageObjectPath(url, supabaseUrl);
    if (objectPath) paths.push(objectPath);
  }

  return paths;
}

export async function forgetRemovedProductImages(
  previous: string[],
  next: string[],
  supabaseUrl: string,
  remove: (paths: string[]) => Promise<{ error: string | null }>,
) {
  const paths = productImagePathsToDelete(previous, next, supabaseUrl);
  if (paths.length === 0) return;

  try {
    const result = await remove(paths);
    if (result.error) console.error("Falha ao apagar imagem de produto.");
  } catch {
    console.error("Falha ao apagar imagem de produto.");
  }
}

export interface IProductImageBucket {
  upload: (
    path: string,
    body: Uint8Array,
    options: { contentType: string; cacheControl: string; upsert: boolean },
  ) => Promise<{ error: string | null }>;
  getPublicUrl: (path: string) => string;
}

function safeObjectPath(path: string) {
  return Boolean(path) && !path.startsWith("/") && !path.includes("..") && !path.includes("\\");
}

export async function storeProductImage(
  bytes: Uint8Array,
  bucket: IProductImageBucket,
  options?: { path?: string; upsert?: boolean },
): Promise<{ ok: true; url: string; path: string } | { ok: false; error: string }> {
  const checked = validateProductImageBytes(bytes);
  if (!checked.ok) return checked;

  const path = options?.path ?? `${globalThis.crypto.randomUUID()}.${checked.file.extension}`;
  if (!safeObjectPath(path)) {
    return { ok: false, error: productImageMessages.upload };
  }

  const uploaded = await bucket.upload(path, bytes, {
    contentType: checked.file.mime,
    cacheControl: productImageCacheControl,
    upsert: options?.upsert ?? false,
  });

  if (uploaded.error) {
    console.error("Falha ao enviar imagem de produto.");
    return { ok: false, error: productImageMessages.upload };
  }

  return { ok: true, url: bucket.getPublicUrl(path), path };
}
