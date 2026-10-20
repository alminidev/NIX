function SkeletonCard() {
  return (
    <article className="product-card product-card-skeleton" aria-hidden="true">
      <div className="card-badge-top">
        <span className="skeleton-line skeleton-line-badge" />
      </div>
      <div className="card-media" />
      <div className="card-content">
        <span className="skeleton-line skeleton-line-title" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line-short" />
        <span className="skeleton-line skeleton-dimensions" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line-short" />
        <span className="skeleton-button" />
      </div>
    </article>
  );
}

export default function ProductGridFallback() {
  return (
    <div className="products-grid" aria-busy="true">
      <p className="sr-only" role="status">
        Carregando produtos…
      </p>

      <div className="catalog-group">
        <div className="catalog-group-header">
          <span className="catalog-group-kicker">Armazenamento Ativo</span>
          <h3 className="catalog-group-title">Armários de Filamentos Dry Box</h3>
          <p className="catalog-group-desc">
            Estufas estanques com desumidificação ativa permanente para 12, 24
            ou 48 filamentos.
          </p>
        </div>
        <div className="products-subgrid grid-3-cols">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      <div className="catalog-divider" aria-hidden="true" />

      <div className="catalog-group">
        <div className="catalog-group-header">
          <span className="catalog-group-kicker">Estações Integradas</span>
          <h3 className="catalog-group-title">Dry Box Station Combos</h3>
          <p className="catalog-group-desc">
            Soluções completas com bancada integrada antivibração e
            armazenamento climatizado para Bambu Lab.
          </p>
        </div>
        <div className="products-subgrid grid-2-cols">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
