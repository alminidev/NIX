/**
 * Diferenciais — Seção de diferenciais e tecnologia da NIX 3D.
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
              TECNOLOGIA &amp; PROTEÇÃO
            </span>
            <h2 className="mb-5 text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary">
              Mais cuidado com seus filamentos. Mais qualidade para suas
              impressões.
            </h2>
            <p className="mb-8 text-[1.0625rem] leading-[1.6] text-ink-secondary">
              Filamentos como Nylon, TPU e PETG são sensíveis à umidade. A NIX
              desenvolveu a primeira solução completa que reúne controle de
              temperatura e umidade otimizando o armazenamento em um só
              equipamento, ajudando a preservar seus materiais e a qualidade das
              impressões 3D.
            </p>
            <div className="rounded-card border border-border-hairline bg-surface-canvas-fog p-5">
              <strong className="mb-1 block text-base text-ink-primary">
                Padrão Estúdio Maker
              </strong>
              <span className="text-sm text-ink-muted">
                Dry Box para diferentes setups de impressão 3D. Dry Box Station
                com integração exclusiva para Bambu Lab A1 e A2L.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[640px]:gap-7">
            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Controle inteligente
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Monitoramento digital com controlador STC-3028 e ajustes
                independentes para temperatura e umidade.
              </p>
            </div>

            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Estrutura robusta e sofisticada
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Construída em MDF texturizado, com excelente resistência e
                estabilidade para auxiliar na redução de vibrações. Porta em
                vidro lapidado de 6 mm, unindo um acabamento perfeito.
              </p>
            </div>

            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Sistema de Circulação de Ar
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Circulação de ar integrada para favorecer a distribuição da
                temperatura no interior da estufa.
              </p>
            </div>

            <div className="rounded-card border border-border-hairline bg-white px-7 py-8 transition-[border-color,box-shadow,translate] duration-200 ease-nix hover:-translate-y-0.5 hover:border-[rgba(23,107,255,0.4)] hover:shadow-feature-hover">
              <h3 className="mb-2.5 text-lg leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
                Desumidificação ativa
              </h3>
              <p className="text-sm leading-normal text-ink-secondary">
                Sistema elétrico de desumidificação que auxilia no controle da
                umidade interna, contribuindo para a conservação dos seus
                filamentos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
