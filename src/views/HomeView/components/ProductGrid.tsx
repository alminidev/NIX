"use client";

import { CART_URL } from "@/data/produtos";
import type { IProduct } from "@/types/product";
import { useState } from "react";
import ProductCard from "../../../components/ProductCard";
import ProductLightbox from "../../../components/ProductLightbox";

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
export default function ProductGrid({ products }: { products: IProduct[] }) {
  const cartUrl = CART_URL;
  const [activeLightboxProduct, setActiveLightboxProduct] =
    useState<IProduct | null>(null);

  const dryBoxCabinets = products.filter((product) =>
    product.sku.startsWith("NIX-DB"),
  );
  const setupLabStations = products.filter(
    (product) =>
      product.sku.startsWith("NIX-STATION") ||
      product.category.includes("Station"),
  );

  return (
    <section id="produtos" className="section-products">
      <div className="container">
        <header className="section-header">
          <span className="kicker">Catálogo Oficial</span>
          <h2>Linha NIX Dry Box &amp; Setup Lab</h2>
          <p>
            Engenharia de precisão para armazenar e imprimir direto da estufa.
            Escolha a capacidade sob medida para o seu volume de produção.
          </p>
        </header>

        <div id="products-grid" className="products-grid">
          {/* Grupo 1: Armários Dry Box */}
          <div className="catalog-group">
            <div className="catalog-group-header">
              <span className="catalog-group-kicker">Armazenamento Ativo</span>
              <h3 className="catalog-group-title">
                Armários de Filamentos Dry Box
              </h3>
              <p className="catalog-group-desc">
                Estufas estanques com desumidificação ativa permanente para 12,
                24 ou 48 filamentos.
              </p>
            </div>
            <div className="products-subgrid grid-3-cols">
              {dryBoxCabinets.map((product) => (
                <ProductCard
                  key={product.sku}
                  product={product}
                  cartUrl={cartUrl}
                  onOpenLightbox={(item) => setActiveLightboxProduct(item)}
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
              <h3 className="catalog-group-title">Dry Box Station Combos</h3>
              <p className="catalog-group-desc">
                Soluções completas com bancada integrada antivibração e
                armazenamento climatizado para Bambu Lab.
              </p>
            </div>
            <div className="products-subgrid grid-2-cols">
              {setupLabStations.map((product) => (
                <ProductCard
                  key={product.sku}
                  product={product}
                  cartUrl={cartUrl}
                  onOpenLightbox={(item) => setActiveLightboxProduct(item)}
                />
              ))}
            </div>
          </div>

          {/* Aviso Oficial de Ilustração */}
          <div className="catalog-disclaimer" role="note">
            <p>
              ⚠️ <strong>Observação Importante:</strong> Imagens ilustrativas. A
              impressora e os filamentos não acompanham o produto.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Acessível de Ampliação da Imagem (Lightbox) */}
      <ProductLightbox
        product={activeLightboxProduct}
        isOpen={activeLightboxProduct !== null}
        onClose={() => setActiveLightboxProduct(null)}
      />
    </section>
  );
}
