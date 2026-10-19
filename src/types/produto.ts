/**
 * Contrato de exibição do catálogo NIX 3D.
 * Os dados persistidos ficam em Prisma; getProdutos() em lib/produtos.ts
 * devolve objetos neste formato.
 */
export interface Produto {
  /** Identificador numérico único do produto */
  id: number;
  /** SKU oficial (ex: 'NIX-DB12', 'NIX-STATION-A1') */
  sku: string;
  /** Nome de exibição do produto */
  nome: string;
  /** Categoria editorial (ex: 'Armários Dry Box', 'Dry Box Station') */
  categoria: string;
  /** Capacidade em texto (ex: '12 filamentos') */
  capacidade: string;
  /** Dimensões em texto (ex: '46 x 35 x 60 cm') */
  dimensoes: string;
  /** Preço numérico em reais (usado para cálculos futuros) */
  preco: number;
  /** Preço formatado em PT-BR para exibição (ex: 'R$ 1.190,00') */
  precoFormatado: string;
  /** Texto de parcelamento (ex: 'Até 3x sem juros') */
  parcelamento: string;
  /** Descrição curta do produto */
  descricao: string;
  /** Lista de especificações técnicas exibidas no card */
  especificacoes: string[];
  /** Caminho da imagem principal (relativo a /public, ex: '/images/dry-box-12.jpg') */
  imagem: string;
  /** Galeria opcional de imagens para ampliação no Lightbox (se não informada, usa [imagem]) */
  imagens?: string[];
  /** true = exibe badge "Mais Escolhido" */
  destaque: boolean;
}
