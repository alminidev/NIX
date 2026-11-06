import { organizationJsonLd } from "@/lib/site-seo";

export default function SiteJsonLd() {
  const data = organizationJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
