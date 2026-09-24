import { jsonLdString } from '@/lib/metadata';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

export default function OrganizationSchema() {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Scribbl3D',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Premium 3D printers, filaments, resins, and custom 3D printing services in India',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9599523434',
      contactType: 'Customer Service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://www.instagram.com/scribbl3d_/',
      'https://in.linkedin.com/company/scribbl3dprinting',
      'https://twitter.com/Scribbl3d_',
    ],
  };

  return (
    // Plain <script> so the JSON-LD is in the server HTML for non-JS crawlers
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(organizationData) }}
    />
  );
}
