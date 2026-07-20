// app/filament/[id]/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FilamentDetailClient from './_components/FilamentDetailClient';
import { generateStructuredData, truncateAtWord } from '@/lib/metadata';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

type Props = { params: Promise<{ id: string }> };

async function getFilament(slug: string) {
    const filament = await prisma.filament.findFirst({
        where: {
            OR: [
                { slug },
                { id: slug },
            ],
        },
        include: {
            variants: {
                orderBy: { displayOrder: 'asc' },
            },
            specifications: {
                orderBy: { displayOrder: 'asc' },
            },
            downloads: {
                orderBy: { displayOrder: 'asc' },
            },
        },
    });
    return filament;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const filament = await getFilament(id);

    if (!filament) {
        return { title: 'Filament Not Found | Scribbl3D' };
    }

    const defaultVariant = filament.variants.find(v => v.isDefault) || filament.variants[0];
    const price = defaultVariant?.price || 0;
    const originalPrice = defaultVariant?.originalPrice || null;
    const discount = originalPrice && originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100) 
        : 0;

    // Enhanced SEO title with long-tail keywords
    const title = `Buy ${filament.name} ${filament.material || ''} 3D Printer Filament Online in India | ${filament.brand || 'Scribbl3D'}`;
    
    // Enhanced description with more details
    const descriptionParts = [
        `Buy ${filament.name} 3D printer filament online in India at best price ₹${price.toLocaleString('en-IN')}`,
        discount > 0 ? `(${discount}% OFF)` : '',
        filament.material ? `${filament.material} material` : '',
        filament.finishType ? `with ${filament.finishType} finish` : '',
        filament.brand ? `from ${filament.brand}` : '',
        '✓ Fast Shipping ✓ Premium Quality ✓ Expert Support',
    ].filter(Boolean).join('. ');
    
    const description = truncateAtWord(descriptionParts, 155);
    const url = `${baseUrl}/filament/${filament.slug || filament.id}`;
    const mainImage = filament.images?.[0]
        ? filament.images[0].replace('/upload/', '/upload/w_1200,h_630,c_pad,b_white/')
        : `${baseUrl}/og-image.png`;

    // Enhanced keywords with long-tail variations
    const keywords = [
        filament.name,
        `${filament.name} filament`,
        `buy ${filament.name} India`,
        filament.brand || '',
        `${filament.brand} filament` || '',
        filament.material || '',
        `${filament.material} filament` || '',
        `${filament.material} 3D printer filament` || '',
        filament.finishType || '',
        `${filament.finishType} filament` || '',
        filament.colorName || '',
        '3D printer filament',
        '3D printing filament India',
        'buy 3D filament online',
        'best 3D printer filament',
        'premium filament India',
        'Scribbl3D'
    ].filter(Boolean);

    return {
        title: truncateAtWord(title, 60),
        description,
        keywords,
        alternates: { canonical: url },
        openGraph: {
            title: truncateAtWord(title, 60),
            description,
            url,
            type: 'website',
            images: [{ url: mainImage, width: 1200, height: 630, alt: `${filament.name} - ${filament.material} 3D Printer Filament` }],
            locale: 'en_IN',
            siteName: 'Scribbl3D',
        },
        twitter: { 
            card: 'summary_large_image', 
            title: truncateAtWord(title, 60), 
            description, 
            images: [mainImage] 
        },
        other: {
            'product:price:amount': price.toString(),
            'product:price:currency': 'INR',
            'product:availability': filament.inStock ? 'in stock' : 'out of stock',
            'product:condition': 'new',
            'product:brand': filament.brand || 'Scribbl3D',
            'product:category': `3D Printer Filament > ${filament.material || 'Filament'}`,
        },
    };
}

export default async function FilamentDetailPage({ params }: Props) {
    const { id } = await params;
    const filament = await getFilament(id);

    if (!filament) {
        notFound();
    }

    // Serialize to plain object (removes Date instances for client boundary)
    const serializedFilament = JSON.parse(JSON.stringify(filament));

    // Product JSON-LD structured data
    const defaultVariant = filament.variants.find(v => v.isDefault) || filament.variants[0];
    const price = defaultVariant?.price || 0;
    const originalPrice = defaultVariant?.originalPrice || price;

    // Enhanced Product schema with detailed attributes for AI engines
    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': filament.name,
        'description': filament.longDescription || filament.shortDescription || '',
        'image': filament.images || [],
        'brand': {
            '@type': 'Brand',
            'name': filament.brand || 'Scribbl3D'
        },
        'offers': {
            '@type': 'Offer',
            'price': price,
            'priceCurrency': 'INR',
            'availability': filament.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            'url': `${baseUrl}/filament/${filament.slug || filament.id}`,
            'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            'seller': {
                '@type': 'Organization',
                'name': 'Scribbl3D'
            }
        },
        'sku': filament.id,
        'mpn': filament.id,
        'material': filament.material,
        'color': filament.colorName,
        'additionalProperty': [
            {
                '@type': 'PropertyValue',
                'name': 'Material Type',
                'value': filament.material || 'N/A'
            },
            {
                '@type': 'PropertyValue',
                'name': 'Finish Type',
                'value': filament.finishType || 'N/A'
            },
            {
                '@type': 'PropertyValue',
                'name': 'Color',
                'value': filament.colorName || 'N/A'
            },
            {
                '@type': 'PropertyValue',
                'name': 'Diameter',
                'value': defaultVariant?.diameter || 'Multiple options'
            },
            {
                '@type': 'PropertyValue',
                'name': 'Spool Weight',
                'value': defaultVariant?.spoolWeight || 'Multiple options'
            }
        ],
        'category': `3D Printer Filament > ${filament.material || 'Filament'}`,
        'url': `${baseUrl}/filament/${filament.slug || filament.id}`
    };

    // BreadcrumbList JSON-LD for navigation
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': baseUrl
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': '3D Printer Filaments',
                'item': `${baseUrl}/filament`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': filament.material || 'Filament',
                'item': `${baseUrl}/filament?material=${encodeURIComponent(filament.material || '')}`
            },
            {
                '@type': 'ListItem',
                'position': 4,
                'name': filament.name,
                'item': `${baseUrl}/filament/${filament.slug || filament.id}`
            }
        ]
    };

    return (
        <>
            {/* Product JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            
            {/* Breadcrumb JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <FilamentDetailClient initialFilament={serializedFilament} />
        </>
    );
}
