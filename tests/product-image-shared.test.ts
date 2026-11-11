import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { productImagePublicUrl } from "../src/lib/product-image";

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

const hasDatabase = Boolean(process.env.DATABASE_URL);
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;

const runId = `IMG-${Date.now()}`;
const sharedUrl = productImagePublicUrl(supabaseUrl, "catalog/hero-showroom.jpg");
const uniqueUrl = productImagePublicUrl(supabaseUrl, `${runId.toLowerCase()}.jpg`);

describe(
  "foto compartilhada no Storage",
  { skip: !hasDatabase && "DATABASE_URL not set" },
  () => {
    let prisma: typeof import("../src/lib/prisma").prisma;
    let deleteRemovedProductImages: typeof import("../src/lib/storage").deleteRemovedProductImages;
    let categoryId: number;

    before(async () => {
      ({ prisma } = await import("../src/lib/prisma"));
      ({ deleteRemovedProductImages } = await import("../src/lib/storage"));

      const category = await prisma.category.create({
        data: { slug: runId.toLowerCase(), name: runId },
      });
      categoryId = category.id;
    });

    after(async () => {
      if (!prisma) return;
      await prisma.product.deleteMany({ where: { categoryId } });
      await prisma.category.delete({ where: { id: categoryId } });
      await prisma.$disconnect();
    });

    async function createProduct(sku: string, urls: string[]) {
      return prisma.product.create({
        data: {
          sku,
          name: sku,
          capacity: "12 filamentos",
          width: 35,
          height: 60,
          length: 46,
          weight: 18,
          price: 100,
          installments: "12x",
          description: "Produto criado pelo teste de foto compartilhada.",
          categoryId,
          images: {
            create: urls.map((url, sortOrder) => ({
              url,
              sortOrder,
              isPrimary: sortOrder === 0,
            })),
          },
        },
      });
    }

    it("não apaga o objeto que outro produto ainda usa e apaga o que ficou sem referência", async () => {
      const first = await createProduct(`${runId}-1`, [sharedUrl, uniqueUrl]);
      await createProduct(`${runId}-2`, [sharedUrl]);
      await prisma.productImage.deleteMany({ where: { productId: first.id } });

      const removed: string[][] = [];
      await deleteRemovedProductImages([sharedUrl, uniqueUrl], [], async (paths) => {
        removed.push(paths);
        return { error: null };
      });

      assert.deepEqual(removed, [[`${runId.toLowerCase()}.jpg`]]);

      const stillShared = await prisma.productImage.findMany({
        where: { url: sharedUrl, product: { categoryId } },
      });
      assert.equal(stillShared.length, 1);
    });
  },
);
