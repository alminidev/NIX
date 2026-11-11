import { MissingEnvironmentVariableError } from "@/app/_errors/missing-environment-variable.error";
import { prisma } from "@/lib/prisma";
import {
  forgetRemovedProductImages,
  productBucket,
  productImagePublicUrl,
  removedProductImageUrls,
  storeProductImage,
} from "@/lib/product-image";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "server-only";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new MissingEnvironmentVariableError(name);
  return value;
}

let storageAdmin: SupabaseClient | undefined;

export function getStorageAdmin() {
  if (storageAdmin) return storageAdmin;

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  storageAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return storageAdmin;
}

export async function uploadProductImage(
  bytes: Uint8Array,
  options?: { path?: string; upsert?: boolean },
) {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const bucket = getStorageAdmin().storage.from(productBucket);

  return storeProductImage(
    bytes,
    {
      upload: async (path, body, uploadOptions) => {
        const { error } = await bucket.upload(path, body, {
          contentType: uploadOptions.contentType,
          cacheControl: uploadOptions.cacheControl,
          upsert: uploadOptions.upsert,
        });
        return { error: error ? error.message : null };
      },
      getPublicUrl: (path) => productImagePublicUrl(supabaseUrl, path),
    },
    options,
  );
}

async function removePaths(paths: string[]) {
  const { error } = await getStorageAdmin().storage.from(productBucket).remove(paths);
  return { error: error ? error.message : null };
}

async function urlsWithoutProductImage(urls: string[]) {
  if (urls.length === 0) return [];

  const rows = await prisma.productImage.findMany({
    where: { url: { in: urls } },
    select: { url: true },
  });
  const stillUsed = new Set(rows.map((row) => row.url));
  return urls.filter((url) => !stillUsed.has(url));
}

/**
 * Apaga do bucket as fotos que saíram do produto e que nenhum outro
 * ProductImage ainda referencia. Falha de Storage não desfaz o que já foi
 * gravado no banco: a falha fica no log e o salvamento segue.
 */
export async function deleteRemovedProductImages(
  previous: string[],
  next: string[],
  remove: (paths: string[]) => Promise<{ error: string | null }> = removePaths,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    console.error("Falha ao apagar imagem de produto.");
    return;
  }

  try {
    const removed = removedProductImageUrls(previous, next);
    const unused = await urlsWithoutProductImage(removed);
    await forgetRemovedProductImages(unused, [], supabaseUrl, remove);
  } catch {
    console.error("Falha ao apagar imagem de produto.");
  }
}

export async function listProductImagePaths() {
  const bucket = getStorageAdmin().storage.from(productBucket);
  const paths: string[] = [];

  async function walk(prefix: string) {
    const limit = 100;
    let offset = 0;

    for (;;) {
      const { data, error } = await bucket.list(prefix, { limit, offset });
      if (error) throw new Error("Não foi possível listar as imagens de produto.");

      for (const item of data ?? []) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          await walk(path);
          continue;
        }
        paths.push(path);
      }

      if (!data || data.length < limit) break;
      offset += data.length;
    }
  }

  await walk("");
  return paths;
}

export async function removeProductImagePaths(paths: string[]) {
  if (paths.length === 0) return;
  const result = await removePaths(paths);
  if (result.error) throw new Error("Não foi possível apagar as imagens de produto.");
}
