'use client';

import { useState } from 'react';
import { getProdutos, CART_URL } from '@/data/produtos';
import type { Produto } from '@/types/produto';
import ProductCard from './ProductCard';
import ProductLightbox from './ProductLightbox';

/**
 * ProductGrid — Vitrine de produtos com separação editorial por categoria.
 * Idêntico ao layout gerado por renderizarProdutos() + gerarCardHtml() no JS original.
 *
 * Grupos editoriais:
 *   - Grupo 1 (grid 3 colunas): SKUs que começam com NIX-DB (Armários Dry Box)
 *   - Grupo 2 (grid 2 colunas, centrado): SKUs que começam com NIX-STATION (Dry Box Station)
 *
 * Integrado com ProductLightbox para ampliação acessível de fotos.
 */
export default function ProductGrid() {
  const produtos = getProdutos();
  const cartUrl = CART_URL;
  const [activeLightboxProduto, setActiveLightboxProduto] = useState<Produto | null>(null);

  const armariosDryBox = produtos.filter((p) => p.sku.startsWith('NIX-DB'));
  const estacoesSetupLab = produtos.filter(
    (p) => p.sku.startsWith('NIX-STATION') || p.categoria.includes('Station')
  );

  return (
    <section id="produtos" className="section-products">
      <div className="container">
        <header className="section-header">
          <span className="kicker">Catálogo Oficial</span>
          <h2>Linha Dry Box &amp; Dry Box Station</h2>
          <p>
            A NIX transforma o armazenamento de filamentos em uma experiência mais prática, funcional e eficiente. Descubra a Dry Box ideal para o seu setup.

          </p>
        </header>

        <div id="products-grid" className="products-grid">
          {/* Grupo 1: Armários Dry Box */}
          <div className="catalog-group">
            <div className="catalog-group-header">
              <span className="catalog-group-kicker">CONHEÇA NOSSAS SOLUÇÕES</span>
              <h3 className="catalog-group-title">DRY BOX</h3>
              <p className="catalog-group-desc">
                Seus filamentos protegidos da umidade, seu setup mais organizado e sua impressão 3D em outro nível.
              </p>
            </div>
            <div className="products-subgrid grid-3-cols">
              {armariosDryBox.map((produto) => (
                <ProductCard
                  key={produto.sku}
                  produto={produto}
                  cartUrl={cartUrl}
                  onOpenLightbox={(prod) => setActiveLightboxProduto(prod)}
                />
              ))}
            </div>
          </div>

          {/* Divisor sutil entre categorias */}
          <div className="catalog-divider" aria-hidden="true"></div>

          {/* Grupo 2: Dry Box Station Combos */}
          <div className="catalog-group">
            <div className="catalog-group-header">
              <span className="catalog-group-kicker">Estações Integradas</span>
              <h3 className="catalog-group-title">DRY BOX STATION</h3>
              <p className="catalog-group-desc">
                AMS integrado, filamentos protegidos e mais capacidade de armazenamento. Tudo em uma única estação, projetada para elevar seu setup Bambu Lab.

              </p>
            </div>
            <div className="products-subgrid grid-2-cols">
              {estacoesSetupLab.map((produto) => (
                <ProductCard
                  key={produto.sku}
                  produto={produto}
                  cartUrl={cartUrl}
                  onOpenLightbox={(prod) => setActiveLightboxProduto(prod)}
                />
              ))}
            </div>
          </div>

          {/* Aviso Oficial de Ilustração */}
          <div className="catalog-disclaimer" role="note">
            <p>
              <strong>Observação Importante:</strong> Imagens ilustrativas. A impressora, o AMS e os filamentos não acompanham o produto.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Acessível de Ampliação da Imagem (Lightbox) */}
      <ProductLightbox
        produto={activeLightboxProduto}
        isOpen={activeLightboxProduto !== null}
        onClose={() => setActiveLightboxProduto(null)}
      />
    </section>
  );
}
