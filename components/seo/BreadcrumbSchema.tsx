import { jsonLdString } from '@/lib/metadata';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    // Plain <script> so the JSON-LD is in the server HTML (next/script injects it after hydration)
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbData) }}
    />
  );
}
