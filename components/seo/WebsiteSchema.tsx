import { jsonLdString } from '@/lib/metadata';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

export default function WebsiteSchema() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Scribbl3D',
    url: baseUrl,
    description: 'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India',
    inLanguage: 'en-IN',
    publisher: { '@type': 'Organization', name: 'Scribbl3D', url: baseUrl },
  };

  return (
    // Plain <script> so the JSON-LD is in the server HTML for non-JS crawlers
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(websiteData) }}
    />
  );
}
