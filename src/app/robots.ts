import { siteOrigin } from "@/lib/site-seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/05-build/Backup/", "/Backup/", "/admin", "/api"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/05-build/images/", "/images/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/05-build/Backup/", "/Backup/"],
      },
    ],
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
