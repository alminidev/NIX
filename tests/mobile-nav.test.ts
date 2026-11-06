import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  mobileNavA11y,
  shouldCloseMobileNav,
} from "../src/views/HomeView/components/mobile-nav";

const header = readFileSync("src/views/HomeView/components/Header.tsx", "utf8");

describe("menu mobile e teclado", () => {
  it("fechado fica inert e oculto, fora do Tab e do Shift+Tab", () => {
    assert.deepEqual(mobileNavA11y(false), { inert: true, "aria-hidden": true });
  });

  it("aberto volta para a ordem de foco", () => {
    assert.deepEqual(mobileNavA11y(true), { inert: false, "aria-hidden": false });
  });

  it("Escape fecha só quando o menu está aberto", () => {
    assert.equal(shouldCloseMobileNav("Escape", true), true);
    assert.equal(shouldCloseMobileNav("Escape", false), false);
    assert.equal(shouldCloseMobileNav("Tab", true), false);
  });

  it("o Header aplica o inert e devolve o foco ao botão no Escape", () => {
    assert.match(header, /\{\.\.\.mobileNavA11y\(mobileMenuOpen\)\}/);
    assert.match(header, /ref=\{menuButtonRef\}/);
    assert.match(header, /menuButtonRef\.current\?\.focus\(\)/);
    assert.match(header, /aria-controls="mobile-nav"/);
  });

  it("o menu vem logo depois do botão no DOM, para o Tab seguir a ordem visual", () => {
    assert.ok(header.indexOf('id="btn-mobile-menu"') < header.indexOf('id="mobile-nav"'));
  });
});
