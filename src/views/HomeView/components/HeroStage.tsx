import Image from "next/image";

/**
 * HeroStage — Seção hero do showroom NIX 3D.
 * A imagem cobre toda a área da hero (16/9) e o título fica sobreposto no topo.
 */
export default function HeroStage() {
  return (
    <section
      id="hero"
      className="relative flex aspect-video max-h-235 min-h-120 w-full items-start justify-center overflow-hidden bg-surface-hero-void max-[640px]:min-h-100"
    >
      <div className="absolute inset-0 z-[1] size-full overflow-hidden">
        <Image
          src="/images/hero-showroom-oficial.png"
          alt="Linha completa NIX em estúdio showroom"
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="pointer-events-none relative z-[2] mx-auto w-full max-w-[1200px] px-4 pt-[clamp(14px,2.2vw,36px)] min-[640px]:px-6 max-[640px]:pt-3.5">
        <div className="pointer-events-auto mx-auto max-w-240 text-center">
          <h1 className="mx-auto text-[clamp(1.75rem,3.1vw,2.9rem)] leading-[1.22] font-bold tracking-[-0.025em] text-black">
            A evolução definitiva do seu
            <br />
            setup de impressão 3D.
          </h1>
        </div>
      </div>
    </section>
  );
}
