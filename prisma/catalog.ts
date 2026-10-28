export interface IProductSeed {
  sku: string;
  name: string;
  categorySlug: 'armarios' | 'stations';
  capacity: string;
  /** Medidas em cm */
  dimensions: { length: number; width: number; height: number };
  /** Peso unitário em kg */
  weight: number;
  price: string;
  installments: string;
  description: string;
  specifications: string[];
  images: { url: string; isPrimary?: boolean }[];
  featured: boolean;
  sortOrder: number;
};

export const CATEGORIES = [
  { id: 1, slug: 'armarios', name: 'Armários Dry Box', sortOrder: 1 },
  { id: 2, slug: 'stations', name: 'Dry Box Station', sortOrder: 2 },
] as const;

export const PRODUCTS: IProductSeed[] = [
  {
    sku: 'NIX-DB12',
    name: 'DRY BOX 12',
    categorySlug: 'armarios',
    capacity: '12 filamentos',
    dimensions: { length: 46, width: 35, height: 60 },
    weight: 18,
    price: '1190.00',
    installments: 'Até 3x sem juros',
    description: 'Compacta e eficiente para o seu dia a dia.',
    specifications: [
      'Capacidade: 12 filamentos',
      'Dimensões (C x L x A): 46 x 35 x 60 cm',
      'Controle térmico ativo permanente < 20% UR',
      'Display digital de temperatura e umidade',
    ],
    images: [{ url: '/images/dry-box-12.jpg', isPrimary: true }],
    featured: false,
    sortOrder: 1,
  },
  {
    sku: 'NIX-DB24',
    name: 'DRY BOX 24',
    categorySlug: 'armarios',
    capacity: '24 filamentos',
    dimensions: { length: 46, width: 50, height: 60 },
    weight: 26,
    price: '1590.00',
    installments: 'Até 3x sem juros',
    description: 'Mais espaço para seus projetos.',
    specifications: [
      'Capacidade: 24 filamentos',
      'Dimensões (C x L x A): 46 x 50 x 60 cm',
      'Desumidificação ativa de alta eficiência',
      'Passagens técnicas para alimentação direta',
    ],
    images: [
      { url: '/images/dry-box-24.jpg', isPrimary: true },
      { url: '/images/hero-showroom.jpg' },
    ],
    featured: true,
    sortOrder: 2,
  },
  {
    sku: 'NIX-DB48',
    name: 'DRY BOX 48',
    categorySlug: 'armarios',
    capacity: '48 filamentos',
    dimensions: { length: 46, width: 50, height: 100 },
    weight: 38,
    price: '2150.00',
    installments: 'Até 3x sem juros',
    description: 'Alta capacidade para grandes demandas.',
    specifications: [
      'Capacidade: 48 filamentos',
      'Dimensões (C x L x A): 46 x 50 x 100 cm',
      'Sistema duplo de circulação de ar aquecido',
      'Isolamento acústico e térmico reforçado',
    ],
    images: [{ url: '/images/dry-box-48.png', isPrimary: true }],
    featured: false,
    sortOrder: 3,
  },
  {
    sku: 'NIX-STATION-A1',
    name: 'DRY BOX STATION BAMBU LAB A1 COMBO',
    categorySlug: 'stations',
    capacity: '18 filamentos + 4 AMS',
    dimensions: { length: 46, width: 50, height: 100 },
    weight: 42,
    price: '2200.00',
    installments: 'Até 3x sem juros',
    description: 'Solução completa para a sua Bambu Lab A1.',
    specifications: [
      'Capacidade: 18 filamentos + 4 AMS',
      'Dimensões (C x L x A): 46 x 50 x 100 cm',
      'Bancada rígida integrada antivibração',
      'Passagem limpa de tubos PTFE para AMS Lite',
    ],
    images: [
      { url: '/images/setup-lab-a1.png', isPrimary: true },
      { url: '/images/hero-showroom.jpg' },
    ],
    featured: false,
    sortOrder: 4,
  },
  {
    sku: 'NIX-STATION-A2L',
    name: 'DRY BOX STATION BAMBU LAB A2L COMBO',
    categorySlug: 'stations',
    capacity: '24 filamentos + 4 AMS',
    dimensions: { length: 56, width: 60, height: 100 },
    weight: 50,
    price: '2600.00',
    installments: 'Até 3x sem juros',
    description: 'Mais capacidade para o seu setup.',
    specifications: [
      'Capacidade: 24 filamentos + 4 AMS',
      'Dimensões (C x L x A): 56 x 60 x 100 cm',
      'Bancada ampliada para ecossistemas de alta produção',
      'Armazenamento duplo climatizado de filamentos',
    ],
    images: [
      { url: '/images/setup-lab-a2.png', isPrimary: true },
      { url: '/images/hero-showroom.jpg' },
    ],
    featured: false,
    sortOrder: 5,
  },
];
