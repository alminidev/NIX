import { faqPageJsonLd, organizationJsonLd, serializeJsonLd } from "@/lib/site-seo";

export default function SiteJsonLd() {
  const data = organizationJsonLd();
  const graph = { ...data, "@graph": [...data["@graph"], faqPageJsonLd()] };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
    />
  );
}
