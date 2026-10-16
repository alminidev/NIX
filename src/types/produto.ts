/**
 * Interface Produto — tipagem dos itens do catálogo NIX 3D
 *
 * PONTO DE INTEGRAÇÃO (programador back-end):
 * Esta interface define o contrato de dados entre o front-end e o banco de dados.
 * Ao conectar o banco, a função getProdutos() em data/produtos.ts deve retornar
 * objetos que satisfaçam esta interface.
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
  /** Caminho da imagem (relativo a /public, ex: '/images/dry-box-12.jpg') */
  imagem: string;
  /** true = exibe badge "Mais Escolhido" */
  destaque: boolean;
}
