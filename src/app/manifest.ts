import { siteSeo } from "@/lib/site-seo";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NIX 3D — Mobiliário Técnico e Dry Box",
    short_name: "NIX 3D",
    description: siteSeo.twitterDescription,
    start_url: "/",
    display: "standalone",
    background_color: siteSeo.themeColor,
    theme_color: siteSeo.themeColor,
    lang: "pt-BR",
    categories: ["shopping", "technology", "business"],
    icons: [
      {
        src: "/images/nix-RS-MONO-ICO.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/images/logo-nix.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
