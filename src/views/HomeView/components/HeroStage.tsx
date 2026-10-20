import { CART_URL } from "@/data/produtos";
import { ArrowDown } from "lucide-react";
import GlowAtmosphere from "../../../components/GlowAtmosphere";

/**
 * HeroStage — Seção hero do showroom NIX 3D.
 * Idêntico ao <section id="hero" class="hero-stage"> do HTML original.
 *
 * Usa <img> nativa (não next/image) para preservar o markup e as dimensões
 * exatas de renderização definidas no CSS original (aspect-ratio: 16/9 via CSS).
 *
 * URL do checkout:
 *    Centralizada em @/data/produtos (lê process.env.NEXT_PUBLIC_CART_URL).
 */
export default function HeroStage() {
  const cartUrl = CART_URL;

  return (
    <section id="hero" className="hero-stage">
      <GlowAtmosphere />

      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            A evolução definitiva do seu setup de impressão 3D.
          </h1>
          <p className="hero-desc">
            Controle térmico ativo permanente abaixo de 20% UR. Proteja seus
            filamentos contra umidade, elimine falhas de impressão e transforme
            seu espaço em um showroom de alto padrão.
          </p>
        </div>

        <div className="hero-media-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-showroom.jpg"
            alt="Linha completa NIX em bancada de estúdio de tecnologia"
            width={1120}
            height={630}
            loading="eager"
          />
        </div>

        <div className="hero-actions">
          <a href="#produtos" className="btn-primary">
            Ver Vitrine de Produtos
            <ArrowDown size={16} aria-hidden />
          </a>
          <a
            id="btn-hero-checkout"
            href={cartUrl}
            className="btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ir para Checkout
          </a>
        </div>
      </div>
    </section>
  );
}
