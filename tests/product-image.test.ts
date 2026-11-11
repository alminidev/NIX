import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  forgetRemovedProductImages,
  isProductImageUrl,
  productImageCacheControl,
  productImageLimitBytes,
  productImageMessages,
  productImageObjectPath,
  productImagePathsToDelete,
  productImagePreview,
  productImagePublicUrl,
  storeProductImage,
  validateProductImageBytes,
  type IProductImageBucket,
} from "../src/lib/product-image";

const origin = "http://127.0.0.1:54321";

function jpeg(size = 4) {
  const bytes = new Uint8Array(size);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  return bytes;
}

function png() {
  return Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00);
}

function webp() {
  const bytes = new Uint8Array(12);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  return bytes;
}

describe("validateProductImageBytes", () => {
  it("aceita JPEG, PNG e WebP pelos bytes iniciais", () => {
    const jpegFile = validateProductImageBytes(jpeg());
    const pngFile = validateProductImageBytes(png());
    const webpFile = validateProductImageBytes(webp());

    assert.equal(jpegFile.ok, true);
    assert.equal(pngFile.ok, true);
    assert.equal(webpFile.ok, true);
    if (!jpegFile.ok || !pngFile.ok || !webpFile.ok) return;
    assert.equal(jpegFile.file.extension, "jpg");
    assert.equal(pngFile.file.mime, "image/png");
    assert.equal(webpFile.file.extension, "webp");
  });

  it("aceita uma imagem de exatamente 4 MB", () => {
    const bytes = jpeg(productImageLimitBytes);
    const result = validateProductImageBytes(bytes);
    assert.equal(result.ok, true);
  });

  it("recusa arquivo vazio, maior que 4 MB, GIF, SVG e texto com extensão trocada", () => {
    assert.deepEqual(validateProductImageBytes(new Uint8Array()), {
      ok: false,
      error: productImageMessages.empty,
    });
    assert.equal(validateProductImageBytes(jpeg(productImageLimitBytes + 1)).ok, false);
    assert.equal(
      validateProductImageBytes(Uint8Array.from(Buffer.from("GIF89aXXXX"))).ok,
      false,
    );
    assert.equal(
      validateProductImageBytes(Uint8Array.from(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"))).ok,
      false,
    );
    assert.equal(
      validateProductImageBytes(Uint8Array.from(Buffer.from("nao e uma imagem"))).ok,
      false,
    );
  });
});

describe("URL pública do bucket", () => {
  it("monta e lê o caminho do objeto", () => {
    const url = productImagePublicUrl(origin, "catalog/dry-box-12.jpg");
    assert.equal(
      url,
      "http://127.0.0.1:54321/storage/v1/object/public/produtos/catalog/dry-box-12.jpg",
    );
    assert.equal(productImageObjectPath(url, `${origin}/`), "catalog/dry-box-12.jpg");
    assert.equal(isProductImageUrl(url, origin), true);
    assert.equal(isProductImageUrl("/images/dry-box-12.jpg", origin), true);
  });

  it("rejeita outro host, outro bucket, caminho do site fora de /images e URL externa", () => {
    const foreign = "https://exemplo.com/a.jpg";
    const otherBucket = productImagePublicUrl(origin, "catalog/a.jpg").replace(
      "/produtos/",
      "/outro/",
    );

    assert.equal(isProductImageUrl(foreign, origin), false);
    assert.equal(isProductImageUrl(otherBucket, origin), false);
    assert.equal(isProductImageUrl("/secret.jpg", origin), false);
    assert.equal(isProductImageUrl("/images/../.env", origin), false);
    assert.equal(productImageObjectPath(foreign, origin), null);
    assert.equal(
      productImageObjectPath(productImagePublicUrl("https://outro.supabase.co", "a.jpg"), origin),
      null,
    );
  });
});

describe("troca e exclusão", () => {
  const kept = productImagePublicUrl(origin, "nova.jpg");
  const removed = productImagePublicUrl(origin, "antiga.jpg");

  it("apaga só o objeto que saiu do produto e ignora caminho do site", () => {
    assert.deepEqual(
      productImagePathsToDelete(
        [removed, "/images/dry-box-12.jpg", "https://exemplo.com/a.jpg"],
        [kept],
        origin,
      ),
      ["antiga.jpg"],
    );
  });

  it("não desfaz o salvamento quando o Storage falha", async () => {
    const logs: unknown[][] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => {
      logs.push(args);
    };

    try {
      await forgetRemovedProductImages([removed], [], origin, async () => {
        throw new Error("storage parado");
      });
      await forgetRemovedProductImages([removed], [], origin, async () => ({
        error: "permission denied",
      }));
    } finally {
      console.error = original;
    }

    assert.equal(logs.length, 2);
    assert.equal(logs[0][0], "Falha ao apagar imagem de produto.");
  });

  it("não chama o bucket quando nada saiu", async () => {
    let called = false;
    await forgetRemovedProductImages([kept], [kept], origin, async () => {
      called = true;
      return { error: null };
    });
    assert.equal(called, false);
  });
});

describe("prévia no formulário", () => {
  const bucketUrl = productImagePublicUrl(origin, "catalog/hero-showroom.jpg");

  it("otimiza caminho do site e URL do bucket, e deixa URL externa sem o otimizador", () => {
    assert.equal(productImagePreview("/images/dry-box-12.jpg", origin), "optimized");
    assert.equal(productImagePreview(bucketUrl, origin), "optimized");
    assert.equal(productImagePreview("https://exemplo.com/antiga.jpg", origin), "plain");
    assert.equal(productImagePreview("nota", origin), "hidden");
  });
});

describe("storeProductImage", () => {
  function bucket() {
    const calls: Array<{ path: string; contentType: string; cacheControl: string; upsert: boolean }> = [];
    const fake: IProductImageBucket = {
      upload: async (path, _body, options) => {
        calls.push({ path, ...options });
        return { error: null };
      },
      getPublicUrl: (path) => productImagePublicUrl(origin, path),
    };
    return { fake, calls };
  }

  it("grava com nome gerado, tipo pelos bytes e cache longo", async () => {
    const { fake, calls } = bucket();
    const result = await storeProductImage(jpeg(), fake);

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.path, /^[0-9a-f-]{36}\.jpg$/);
    assert.equal(result.url, productImagePublicUrl(origin, result.path));
    assert.equal(calls[0]?.contentType, "image/jpeg");
    assert.equal(calls[0]?.cacheControl, productImageCacheControl);
    assert.equal(calls[0]?.upsert, false);
  });

  it("não envia arquivo recusado e devolve a mensagem em português", async () => {
    const { fake, calls } = bucket();
    const result = await storeProductImage(Uint8Array.from(Buffer.from("GIF89a")), fake);

    assert.deepEqual(result, { ok: false, error: productImageMessages.type });
    assert.equal(calls.length, 0);
  });

  it("usa o caminho pedido no catálogo", async () => {
    const { fake, calls } = bucket();
    const result = await storeProductImage(png(), fake, {
      path: "catalog/dry-box-48.png",
      upsert: true,
    });

    assert.equal(result.ok, true);
    assert.equal(calls[0]?.path, "catalog/dry-box-48.png");
    assert.equal(calls[0]?.upsert, true);
    assert.equal(calls[0]?.contentType, "image/png");
  });
});
