import assert from "node:assert/strict";
import { describe, it } from "node:test";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import {
  organizationJsonLd,
  siteSeo,
} from "../src/lib/site-seo";

describe("SEO portado da migracao-nextjs", () => {
  it("descreve o produto com controle térmico e imagem oficial", () => {
    assert.match(siteSeo.description, /20% UR/);
    assert.match(siteSeo.description, /Bambu Lab AMS/);
    assert.equal(siteSeo.ogImage, "/images/hero-showroom-oficial.png");
    assert.equal(siteSeo.twitterHandle, "@nix3d_");
    assert.equal(siteSeo.themeColor, "#0b0e14");
  });

  it("gera robots.txt com sitemap e reserva de backup", () => {
    const doc = robots();
    assert.equal(doc.sitemap, "https://nix3d.com.br/sitemap.xml");
    const first = Array.isArray(doc.rules) ? doc.rules[0] : doc.rules;
    assert.ok(first);
    assert.deepEqual(first.disallow, [
      "/05-build/Backup/",
      "/Backup/",
      "/admin",
      "/api",
    ]);
  });

  it("lista a home e as âncoras no sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    assert.ok(urls.includes("https://nix3d.com.br/"));
    assert.ok(urls.includes("https://nix3d.com.br/#produtos"));
    assert.ok(urls.includes("https://nix3d.com.br/#faq"));
  });

  it("monta JSON-LD com telefone e Instagram atualizados, sem preços estáticos", () => {
    const graph = organizationJsonLd("https://nix3d.com.br");
    const serialized = JSON.stringify(graph);
    assert.match(serialized, /\+5511941692023/);
    assert.match(serialized, /instagram.com\/nix3d_/);
    assert.doesNotMatch(serialized, /"price":/);
  });
});
