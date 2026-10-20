import type { IProduct } from "@/types/product";
import { ArrowRight, Lock } from "lucide-react";

interface IProductCardProps {
  product: IProduct;
  cartUrl: string;
  onOpenLightbox?: (product: IProduct) => void;
}

/**
 * ProductCard — Card individual de produto.
 * Idêntico ao <article class="product-card"> gerado por gerarCardHtml() no JS original.
 * data-sku e data-id preservados para compatibilidade futura.
 *
 * Usa <img> nativa (não next/image) — mesmas dimensões de renderização do original (320x320 contain via CSS).
 * Ao clicar na imagem, abre o overlay de visualização ampliada (Lightbox).
 */
export default function ProductCard({
  product,
  cartUrl,
  onOpenLightbox,
}: IProductCardProps) {
  const purchaseUrl = `${cartUrl}?sku=${encodeURIComponent(product.sku)}&id=${encodeURIComponent(product.id)}`;

  return (
    <article
      className="product-card"
      data-sku={product.sku}
      data-id={product.id}
    >
      <div className="card-badge-top">
        <span className="tag-capacity">{product.capacity}</span>
        {product.featured && (
          <span className="tag-featured">Mais Escolhido</span>
        )}
      </div>

      <div className="card-media">
        <button
          type="button"
          className="card-media-btn"
          onClick={() => onOpenLightbox?.(product)}
          aria-label={`Ampliar foto de ${product.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={`${product.name} — Armazenamento com controle térmico para filamentos 3D`}
            loading="lazy"
            width={320}
            height={320}
          />
        </button>
      </div>

      <div className="card-content">
        <h3 className="card-title">{product.name}</h3>
        <p className="card-desc">{product.description}</p>

        <div className="card-dimensions-box">
          <span className="card-dimensions-label">Dimensões (C x L x A)</span>
          <span className="card-dimensions-val">{product.dimensions}</span>
        </div>

        {product.specifications.length > 0 && (
          <ul className="card-specs">
            {product.specifications.map((spec, i) => (
              <li key={i}>{spec}</li>
            ))}
          </ul>
        )}

        <div className="card-footer">
          <div className="card-price-row">
            <div className="card-price-col">
              <span className="card-price-label">Preço à vista</span>
              <span className="card-price">{product.formattedPrice}</span>
            </div>
            <span className="card-installment">{product.installments}</span>
          </div>

          <a
            href={purchaseUrl}
            className="btn-buy"
            data-sku={product.sku}
            data-id={product.id}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${product.name} no checkout seguro`}
          >
            Comprar
            <ArrowRight size={16} aria-hidden />
          </a>

          <div className="card-security-badge" aria-hidden="true">
            <Lock size={12} aria-hidden />
            <span>Ambiente Seguro InfinitePay</span>
          </div>

          <span className="card-shipping-notice">
            Enviamos para todo o Brasil • Frete a consultar
          </span>
        </div>
      </div>
    </article>
  );
}
