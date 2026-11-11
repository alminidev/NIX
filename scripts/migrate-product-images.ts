import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";

config({ path: ".env" });
config({ path: ".env.local", override: true });

async function main() {
  const apply = process.argv.includes("--apply") && !process.argv.includes("--dry-run");
  const { prisma } = await import("../src/lib/prisma");
  const { uploadProductImage } = await import("../src/lib/storage");

  const rows = await prisma.productImage.findMany({
    where: { url: { startsWith: "/images/" } },
    select: { id: true, url: true },
    orderBy: { id: "asc" },
  });

  console.log(`${rows.length} imagem(ns) ainda apontam para /images/.`);

  let missing = 0;
  let migrated = 0;

  for (const row of rows) {
    const filename = path.basename(row.url);
    if (!filename || filename !== row.url.slice("/images/".length) || filename.includes("..")) {
      missing += 1;
      console.log(`ignorada #${row.id}: caminho fora de /images/`);
      continue;
    }

    const filePath = path.join(process.cwd(), "public", "images", filename);

    if (!apply) {
      console.log(`subiria #${row.id} ${row.url}`);
      continue;
    }

    let bytes: Buffer;
    try {
      bytes = await readFile(filePath);
    } catch {
      missing += 1;
      console.log(`faltando #${row.id}: public/images/${filename}`);
      continue;
    }

    const uploaded = await uploadProductImage(new Uint8Array(bytes));
    if (!uploaded.ok) {
      missing += 1;
      console.log(`falhou #${row.id}: ${uploaded.error}`);
      continue;
    }

    await prisma.productImage.update({
      where: { id: row.id },
      data: { url: uploaded.url },
    });
    migrated += 1;
    console.log(`atualizada #${row.id}`);
  }

  if (!apply) {
    console.log("Nada foi gravado. Rode de novo com --apply para trocar as URLs.");
  } else {
    console.log(`${migrated} atualizada(s), ${missing} pendente(s).`);
  }

  console.log("URLs externas não são baixadas por este script. Envie essas fotos pelo admin.");
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Falha ao migrar imagens.");
  process.exit(1);
});
