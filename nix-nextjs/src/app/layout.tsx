import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nix3d.com.br'),
  title: 'NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D',
  description:
    'Móveis técnicos e estufas Dry Box com controle térmico ativo (< 20% UR) para filamentos de impressora 3D e Bambu Lab AMS. Compre direto da fábrica em São Paulo.',
  keywords: [
    'dry box impressão 3d',
    'estufa para filamento',
    'móvel técnico impressora 3d',
    'dry box bambu lab',
    'dry box station',
    'bancada impressora 3d',
    'desumidificador filamento 3d',
    'armazenamento filamentos petg nylon pla',
    'nix 3d',
  ],
  authors: [{ name: 'NIX 3D' }],
  creator: 'NIX 3D',
  publisher: 'NIX 3D',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: 'https://nix3d.com.br/',
  },
  icons: {
    icon: '/images/nix-RS-MONO-ICO.ico',
    apple: '/images/nix-RS-MONO-ICO.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://nix3d.com.br/',
    siteName: 'NIX 3D — Mobiliário Técnico para Impressão 3D',
    title: 'NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D',
    description:
      'Móveis técnicos e estufas Dry Box com controle térmico ativo (< 20% UR) para filamentos de impressora 3D. Elimine umidade e organize seu setup.',
    images: [
      {
        url: '/images/hero-showroom-oficial.png',
        width: 1920,
        height: 1080,
        alt: 'Linha oficial de móveis técnicos e estufas Dry Box NIX 3D',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nix_impressoes3d',
    creator: '@nix_impressoes3d',
    title: 'NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D',
    description:
      'Móveis técnicos e estufas Dry Box com controle térmico ativo (< 20% UR) para filamentos de impressora 3D.',
    images: ['/images/hero-showroom-oficial.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
