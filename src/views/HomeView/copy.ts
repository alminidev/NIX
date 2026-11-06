import {
  cardInstallmentsLabel,
  interestDisclosure,
  pixDiscountLabel,
} from "@/lib/payment-terms";

export const WHATSAPP_URL =
  "https://wa.me/5511941692023?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20Dry%20Boxes%20da%20NIX%203D";

export const INSTAGRAM_URL = "https://www.instagram.com/nix3d_";
export const INSTAGRAM_HANDLE = "@nix3d_";

export const catalogIntro = {
  kicker: "Catálogo Oficial",
  title: "Linha Dry Box & Dry Box Station",
  description:
    "A NIX transforma o armazenamento de filamentos em uma experiência mais prática, funcional e eficiente. Descubra a Dry Box ideal para o seu setup.",
};

export const catalogSectionCopy: Record<
  string,
  { eyebrow: string; title: string; description: string; centered: boolean }
> = {
  armarios: {
    eyebrow: "Conheça nossas soluções",
    title: "DRY BOX",
    description:
      "Seus filamentos protegidos da umidade, seu setup mais organizado e sua impressão 3D em outro nível.",
    centered: false,
  },
  stations: {
    eyebrow: "Estações Integradas",
    title: "DRY BOX STATION",
    description:
      "AMS integrado, filamentos protegidos e mais capacidade de armazenamento. Tudo em uma única estação, projetada para elevar seu setup Bambu Lab.",
    centered: true,
  },
};

export const catalogDisclaimer =
  "Imagens ilustrativas. A impressora, o AMS e os filamentos não acompanham o produto.";

export const footerBrandText =
  "Soluções inteligentes para armazenamento, conservação e organização de filamentos, desenvolvidos para elevar a experiência de impressão 3D.";

export const footerDisclaimer =
  "Imagens ilustrativas. Impressora e filamentos não inclusos no produto.";

export const footerCreditUrl = "https://www.alministudio.com.br/almini";
export const footerCreditLabel = "ALEXANDRE POLETTINI";

export const ctaDescription =
  "Elimine as falhas por umidade e organize seus filamentos com o padrão que seu trabalho merece.";

export const heroImageAlt =
  "Linha completa NIX em estúdio showroom com estufas Dry Box e estações de impressão 3D";

export const faqItems = [
  {
    pergunta: "Quais filamentos posso armazenar na Dry Box?",
    resposta:
      "A Dry Box foi desenvolvida para armazenar diferentes tipos de filamentos utilizados na impressão 3D, incluindo PLA, ABS, PETG, TPU e Nylon.",
  },
  {
    pergunta: "Quais as marcas de filamentos que cabem na Dry Box?",
    resposta:
      "Todos os modelos comportam bobinas de padrão universal de 1kg (diâmetro de 200mm) para filamentos de qualquer marca (Bambu Lab, Polymaker, eSun, Creality, 3D Prime). Os modelos de alta capacidade (Dry Box 48 ou 64) também acomodam bobinas industriais de 2,5kg e 3kg de filamentos.",
  },
  {
    pergunta: "Qual é o consumo elétrico do sistema de controle térmico?",
    resposta:
      "É utilizado o sistema de aquecimento por PTC, uma tecnologia de última geração que proporciona aquecimento eficiente com baixo consumo de energia. Em testes com funcionamento contínuo de 24 horas, o consumo mensal estimado foi de aproximadamente 40 kWh.",
  },
  {
    pergunta: "A Dry Box Station é compatível com quais impressoras?",
    resposta:
      "A Dry Box Station foi desenvolvida especialmente para as impressoras Bambu Lab A1 e A2L, permitindo integrar o AMS ao interior da estufa e ampliar a capacidade de armazenamento de filamentos. Porém, nada impede a utilização de outros modelos ou marcas de impressoras compatíveis com o tamanho da mesa.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta: `O pagamento é processado pela InfinitePay, em ambiente seguro. Aceitamos Pix e cartão de crédito em até 3x sem juros. ${pixDiscountLabel()} sobre os produtos, o frete não entra nesse desconto, e ${cardInstallmentsLabel()}. ${interestDisclosure()}`,
  },
  {
    pergunta: "Os produtos possuem garantia?",
    resposta:
      "Sim! Nossos produtos possuem garantia de 90 dias contra defeitos de fabricação, conforme as condições descritas no manual de instruções. Também possuímos equipamentos de substituição caso necessário.",
  },
  {
    pergunta: "Posso solicitar suporte após a compra?",
    resposta:
      "Claro! Nossa equipe está disponível para auxiliar com dúvidas sobre instalação, configuração e utilização dos produtos. Entre em contato pelo nosso canal de atendimento.",
  },
];
