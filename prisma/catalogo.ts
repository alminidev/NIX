export type ProdutoSeed = {
  sku: string;
  nome: string;
  categoriaSlug: 'armarios' | 'stations';
  capacidade: string;
  dimensoes: string;
  preco: string;
  parcelamento: string;
  descricao: string;
  especificacoes: string[];
  imagens: { url: string; principal?: boolean }[];
  destaque: boolean;
  ordem: number;
};

export const CATEGORIAS = [
  { id: 1, slug: 'armarios', nome: 'Armários Dry Box', ordem: 1 },
  { id: 2, slug: 'stations', nome: 'Dry Box Station', ordem: 2 },
] as const;

export const PRODUTOS: ProdutoSeed[] = [
  {
    sku: 'NIX-DB12',
    nome: 'DRY BOX 12',
    categoriaSlug: 'armarios',
    capacidade: '12 filamentos',
    dimensoes: '46 x 35 x 60 cm',
    preco: '1190.00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Compacta e eficiente para o seu dia a dia.',
    especificacoes: [
      'Capacidade: 12 filamentos',
      'Dimensões (C x L x A): 46 x 35 x 60 cm',
      'Controle térmico ativo permanente < 20% UR',
      'Display digital de temperatura e umidade',
    ],
    imagens: [{ url: '/images/dry-box-12.jpg', principal: true }],
    destaque: false,
    ordem: 1,
  },
  {
    sku: 'NIX-DB24',
    nome: 'DRY BOX 24',
    categoriaSlug: 'armarios',
    capacidade: '24 filamentos',
    dimensoes: '46 x 50 x 60 cm',
    preco: '1590.00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Mais espaço para seus projetos.',
    especificacoes: [
      'Capacidade: 24 filamentos',
      'Dimensões (C x L x A): 46 x 50 x 60 cm',
      'Desumidificação ativa de alta eficiência',
      'Passagens técnicas para alimentação direta',
    ],
    imagens: [
      { url: '/images/dry-box-24.jpg', principal: true },
      { url: '/images/hero-showroom.jpg' },
    ],
    destaque: true,
    ordem: 2,
  },
  {
    sku: 'NIX-DB48',
    nome: 'DRY BOX 48',
    categoriaSlug: 'armarios',
    capacidade: '48 filamentos',
    dimensoes: '46 x 50 x 100 cm',
    preco: '2150.00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Alta capacidade para grandes demandas.',
    especificacoes: [
      'Capacidade: 48 filamentos',
      'Dimensões (C x L x A): 46 x 50 x 100 cm',
      'Sistema duplo de circulação de ar aquecido',
      'Isolamento acústico e térmico reforçado',
    ],
    imagens: [{ url: '/images/dry-box-48.png', principal: true }],
    destaque: false,
    ordem: 3,
  },
  {
    sku: 'NIX-STATION-A1',
    nome: 'DRY BOX STATION BAMBU LAB A1 COMBO',
    categoriaSlug: 'stations',
    capacidade: '18 filamentos + 4 AMS',
    dimensoes: '46 x 50 x 100 cm',
    preco: '2200.00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Solução completa para a sua Bambu Lab A1.',
    especificacoes: [
      'Capacidade: 18 filamentos + 4 AMS',
      'Dimensões (C x L x A): 46 x 50 x 100 cm',
      'Bancada rígida integrada antivibração',
      'Passagem limpa de tubos PTFE para AMS Lite',
    ],
    imagens: [
      { url: '/images/setup-lab-a1.png', principal: true },
      { url: '/images/hero-showroom.jpg' },
    ],
    destaque: false,
    ordem: 4,
  },
  {
    sku: 'NIX-STATION-A2L',
    nome: 'DRY BOX STATION BAMBU LAB A2L COMBO',
    categoriaSlug: 'stations',
    capacidade: '24 filamentos + 4 AMS',
    dimensoes: '56 x 60 x 100 cm',
    preco: '2600.00',
    parcelamento: 'Até 3x sem juros',
    descricao: 'Mais capacidade para o seu setup.',
    especificacoes: [
      'Capacidade: 24 filamentos + 4 AMS',
      'Dimensões (C x L x A): 56 x 60 x 100 cm',
      'Bancada ampliada para ecossistemas de alta produção',
      'Armazenamento duplo climatizado de filamentos',
    ],
    imagens: [
      { url: '/images/setup-lab-a2.png', principal: true },
      { url: '/images/hero-showroom.jpg' },
    ],
    destaque: false,
    ordem: 5,
  },
];
