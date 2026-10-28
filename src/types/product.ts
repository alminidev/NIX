/**
 * Contrato de exibição do catálogo NIX 3D.
 * Os dados persistidos ficam em Prisma; getProducts() em lib/products.ts
 * devolve objetos neste formato.
 */

export interface IProductDimensions {
  /** Largura em cm */
  width: number;
  /** Altura em cm */
  height: number;
  /** Comprimento em cm */
  length: number;
}

export interface IProduct {
  /** Identificador numérico único do produto */
  id: number;
  /** SKU oficial (ex: 'NIX-DB12', 'NIX-STATION-A1') */
  sku: string;
  /** Nome de exibição do produto */
  name: string;
  /** Categoria editorial (ex: 'Armários Dry Box', 'Dry Box Station') */
  category: string;
  /** Slug estável da categoria (ex: 'armarios', 'stations') */
  categorySlug: string;
  /** Ordem da categoria no catálogo */
  categorySortOrder: number;
  /** Capacidade em texto (ex: '12 filamentos') */
  capacity: string;
  /** Dimensões em centímetros */
  dimensions: IProductDimensions;
  /** Preço numérico em reais (usado para cálculos futuros) */
  price: number;
  /** Preço formatado em PT-BR para exibição (ex: 'R$ 1.190,00') */
  formattedPrice: string;
  /** Texto de parcelamento (ex: 'Até 3x sem juros') */
  installments: string;
  /** Descrição curta do produto */
  description: string;
  /** Lista de especificações técnicas exibidas no card */
  specifications: string[];
  /** Caminho da imagem principal (relativo a /public, ex: '/images/dry-box-12.jpg') */
  image: string;
  /** Galeria opcional de imagens para ampliação no Lightbox (se não informada, usa [image]) */
  images?: string[];
  /** false quando o estoque cadastrado está zerado */
  inStock: boolean;
  /** true = exibe badge "Mais Escolhido" */
  featured: boolean;
}
