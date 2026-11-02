import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

async function main() {
  const apply = process.argv.includes("--apply") && !process.argv.includes("--dry-run");
  const { prisma } = await import("../src/lib/prisma");
  const { productImageObjectPath } = await import("../src/lib/product-image");
  const { listProductImagePaths, removeProductImagePaths } = await import("../src/lib/storage");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL não está definida.");
    process.exit(1);
  }

  const rows = await prisma.productImage.findMany({ select: { url: true } });
  const referenced = new Set(
    rows
      .map((row) => productImageObjectPath(row.url, supabaseUrl))
      .filter((path): path is string => path !== null),
  );
  const objects = await listProductImagePaths();
  const orphans = objects.filter((path) => !referenced.has(path));

  console.log(`${orphans.length} arquivo(s) órfão(s) no bucket produtos.`);
  for (const path of orphans) console.log(path);

  if (!apply) {
    console.log("Nada foi apagado. Rode de novo com --apply para remover.");
  } else if (orphans.length > 0) {
    await removeProductImagePaths(orphans);
    console.log("Arquivos órfãos removidos.");
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falha ao limpar imagens órfãs.");
  process.exit(1);
});
