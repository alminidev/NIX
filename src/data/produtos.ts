import type { Produto } from '@/types/produto';

/**
 * URL oficial de checkout / carrinho (InfinitePay).
 * PONTO ÚNICO DE CONFIGURAÇÃO:
 * - Sobrescreva via variável de ambiente NEXT_PUBLIC_CART_URL no .env.local
 * - Ou altere o fallback padrão diretamente na constante abaixo.
 */
export const CART_URL =
  process.env.NEXT_PUBLIC_CART_URL ?? 'https://checkout.infinitepay.io/nix3d';

/**
 * CATÁLOGO OFICIAL DOS 5 PRODUTOS DA LINHA NIX
 *
 * Para editar produtos, preços, SKUs ou descrições: altere o array abaixo.
 */
const PRODUTOS_NIX: Produto[] = [
  {
    id: 1,
    sku: 'NIX-DB12',
    nome: 'DRY BOX 12',
    categoria: 'Armários Dry Box',
    capacidade: '12 filamentos',
    dimensoes: '46 x 35 x 60 cm',
    preco: 1190.00,
    precoFormatado: 'R$ 1.190,00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Compacta e eficiente para o seu dia a dia.',
    especificacoes: [
      'Capacidade: 12 filamentos',
      'Dimensões (C x L x A): 46 x 35 x 60 cm',
      'Controle térmico ativo permanente < 20% UR',
      'Display digital de temperatura e umidade',
    ],
    imagem: '/images/dry-box-12.jpg',
    destaque: false,
  },
  {
    id: 2,
    sku: 'NIX-DB24',
    nome: 'DRY BOX 24',
    categoria: 'Armários Dry Box',
    capacidade: '24 filamentos',
    dimensoes: '46 x 50 x 60 cm',
    preco: 1590.00,
    precoFormatado: 'R$ 1.590,00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Mais espaço para seus projetos.',
    especificacoes: [
      'Capacidade: 24 filamentos',
      'Dimensões (C x L x A): 46 x 50 x 60 cm',
      'Desumidificação ativa de alta eficiência',
      'Passagens técnicas para alimentação direta',
    ],
    imagem: '/images/dry-box-24.jpg',
    destaque: true, // Mais Escolhido
  },
  {
    id: 3,
    sku: 'NIX-DB48',
    nome: 'DRY BOX 48',
    categoria: 'Armários Dry Box',
    capacidade: '48 filamentos',
    dimensoes: '46 x 50 x 100 cm',
    preco: 2150.00,
    precoFormatado: 'R$ 2.150,00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Alta capacidade para grandes demandas.',
    especificacoes: [
      'Capacidade: 48 filamentos',
      'Dimensões (C x L x A): 46 x 50 x 100 cm',
      'Sistema duplo de circulação de ar aquecido',
      'Isolamento acústico e térmico reforçado',
    ],
    imagem: '/images/dry-box-48.png',
    destaque: false,
  },
  {
    id: 4,
    sku: 'NIX-STATION-A1',
    nome: 'DRY BOX STATION BAMBU LAB A1 COMBO',
    categoria: 'Dry Box Station',
    capacidade: '18 filamentos + 4 AMS',
    dimensoes: '46 x 50 x 100 cm',
    preco: 2200.00,
    precoFormatado: 'R$ 2.200,00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Solução completa para a sua Bambu Lab A1.',
    especificacoes: [
      'Capacidade: 18 filamentos + 4 AMS',
      'Dimensões (C x L x A): 46 x 50 x 100 cm',
      'Bancada rígida integrada antivibração',
      'Passagem limpa de tubos PTFE para AMS Lite',
    ],
    imagem: '/images/setup-lab-a1.png',
    destaque: false,
  },
  {
    id: 5,
    sku: 'NIX-STATION-A2L',
    nome: 'DRY BOX STATION BAMBU LAB A2L COMBO',
    categoria: 'Dry Box Station',
    capacidade: '24 filamentos + 4 AMS',
    dimensoes: '56 x 60 x 100 cm',
    preco: 2600.00,
    precoFormatado: 'R$ 2.600,00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Mais capacidade para o seu setup.',
    especificacoes: [
      'Capacidade: 24 filamentos + 4 AMS',
      'Dimensões (C x L x A): 56 x 60 x 100 cm',
      'Bancada ampliada para ecossistemas de alta produção',
      'Armazenamento duplo climatizado de filamentos',
    ],
    imagem: '/images/setup-lab-a2.png',
    destaque: false,
  },
];

/**
 * Retorna a lista completa de produtos do catálogo NIX.
 *
 * PONTO DE INTEGRAÇÃO (programador back-end):
 * Substitua o conteúdo desta função por uma chamada ao seu banco de dados
 * ou API quando estiver pronto. O restante do front-end não precisará mudar —
 * apenas esta função precisa retornar um array de Produto[].
 *
 * Exemplo com banco (pseudo-código):
 *   export async function getProdutos(): Promise<Produto[]> {
 *     return await db.produto.findMany({ orderBy: { id: 'asc' } });
 *   }
 */
export function getProdutos(): Produto[] {
  return PRODUTOS_NIX;
}
