import assert from "node:assert/strict";
import { describe, it } from "node:test";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";
import {
  organizationJsonLd,
  siteOrigin,
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
    assert.equal(doc.sitemap, `${siteOrigin()}/sitemap.xml`);
    const first = Array.isArray(doc.rules) ? doc.rules[0] : doc.rules;
    assert.ok(first);
    assert.deepEqual(first.disallow, [
      "/05-build/Backup/",
      "/Backup/",
      "/admin",
      "/api",
    ]);
  });

  it("lista só páginas canônicas no sitemap, sem âncoras", () => {
    const origin = siteOrigin();
    const urls = sitemap().map((entry) => entry.url);
    assert.deepEqual(urls, [`${origin}/`]);
    assert.ok(urls.every((url) => !url.includes("#")));
  });

  it("monta JSON-LD com telefone e Instagram atualizados, sem preços estáticos", () => {
    const graph = organizationJsonLd("https://nix3d.com.br");
    const serialized = JSON.stringify(graph);
    assert.match(serialized, /\+5511941692023/);
    assert.match(serialized, /instagram.com\/nix3d_/);
    assert.doesNotMatch(serialized, /"price":/);
  });
});

describe("manifest", () => {
  it("declara os tamanhos reais dos ícones", async () => {
    const { default: manifest } = await import("../src/app/manifest");
    const { readFileSync } = await import("node:fs");
    const icons = manifest().icons ?? [];
    const png = icons.find((icon) => icon.src.endsWith(".png"));
    assert.ok(png);
    const buf = readFileSync(`public${png.src}`);
    assert.equal(png.sizes, `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`);
    const ico = icons.find((icon) => icon.src.endsWith(".ico"));
    assert.ok(ico);
    const data = readFileSync(`public${ico.src}`);
    const sizes = Array.from({ length: data.readUInt16LE(4) }, (_, i) => {
      const side = data[6 + 16 * i] || 256;
      return `${side}x${side}`;
    });
    assert.equal(ico.sizes, sizes.join(" "));
  });
});

describe("robots", () => {
  it("aplica as mesmas restrições a todos os grupos", () => {
    const rules = robots().rules;
    const list = Array.isArray(rules) ? rules : [rules];
    for (const rule of list) {
      const disallow = [rule.disallow ?? []].flat();
      assert.ok(disallow.includes("/admin"), String(rule.userAgent));
      assert.ok(disallow.includes("/api"), String(rule.userAgent));
    }
    assert.ok(!list.some((r) => r.userAgent === "Bingbot"));
  });
});

describe("FAQPage JSON-LD", () => {
  it("usa as mesmas perguntas e respostas exibidas no FAQ", async () => {
    const { faqPageJsonLd } = await import("../src/lib/site-seo");
    const { faqItems } = await import("../src/views/HomeView/copy");
    const faq = faqPageJsonLd("https://nix3d.com.br");
    assert.equal(faq["@type"], "FAQPage");
    assert.equal(faq["@id"], "https://nix3d.com.br/#faqpage");
    assert.deepEqual(
      faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]),
      faqItems.map((item) => [item.pergunta, item.resposta]),
    );
    const pagamento = faq.mainEntity.find((q) => /pagamento/i.test(q.name));
    assert.ok(pagamento);
    assert.equal(
      pagamento.acceptedAnswer.text,
      faqItems.find((item) => /pagamento/i.test(item.pergunta))?.resposta,
    );
  });

  it("serializa sem permitir fechar a tag script", async () => {
    const { serializeJsonLd } = await import("../src/lib/site-seo");
    const out = serializeJsonLd({ text: "</script><b>&\u2028" });
    assert.ok(!out.includes("<"));
    assert.ok(!out.includes(">"));
    assert.ok(!out.includes("&"));
    assert.deepEqual(JSON.parse(out), { text: "</script><b>&\u2028" });
  });
});
