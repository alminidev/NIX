import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { siteOrigin, siteSeo } from "@/lib/site-seo";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const origin = siteOrigin();

export const viewport: Viewport = {
  themeColor: siteSeo.themeColor,
};

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: siteSeo.title,
  description: siteSeo.description,
  keywords: siteSeo.keywords,
  authors: [{ name: "NIX 3D" }],
  creator: "NIX 3D",
  publisher: "NIX 3D",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${origin}/`,
  },
  icons: {
    icon: siteSeo.icon,
    apple: siteSeo.icon,
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${origin}/`,
    siteName: "NIX 3D — Mobiliário Técnico para Impressão 3D",
    title: siteSeo.title,
    description: siteSeo.ogDescription,
    images: [
      {
        url: siteSeo.ogImage,
        width: 1920,
        height: 1080,
        alt: siteSeo.ogImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteSeo.twitterHandle,
    creator: siteSeo.twitterHandle,
    title: siteSeo.title,
    description: siteSeo.twitterDescription,
    images: [siteSeo.ogImage],
  },
  other: {
    "geo.region": "BR-SP",
    "geo.placename": "São Paulo",
    "geo.position": "-23.550520;-46.633308",
    ICBM: "-23.550520, -46.633308",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} scroll-smooth scroll-pt-[90px] bg-surface-canvas-fog text-base text-ink-secondary antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
