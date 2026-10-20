function SkeletonCard() {
  return (
    <article
      className="pointer-events-none relative flex flex-col rounded-card border border-border-hairline bg-surface-card p-6"
      aria-hidden="true"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="mb-0 block h-6 w-[7.5rem] animate-skeleton rounded-pill bg-surface-canvas-fog" />
      </div>
      <div className="mb-5 flex aspect-square w-full animate-skeleton items-center justify-center overflow-hidden rounded-input border border-black/[0.03] bg-surface-canvas-fog p-4" />
      <div className="flex flex-1 flex-col">
        <span className="mb-3 block h-5 w-[58%] animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mb-2.5 block h-3.5 animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mb-2.5 block h-3.5 w-[72%] animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mt-2 mb-4 block h-12 animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mb-2.5 block h-3.5 animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mb-2.5 block h-3.5 animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mb-2.5 block h-3.5 w-[72%] animate-skeleton rounded-input bg-surface-canvas-fog" />
        <span className="mt-3 block h-11 animate-skeleton rounded-pill bg-surface-canvas-fog" />
      </div>
    </article>
  );
}

export default function ProductGridFallback() {
  return (
    <div className="w-full" aria-busy="true">
      <p className="sr-only" role="status">
        Carregando produtos…
      </p>

      <div className="mb-6">
        <div className="mb-8">
          <span className="mb-1.5 inline-block text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
            Armazenamento Ativo
          </span>
          <h3 className="mb-1.5 text-[clamp(1.25rem,2vw+0.5rem,1.625rem)] leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
            Armários de Filamentos Dry Box
          </h3>
          <p className="max-w-[620px] text-[0.9375rem] text-ink-secondary">
            Estufas estanques com desumidificação ativa permanente para 12, 24
            ou 48 filamentos.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[992px]:grid-cols-3 min-[992px]:gap-7">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      <div className="my-14 h-px w-full bg-border-hairline" aria-hidden="true" />

      <div className="mb-6">
        <div className="mb-8">
          <span className="mb-1.5 inline-block text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
            Estações Integradas
          </span>
          <h3 className="mb-1.5 text-[clamp(1.25rem,2vw+0.5rem,1.625rem)] leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary">
            Dry Box Station Combos
          </h3>
          <p className="max-w-[620px] text-[0.9375rem] text-ink-secondary">
            Soluções completas com bancada integrada antivibração e
            armazenamento climatizado para Bambu Lab.
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-full grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[992px]:max-w-[820px] min-[992px]:gap-7">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
