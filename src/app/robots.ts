import { siteOrigin } from "@/lib/site-seo";
import type { MetadataRoute } from "next";

// Cada robô segue só o grupo mais específico, então todo grupo repete os bloqueios.
const disallow = ["/05-build/Backup/", "/Backup/", "/admin", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/05-build/images/", "/images/"],
        disallow,
      },
    ],
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
