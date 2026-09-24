import { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');
const siteName = 'Scribbl3D';

export function truncateAtWord(s: string, n: number): string {
  if (s.length <= n) return s;
  const truncated = s.slice(0, s.lastIndexOf(' ', n));
  return truncated ? `${truncated}…` : s.slice(0, n) + '…';
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Scribbl3D - Premium 3D Printers, Filaments & Resins in India',
    template: '%s | Scribbl3D',
  },
  description:
    'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India. Fast shipping, expert support, and competitive prices. Shop now for the best deals on FDM and resin printers!',
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
  verification: {
    google: 'B_hBz-Ge524xI6LguFtfJ_yLXddgdifqWGfasoiqBVs',
  },
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
    title: 'Scribbl3D - Premium 3D Printers, Filaments & Resins in India',
    description:
      'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India. Fast shipping, expert support, competitive prices. Shop now!',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Scribbl3D - Premium 3D Printers, Filaments & Resins in India',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scribbl3D - Premium 3D Printers, Filaments & Resins in India',
    description:
      'Buy premium 3D printers, high-quality filaments, resins, and custom 3D printing services in India. Fast shipping, expert support, competitive prices. Shop now!',
    images: [`${baseUrl}/og-image.png`],
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
  alternates: {
    canonical: baseUrl,
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
        itemCondition: 'https://schema.org/NewCondition',
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
      author: data.author && data.author !== siteName
        ? { '@type': 'Person', name: data.author }
        : { '@type': 'Organization', name: siteName, url: baseUrl },
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

// Serialize JSON-LD for a <script> tag; escapes "<" so stored text cannot close the tag
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export interface ProductOfferInput {
  price: number | null | undefined;
  inStock: boolean;
  sku?: string;
  name?: string;
  // Variant attributes, used when the product is published as a ProductGroup
  color?: string | null;
  size?: string | null;
  image?: string | null;
}

// Return rules from the Returns Policy (/return-policy):
// - printer: 3D printers and electronics are not returnable after delivery
// - standard: unused items (sealed consumables included) within 10 days of delivery
// - customised: customised/personalised/made-to-order items are not returnable
//   unless defective, damaged, or incorrect (handled outside the standard window)
export type ReturnPolicyKind = 'printer' | 'standard' | 'customised';

export interface ProductJsonLdInput {
  name: string;
  description?: string | null;
  url: string;
  images?: string[];
  brand?: string | null;
  sku?: string;
  category?: string;
  color?: string | null;
  material?: string | null;
  offers: ProductOfferInput[];
  returnPolicy: ReturnPolicyKind;
  // Attributes that distinguish variants; with 2+ offers this emits a ProductGroup
  variesBy?: ('color' | 'size')[];
  properties?: { name: string; value: string | null | undefined }[];
  rating?: { average: number | null | undefined; count: number };
}

function merchantReturnPolicy(kind: ReturnPolicyKind) {
  const base = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'IN',
    merchantReturnLink: `${baseUrl}/return-policy`,
  };
  if (kind === 'standard') {
    return {
      ...base,
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 10,
      itemCondition: 'https://schema.org/NewCondition',
    };
  }
  return { ...base, returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted' };
}

// Shipping Policy (/shipping-policy) and checkout: standard shipping within India
// is included in the price and delivered within 7 days. Split confirmed by the
// business: dispatch within 0–2 days, courier transit 3–5 days (7 days max).
const shippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 5, unitCode: 'DAY' },
  },
};

// Product JSON-LD shared by all catalogue families. Offers without a positive
// price are dropped so a missing variant is never published as free; with no
// valid offer nothing is emitted, since Google rejects Products without one.
// Multiple priced variants are published as a ProductGroup with hasVariant.
export function buildProductJsonLd(input: ProductJsonLdInput) {
  const offers = input.offers.filter(
    (o) => typeof o.price === 'number' && Number.isFinite(o.price) && o.price > 0,
  ) as (ProductOfferInput & { price: number })[];
  if (offers.length === 0) return null;

  const seller = { '@type': 'Organization', name: siteName, url: baseUrl };
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const returnPolicy = merchantReturnPolicy(input.returnPolicy);
  const offerFor = (o: ProductOfferInput & { price: number }) => ({
    '@type': 'Offer',
    url: input.url,
    price: o.price,
    priceCurrency: 'INR',
    priceValidUntil,
    availability: o.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller,
    shippingDetails,
    hasMerchantReturnPolicy: returnPolicy,
  });

  const images = input.images && input.images.length > 0 ? input.images : undefined;
  const brand = { '@type': 'Brand', name: input.brand || siteName };
  const properties = (input.properties || []).filter((p) => p.value && String(p.value).trim() !== '');
  const shared = {
    ...(input.description && { description: input.description }),
    brand,
    ...(input.category && { category: input.category }),
    ...(input.material && { material: input.material }),
    ...(properties.length > 0 && {
      additionalProperty: properties.map((p) => ({ '@type': 'PropertyValue', name: p.name, value: p.value })),
    }),
  };
  const rating = input.rating;
  const aggregateRating = rating && rating.count > 0 && typeof rating.average === 'number'
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Math.round(rating.average * 10) / 10,
          reviewCount: rating.count,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : {};

  const variesBy = input.variesBy || [];
  if (offers.length > 1 && variesBy.length > 0) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProductGroup',
      name: input.name,
      url: input.url,
      ...(input.sku && { productGroupID: input.sku }),
      ...(images && { image: images }),
      ...shared,
      variesBy: variesBy.map((v) => `https://schema.org/${v}`),
      hasVariant: offers.map((o) => ({
        '@type': 'Product',
        name: o.name || input.name,
        ...(o.sku && { sku: o.sku }),
        ...((o.image || images) && { image: o.image || images?.[0] }),
        ...(variesBy.includes('color') && (o.color || input.color) && { color: o.color || input.color }),
        ...(variesBy.includes('size') && o.size && { size: o.size }),
        offers: offerFor(o),
      })),
      ...aggregateRating,
    };
  }

  // Single product: one Offer, or the lowest-priced one if variants lack attributes
  const offer = offers.reduce((low, o) => (o.price < low.price ? o : low), offers[0]);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url: input.url,
    ...(images && { image: images }),
    ...(input.sku && { sku: input.sku }),
    ...(input.color && { color: input.color }),
    ...shared,
    offers: offerFor(offer),
    ...aggregateRating,
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}
