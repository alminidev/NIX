import { ArrowDown } from "lucide-react";
import Link from "next/link";
import GlowAtmosphere from "../../../components/GlowAtmosphere";

/**
 * HeroStage — Seção hero do showroom NIX 3D.
 *
 * Usa <img> nativa (não next/image) para preservar o markup e as dimensões
 * exatas de renderização (aspect-ratio 16/9, 4/3 no mobile).
 */
export default function HeroStage() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-border-dark-hairline bg-surface-hero-void pt-20 pb-24 text-ink-inverse max-[640px]:pt-12 max-[640px]:pb-16"
    >
      <GlowAtmosphere />

      <div className="relative z-10 mx-auto w-full max-w-300 px-4 min-[640px]:px-6">
        <div className="mx-auto mb-10 max-w-215 text-center">
          <h1 className="mb-5 text-[clamp(2.25rem,5vw+1rem,3.5rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-ink-inverse">
            A evolução definitiva do seu setup de impressão 3D.
          </h1>
          <p className="mx-auto max-w-165 text-[clamp(1.0625rem,1.2vw+0.5rem,1.25rem)] leading-normal text-white/75">
            Controle térmico ativo permanente abaixo de 20% UR. Proteja seus
            filamentos contra umidade, elimine falhas de impressão e transforme
            seu espaço em um showroom de alto padrão.
          </p>
        </div>

        <div className="relative mx-auto aspect-video w-[min(100%,1120px,max(280px,calc((100svh-540px)*16/9)))] max-w-280 overflow-hidden rounded-card border border-border-dark-hairline bg-surface-hero-void shadow-hero-media after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-20 after:bg-[linear-gradient(to_bottom,transparent,rgba(10,11,14,0.85))] after:content-[''] max-[640px]:aspect-4/3 max-[640px]:w-[min(100%,max(240px,calc((100svh-460px)*4/3)))]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-showroom.jpg"
            alt="Linha completa NIX em bancada de estúdio de tecnologia"
            width={1120}
            height={630}
            loading="eager"
            className="h-full w-full object-cover object-bottom"
          />
        </div>

        <div className="mt-9 flex flex-col flex-wrap items-center justify-center gap-4 min-[640px]:flex-row">
          <a
            href="#produtos"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand-blue px-8 py-3.5 text-[0.9375rem] font-medium whitespace-nowrap text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover active:translate-y-0 min-[640px]:w-auto"
          >
            Ver Vitrine de Produtos
            <ArrowDown size={16} aria-hidden />
          </a>
          <Link
            id="btn-hero-checkout"
            href="/cart"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill border border-white/40 bg-transparent px-7.5 py-3.25 text-[0.9375rem] font-medium whitespace-nowrap text-ink-inverse transition-all duration-200 ease-nix hover:-translate-y-px hover:border-ink-inverse hover:bg-ink-inverse hover:text-ink-primary active:translate-y-0 min-[640px]:w-auto"
          >
            Ir para o Carrinho
          </Link>
        </div>
      </div>
    </section>
  );
}
