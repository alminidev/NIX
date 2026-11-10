import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { catalogSectionCopy } from "../src/views/HomeView/copy";

const hero = readFileSync("src/views/HomeView/components/HeroStage.tsx", "utf8");
const features = readFileSync("src/views/HomeView/components/Features.tsx", "utf8");

describe("hero responsiva igual à migracao-nextjs", () => {
  it("até 768px mantém só a proporção 16/9, sem altura mínima", () => {
    assert.match(hero, /aspect-video/);
    assert.match(hero, /max-\[768px\]:min-h-0/);
    assert.match(hero, /max-\[768px\]:max-h-none/);
    assert.doesNotMatch(hero, /max-\[640px\]:min-h-100/);
  });

  it("até 768px mostra a imagem inteira, alinhada embaixo", () => {
    assert.match(hero, /max-\[768px\]:object-contain/);
    assert.match(hero, /max-\[768px\]:object-bottom/);
  });

  it("até 768px esconde o título só visualmente, sem tirar o h1", () => {
    assert.match(hero, /max-\[768px\]:sr-only/);
    assert.match(hero, /<h1/);
    assert.doesNotMatch(hero, /max-\[768px\]:hidden/);
  });
});

describe("eyebrows em caixa alta como na migracao-nextjs", () => {
  it("usa o texto em maiúsculas", () => {
    assert.equal(catalogSectionCopy.armarios.eyebrow, "CONHEÇA NOSSAS SOLUÇÕES");
    assert.match(features, /TECNOLOGIA &amp; PROTEÇÃO/);
  });
});
