import Image from "next/image";

/**
 * HeroStage — Seção hero do showroom NIX 3D.
 * A imagem cobre toda a área da hero (16/9) e o título fica sobreposto no topo.
 * Até 768px a imagem aparece inteira e o título fica só para leitores de tela e SEO.
 */
export default function HeroStage() {
  return (
    <section
      id="hero"
      className="relative flex aspect-video max-h-235 min-h-120 w-full items-start justify-center overflow-hidden bg-surface-hero-void max-[768px]:max-h-none max-[768px]:min-h-0 max-[768px]:bg-transparent"
    >
      <div className="absolute inset-0 z-[1] size-full overflow-hidden max-[768px]:flex max-[768px]:items-center max-[768px]:justify-center">
        <Image
          src="/images/hero-estudio-filamentos.png"
          alt="Linha completa NIX em estúdio showroom com estufas Dry Box e estações de impressão 3D"
          fill
          preload
          unoptimized
          sizes="100vw"
          className="object-cover object-bottom max-[768px]:object-contain max-[768px]:object-bottom"
        />
      </div>

      <div className="pointer-events-none relative z-[2] mx-auto w-full max-w-[1200px] px-4 pt-5 min-[640px]:pt-[clamp(16px,2.4vw,36px)]">
        <div className="pointer-events-auto mx-auto max-w-[1100px] text-center">
          <h1 className="mx-auto text-[clamp(1.375rem,4.2vw,3.85rem)] leading-[1.2] font-bold tracking-[-0.025em] text-black">
            A evolução definitiva do seu
            <br />
            setup de impressão 3D.
          </h1>
          <p className="mx-auto mt-2 hidden max-w-[900px] text-[clamp(0.9375rem,1.4vw,1.2rem)] leading-relaxed font-normal text-ink-secondary min-[768px]:block min-[640px]:mt-3.5">
            Dry Box com controle de temperatura e desumidificação ativa.
            <br />
            Proteja seus filamentos e imprima sem falhas por umidade.
          </p>
        </div>
      </div>
    </section>
  );
}
