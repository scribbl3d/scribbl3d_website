import Script from 'next/script';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scribbl3d.com';

export default function WebsiteSchema() {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Scribbl3D',
    url: baseUrl,
    description: 'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      strategy="beforeInteractive"
    />
  );
}
