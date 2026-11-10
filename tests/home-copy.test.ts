import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  catalogDisclaimer,
  catalogIntro,
  catalogSectionCopy,
  ctaDescription,
  faqItems,
  footerBrandText,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_URL,
} from "../src/views/HomeView/copy";

describe("textos da home portados da migracao-nextjs", () => {
  it("usa o WhatsApp e o Instagram atualizados", () => {
    assert.match(WHATSAPP_URL, /5511941692023/);
    assert.equal(INSTAGRAM_HANDLE, "@nix3d_");
    assert.equal(INSTAGRAM_URL, "https://www.instagram.com/nix3d_");
  });

  it("atualiza o catálogo, as seções e o aviso das imagens", () => {
    assert.equal(catalogIntro.title, "Linha Dry Box & Dry Box Station");
    assert.match(catalogIntro.description, /experiência mais prática/);
    assert.equal(catalogSectionCopy.armarios.title, "DRY BOX");
    assert.equal(catalogSectionCopy.stations.title, "DRY BOX STATION");
    assert.match(catalogDisclaimer, /AMS/);
  });

  it("traz as sete perguntas da migracao-nextjs", () => {
    assert.equal(faqItems.length, 7);
    assert.equal(
      faqItems[0]?.pergunta,
      "Quais filamentos posso armazenar na Dry Box?",
    );
    assert.match(faqItems[4]?.resposta ?? "", /InfinitePay/);
    assert.match(faqItems[4]?.resposta ?? "", /desconto no Pix/);
  });

  it("atualiza o texto do CTA e do rodapé", () => {
    assert.match(ctaDescription, /seus filamentos/);
    assert.match(footerBrandText, /armazenamento, conservação e organização/);
  });

  it("inclui o menu hambúrguer no header Tailwind", () => {
    const header = readFileSync(
      "src/views/HomeView/components/Header.tsx",
      "utf8",
    );
    assert.match(header, /id="btn-mobile-menu"/);
    assert.match(header, /id="mobile-nav"/);
    assert.match(header, /min-\[992px\]:hidden/);
  });
});
