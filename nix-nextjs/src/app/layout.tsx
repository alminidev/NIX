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
    'Móveis técnicos e estufas Dry Box com controle térmico ativo para filamentos de impressora 3D. Elimine umidade e organize seu setup com precisão industrial.',
  icons: {
    icon: '/images/logo-nix.png',
  },
  openGraph: {
    type: 'website',
    title: 'NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D',
    description:
      'Móveis técnicos e estufas Dry Box com controle térmico ativo para filamentos de impressora 3D. Elimine umidade e organize seu setup com precisão industrial.',
    images: ['/images/hero-showroom.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIX 3D — Mobiliário Técnico e Dry Box para Impressão 3D',
    description:
      'Móveis técnicos e estufas Dry Box com controle térmico ativo para filamentos de impressora 3D.',
    images: ['/images/hero-showroom.jpg'],
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
