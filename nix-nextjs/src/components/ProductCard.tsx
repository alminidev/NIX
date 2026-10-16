import type { Produto } from '@/types/produto';

interface ProductCardProps {
  produto: Produto;
  cartUrl: string;
}

/**
 * ProductCard — Card individual de produto.
 * Idêntico ao <article class="product-card"> gerado por gerarCardHtml() no JS original.
 * data-sku e data-id preservados para compatibilidade futura.
 *
 * Usa <img> nativa (não next/image) — mesmas dimensões de renderização do original (320x320 contain via CSS).
 */
export default function ProductCard({ produto, cartUrl }: ProductCardProps) {
  const urlCompra = `${cartUrl}?sku=${encodeURIComponent(produto.sku)}&id=${encodeURIComponent(produto.id)}`;

  return (
    <article className="product-card" data-sku={produto.sku} data-id={produto.id}>
      <div className="card-badge-top">
        <span className="tag-capacity">{produto.capacidade}</span>
        {produto.destaque && <span className="tag-featured">Mais Escolhido</span>}
      </div>

      <div className="card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={produto.imagem}
          alt={`${produto.nome} — Armazenamento com controle térmico para filamentos 3D`}
          loading="lazy"
          width={320}
          height={320}
        />
      </div>

      <div className="card-content">
        <h3 className="card-title">{produto.nome}</h3>
        <p className="card-desc">{produto.descricao}</p>

        <div className="card-dimensions-box">
          <span className="card-dimensions-label">Dimensões (C x L x A)</span>
          <span className="card-dimensions-val">{produto.dimensoes}</span>
        </div>

        {produto.especificacoes.length > 0 && (
          <ul className="card-specs">
            {produto.especificacoes.map((spec, i) => (
              <li key={i}>{spec}</li>
            ))}
          </ul>
        )}

        <div className="card-footer">
          <div className="card-price-row">
            <div className="card-price-col">
              <span className="card-price-label">Preço à vista</span>
              <span className="card-price">{produto.precoFormatado}</span>
            </div>
            <span className="card-installment">{produto.parcelamento}</span>
          </div>

          <a
            href={urlCompra}
            className="btn-buy"
            data-sku={produto.sku}
            data-id={produto.id}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${produto.nome} no checkout seguro`}
          >
            Comprar
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </a>

          <div className="card-security-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Ambiente Seguro InfinitePay</span>
          </div>

          <span className="card-shipping-notice">Enviamos para todo o Brasil • Frete a consultar</span>
        </div>
      </div>
    </article>
  );
}
