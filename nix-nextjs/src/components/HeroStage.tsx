/**
 * HeroStage — Seção hero do showroom NIX 3D.
 * Imagem completa cobrindo toda a hero com título sobreposto.
 * Sem efeitos pesados de glow para máxima performance e leveza.
 */
export default function HeroStage() {
  return (
    <section id="hero" className="hero-stage">
      <div className="hero-media-wrapper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-showroom-oficial.png"
          alt="Linha completa NIX em estúdio showroom"
          width={1920}
          height={1080}
          loading="eager"
        />
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            A evolução definitiva do seu<br />setup de impressão 3D.
          </h1>
        </div>
      </div>
    </section>
  );
}
