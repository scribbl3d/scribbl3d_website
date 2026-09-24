// app/filament/[id]/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FilamentDetailClient from './_components/FilamentDetailClient';
import { buildProductJsonLd, jsonLdString, truncateAtWord } from '@/lib/metadata';

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
        price > 0
            ? `Buy ${filament.name} 3D printer filament online in India at best price ₹${price.toLocaleString('en-IN')}`
            : `Buy ${filament.name} 3D printer filament online in India`,
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
            ...(price > 0 && {
                'product:price:amount': price.toString(),
                'product:price:currency': 'INR',
            }),
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

    // Product JSON-LD structured data (all variants, for AI engines and rich results)
    const productUrl = `${baseUrl}/filament/${filament.slug || filament.id}`;
    const productJsonLd = buildProductJsonLd({
        name: filament.name,
        description: filament.longDescription || filament.shortDescription,
        url: productUrl,
        images: filament.images || [],
        brand: filament.brand,
        sku: filament.id,
        category: `3D Printer Filament > ${filament.material || 'Filament'}`,
        color: filament.colorName,
        material: filament.material,
        offers: filament.variants.map((v) => ({
            price: v.price,
            inStock: filament.inStock && v.inStock,
            sku: v.id,
            name: `${filament.name.trim()} ${v.diameter} ${v.spoolWeight}`,
            size: `${v.diameter} ${v.spoolWeight}`,
            color: filament.colorName,
        })),
        variesBy: ['size'],
        returnPolicy: 'standard',
        properties: [
            { name: 'Material Type', value: filament.material },
            { name: 'Finish Type', value: filament.finishType },
            { name: 'Color', value: filament.colorName },
            { name: 'Diameter', value: Array.from(new Set(filament.variants.map((v) => v.diameter))).join(', ') },
            { name: 'Spool Weight', value: Array.from(new Set(filament.variants.map((v) => v.spoolWeight))).join(', ') },
            ...filament.specifications.map((spec) => ({ name: spec.key, value: spec.value })),
        ],
    });

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
            {productJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdString(productJsonLd) }}
                />
            )}
            
            {/* Breadcrumb JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd) }}
            />

            <FilamentDetailClient initialFilament={serializedFilament} />
        </>
    );
}
