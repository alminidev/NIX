import GlowAtmosphere from './GlowAtmosphere';

/**
 * HeroStage — Seção hero do showroom NIX 3D.
 * Idêntico ao <section id="hero" class="hero-stage"> do HTML original.
 *
 * Usa <img> nativa (não next/image) para preservar o markup e as dimensões
 * exatas de renderização definidas no CSS original (aspect-ratio: 16/9 via CSS).
 */
export default function HeroStage() {
  return (
    <section id="hero" className="hero-stage">
      <GlowAtmosphere />

      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">A evolução definitiva do seu setup de impressão 3D.</h1>
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
      </div>
    </section>
  );
}
