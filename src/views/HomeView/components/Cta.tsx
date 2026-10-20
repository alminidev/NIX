import { ArrowRight } from "lucide-react";

/**
 * CtaFinal — Banner de encerramento / CTA final.
 */
export default function CTA() {
  return (
    <section className="border-t border-border-dark-hairline bg-surface-hero-void py-20 text-center text-ink-inverse">
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-4 text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-inverse">
            Pronto para elevar o nível do seu estúdio 3D?
          </h2>
          <p className="mb-8 text-lg text-white/75">
            Elimine as falhas por umidade e organize suas máquinas com o padrão
            que seu trabalho merece.
          </p>
          <a
            href="#produtos"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-brand-blue px-8 py-[14px] text-[0.9375rem] font-medium whitespace-nowrap text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover active:translate-y-0"
          >
            Escolher Meu Modelo
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
