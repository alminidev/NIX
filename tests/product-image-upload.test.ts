import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";
import { productImageLimitBytes, productImageMessages } from "../src/lib/product-image";

try {
  process.loadEnvFile(".env");
} catch {
  // sem .env
}
try {
  process.loadEnvFile(".env.local");
} catch {
  // sem .env.local
}

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable";

let session: { user: { role: string } } | null = null;
const uploads: Uint8Array[] = [];

mock.module("next/navigation", {
  exports: {
    redirect() {
      throw new Error("redirect");
    },
  },
});

mock.module("next/cache", {
  exports: {
    updateTag() {},
  },
});

mock.module("@/lib/session", {
  exports: {
    getSession: async () => session,
  },
});

mock.module("@/lib/storage", {
  exports: {
    uploadProductImage: async (bytes: Uint8Array) => {
      uploads.push(bytes);
      return {
        ok: true as const,
        url: "http://127.0.0.1:54321/storage/v1/object/public/produtos/nova.jpg",
        path: "nova.jpg",
      };
    },
    deleteRemovedProductImages: async () => {},
  },
});

class SizedFile extends File {
  #declaredSize: number;
  reads = 0;

  constructor(bytes: Uint8Array, name: string, declaredSize = bytes.byteLength) {
    super([bytes], name, { type: "image/jpeg" });
    this.#declaredSize = declaredSize;
  }

  get size() {
    return this.#declaredSize;
  }

  async arrayBuffer() {
    this.reads += 1;
    return super.arrayBuffer();
  }
}

function jpeg() {
  return Uint8Array.of(0xff, 0xd8, 0xff, 0x00);
}

describe("uploadProductImageAction", () => {
  let uploadProductImageAction: typeof import("../src/app/admin/products/actions").uploadProductImageAction;

  before(async () => {
    ({ uploadProductImageAction } = await import("../src/app/admin/products/actions"));
  });

  it("recusa quem não é admin e não lê o arquivo", async () => {
    const file = new SizedFile(jpeg(), "foto.jpg");
    const body = new FormData();
    body.set("file", file);

    session = null;
    const anonymous = await uploadProductImageAction(body);
    session = { user: { role: "cliente" } };
    const customer = await uploadProductImageAction(body);

    assert.deepEqual(anonymous, { error: "Acesso negado." });
    assert.deepEqual(customer, { error: "Acesso negado." });
    assert.equal(file.reads, 0);
    assert.equal(uploads.length, 0);
  });

  it("recusa arquivo vazio ou maior que 4 MB antes de ler os bytes", async () => {
    session = { user: { role: "admin" } };
    const empty = new SizedFile(new Uint8Array(), "vazia.jpg", 0);
    const huge = new SizedFile(jpeg(), "grande.jpg", productImageLimitBytes + 1);

    const emptyBody = new FormData();
    emptyBody.set("file", empty);
    const hugeBody = new FormData();
    hugeBody.set("file", huge);

    assert.deepEqual(await uploadProductImageAction(emptyBody), {
      error: productImageMessages.empty,
    });
    assert.deepEqual(await uploadProductImageAction(hugeBody), {
      error: productImageMessages.tooLarge,
    });
    assert.equal(empty.reads, 0);
    assert.equal(huge.reads, 0);
    assert.equal(uploads.length, 0);
  });

  it("envia a imagem quando o admin escolhe um arquivo válido", async () => {
    session = { user: { role: "admin" } };
    const file = new SizedFile(jpeg(), "foto.jpg");
    const body = new FormData();
    body.set("file", file);

    const result = await uploadProductImageAction(body);

    assert.deepEqual(result, {
      url: "http://127.0.0.1:54321/storage/v1/object/public/produtos/nova.jpg",
    });
    assert.equal(file.reads, 1);
    assert.equal(uploads.length, 1);
  });
});
