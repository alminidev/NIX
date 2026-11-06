import { faqItems } from "@/views/HomeView/copy";

const fallbackSiteUrl = "https://nix3d.com.br";

export function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl).replace(
    /\/$/,
    "",
  );
}

export const siteSeo = {
  title: "NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D",
  description:
    "Móveis técnicos e estufas Dry Box com controle térmico ativo (< 20% UR) para filamentos de impressora 3D e Bambu Lab AMS. Compre direto da fábrica em São Paulo.",
  keywords: [
    "dry box impressão 3d",
    "estufa para filamento",
    "móvel técnico impressora 3d",
    "dry box bambu lab",
    "dry box station",
    "bancada impressora 3d",
    "desumidificador filamento 3d",
    "armazenamento filamentos petg nylon pla",
    "nix 3d",
  ],
  ogDescription:
    "Móveis técnicos e estufas Dry Box com controle térmico ativo (< 20% UR) para filamentos de impressora 3D. Elimine umidade e organize seu setup.",
  twitterDescription:
    "Móveis técnicos e estufas Dry Box com controle térmico ativo (< 20% UR) para filamentos de impressora 3D.",
  ogImage: "/images/hero-showroom-oficial.png",
  ogImageAlt: "Linha oficial de móveis técnicos e estufas Dry Box NIX 3D",
  twitterHandle: "@nix3d_",
  themeColor: "#0b0e14",
  icon: "/images/nix-RS-MONO-ICO.ico",
};

export function organizationJsonLd(origin = siteOrigin()) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: "NIX 3D",
        description:
          "Móveis técnicos e estufas Dry Box com controle térmico ativo para filamentos e impressão 3D.",
        inLanguage: "pt-BR",
        publisher: { "@id": `${origin}/#organization` },
      },
      {
        "@type": ["Organization", "LocalBusiness", "Store"],
        "@id": `${origin}/#organization`,
        name: "NIX 3D",
        legalName: "NIX 3D — Soluções em Manufatura Aditiva",
        url: `${origin}/`,
        logo: {
          "@type": "ImageObject",
          url: `${origin}/images/logo-nix.png`,
          width: "110",
          height: "32",
        },
        image: `${origin}/images/hero-showroom-oficial.png`,
        description:
          "Fabricação de móveis técnicos e estufas Dry Box com controle térmico ativo para armazenamento seguro de filamentos de impressão 3D e setups Bambu Lab.",
        telephone: "+5511941692023",
        email: "contato@nix3d.com.br",
        currenciesAccepted: "BRL",
        paymentAccepted: "Cartão de Crédito, Pix",
        address: {
          "@type": "PostalAddress",
          addressLocality: "São Paulo",
          addressRegion: "SP",
          addressCountry: "BR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -23.55052,
          longitude: -46.633308,
        },
        areaServed: { "@type": "Country", name: "Brasil" },
        sameAs: ["https://www.instagram.com/nix3d_"],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${origin}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: `${origin}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Catálogo Dry Box",
            item: `${origin}/#produtos`,
          },
        ],
      },
    ],
  };
}

type FaqItem = { pergunta: string; resposta: string };

/** FAQPage gerado das mesmas perguntas exibidas na página. */
export function faqPageJsonLd(origin = siteOrigin(), items: readonly FaqItem[] = faqItems) {
  return {
    "@type": "FAQPage",
    "@id": `${origin}/#faqpage`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: { "@type": "Answer", text: item.resposta },
    })),
  };
}

/** JSON seguro para <script>: escapa <, > e & para não fechar a tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
