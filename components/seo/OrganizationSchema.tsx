import Script from 'next/script';

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
      'https://www.instagram.com/scribbl3d',
      'https://www.facebook.com/scribbl3d',
      'https://www.linkedin.com/company/scribbl3d',
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      strategy="beforeInteractive"
    />
  );
}
