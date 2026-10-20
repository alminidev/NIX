import { DollarSign, Layers, Lock, Thermometer } from "lucide-react";

/**
 * Diferenciais — Seção de diferenciais e engenharia da NIX 3D.
 */
export default function Features() {
  return (
    <section
      id="diferenciais"
      className="border-y border-border-hairline bg-white py-16 min-[640px]:py-20 min-[992px]:py-[100px]"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[640px]:px-6">
        <div className="grid grid-cols-1 items-start gap-9 min-[992px]:grid-cols-[380px_1fr] min-[992px]:gap-16">
          <div>
            <span className="mb-3 inline-block text-xs leading-[1.4] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
              Engenharia &amp; Precisão
            </span>
            <h2 className="mb-5 text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
              Desenvolvido para eliminar falhas antes que elas aconteçam.
            </h2>
            <p className="mb-8 text-[1.0625rem] leading-[1.6] text-ink-secondary">
              Filamentos de engenharia como Nylon, TPU e PETG absorvem umidade
              do ar em poucas horas. A NIX criou a primeira solução completa que
              une climatização hermética e estabilidade física em um único
              móvel.
            </p>
            <div className="rounded-card border border-border-hairline bg-surface-canvas-fog p-5">
              <strong className="mb-1 block text-base text-ink-primary">
                Padrão Estúdio Maker
              </strong>
              <span className="text-sm text-ink-muted">
                Compatível com sistemas Bambu Lab (AMS), Creality e impressoras
                CoreXY.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[640px]:gap-7">
            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <div
                className="mb-5 flex size-11 items-center justify-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-brand-blue-subtle text-brand-blue"
                aria-hidden="true"
              >
                <Thermometer size={22} aria-hidden />
              </div>
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Controle Térmico Ativo (&lt; 20% UR)
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Display digital com leitura contínua de temperatura e umidade.
                Desumidificação uniforme sem risco de degradar filamentos.
              </p>
            </div>

            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <div
                className="mb-5 flex size-11 items-center justify-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-brand-blue-subtle text-brand-blue"
                aria-hidden="true"
              >
                <Lock size={22} aria-hidden />
              </div>
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Vedação Estanque Automotiva
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Perfis vedados com guarnições de alta durabilidade e portas com
                fecho magnético que isolam o interior do ar ambiente.
              </p>
            </div>

            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <div
                className="mb-5 flex size-11 items-center justify-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-brand-blue-subtle text-brand-blue"
                aria-hidden="true"
              >
                <DollarSign size={22} aria-hidden />
              </div>
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Alimentação Direta sem Atrito
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Conectores pneumáticos para tubos PTFE no topo e laterais:
                imprima direto do móvel sem expor o filamento à atmosfera.
              </p>
            </div>

            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <div
                className="mb-5 flex size-11 items-center justify-center rounded-pill border border-[rgba(23,107,255,0.15)] bg-brand-blue-subtle text-brand-blue"
                aria-hidden="true"
              >
                <Layers size={22} aria-hidden />
              </div>
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Estrutura Rígida em Alumínio
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Projetado para absorver acelerações mecânicas de até 20.000
                mm/s² das máquinas modernas sem oscilações ou ruídos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
