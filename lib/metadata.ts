import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scribbl3d.com';
const siteName = 'Scribbl3D';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Scribbl3D - Premium 3D Printers, Filaments & Resins in India',
    template: '%s | Scribbl3D',
  },
  description:
    'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India. Expert solutions for hobbyists, professionals, and businesses.',
  keywords: [
    '3D printer India',
    '3D printing',
    'FDM printer',
    'resin printer',
    '3D filament',
    '3D resin',
    'custom 3D printing',
    '3D printing service India',
    'buy 3D printer',
    'Scribbl3D',
  ],
  authors: [{ name: 'Scribbl3D' }],
  creator: 'Scribbl3D',
  publisher: 'Scribbl3D',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName,
    title: 'Scribbl3D - Premium 3D Printers, Filaments & Resins',
    description:
      'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India.',
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Scribbl3D Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scribbl3D - Premium 3D Printers, Filaments & Resins',
    description:
      'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India.',
    images: [`${baseUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

interface GenerateProductMetadataProps {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  category: string;
  slug: string;
  keywords?: string[];
}

export function generateProductMetadata({
  name,
  description,
  price,
  originalPrice,
  images = [],
  category,
  slug,
  keywords = [],
}: GenerateProductMetadataProps): Metadata {
  const url = `${baseUrl}/${category}/${slug}`;
  const mainImage = images[0] || `${baseUrl}/logo.png`;

  return {
    title: `${name} - Buy Online at Best Price`,
    description: description.slice(0, 160),
    keywords: [name, category, '3D printing', 'India', ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title: name,
      description,
      siteName,
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: [mainImage],
    },
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': 'INR',
      ...(originalPrice && { 'product:original_price': originalPrice.toString() }),
    },
  };
}

interface GenerateBlogMetadataProps {
  title: string;
  description: string;
  keywords: string;
  slug: string;
  image?: string;
  publishedAt?: string;
  author?: string;
}

export function generateBlogMetadata({
  title,
  description,
  keywords,
  slug,
  image,
  publishedAt,
  author = 'Scribbl3D',
}: GenerateBlogMetadataProps): Metadata {
  const url = `${baseUrl}/blog/${slug}`;
  const ogImage = image || `${baseUrl}/logo.png`;

  return {
    title,
    description: description.slice(0, 160),
    keywords: keywords.split(',').map((k) => k.trim()),
    authors: [{ name: author }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName,
      publishedTime: publishedAt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export function generateStructuredData(type: 'product' | 'blogPost', data: any) {
  if (type === 'product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      description: data.description,
      image: data.images || [],
      brand: {
        '@type': 'Brand',
        name: data.brand || 'Scribbl3D',
      },
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/${data.category}/${data.slug}`,
        priceCurrency: 'INR',
        price: data.price,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Scribbl3D',
        },
      },
      ...(data.aggregateRating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.aggregateRating.value,
          reviewCount: data.aggregateRating.count,
        },
      }),
    };
  }

  if (type === 'blogPost') {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.title,
      description: data.description,
      image: data.image,
      author: {
        '@type': 'Person',
        name: data.author || 'Scribbl3D',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Scribbl3D',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: data.publishedAt,
      dateModified: data.updatedAt || data.publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${data.slug}`,
      },
    };
  }

  return null;
}
