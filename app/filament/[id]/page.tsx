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

    const title = `${filament.name} — Buy in India | Scribbl3D`;
    const description = `Buy ${filament.name} 3D printer filament in India at ₹${price.toLocaleString('en-IN')}. ${truncateAtWord(filament.shortDescription ?? 'Premium quality filament with fast shipping and expert support.', 100)}`;
    const url = `${baseUrl}/filament/${filament.slug || filament.id}`;
    const mainImage = filament.images?.[0]
        ? filament.images[0].replace('/upload/', '/upload/w_1200,h_630,c_pad,b_white/')
        : `${baseUrl}/og-image.png`;

    return {
        title,
        description,
        keywords: [
            filament.name,
            filament.brand || '',
            filament.material || '',
            filament.finishType || '',
            '3D printer filament',
            'buy filament India',
            'Scribbl3D'
        ].filter(Boolean),
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: [{ url: mainImage, width: 1200, height: 630, alt: filament.name }],
            locale: 'en_IN',
            siteName: 'Scribbl3D',
        },
        twitter: { card: 'summary_large_image', title, description, images: [mainImage] },
        other: {
            'product:price:amount': price.toString(),
            'product:price:currency': 'INR',
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

    const jsonLd = generateStructuredData('product', {
        name: filament.name,
        description: filament.longDescription || filament.shortDescription || '',
        images: filament.images || [],
        brand: filament.brand || 'Scribbl3D',
        price: price,
        originalPrice: originalPrice,
        currency: 'INR',
        availability: filament.inStock ? 'InStock' : 'OutOfStock',
        url: `${baseUrl}/filament/${filament.slug || filament.id}`,
    });

    return (
        <>
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Server-rendered for Googlebot — visually hidden, semantically present */}
            <section className="sr-only" aria-hidden="true">
                <h1>{filament.name}</h1>
                <p>{filament.brand} — {filament.material} — {filament.finishType}</p>
                {filament.shortDescription && <p>{filament.shortDescription}</p>}
                {filament.longDescription && <div dangerouslySetInnerHTML={{ __html: filament.longDescription }} />}
                <p>Price: ₹{price.toLocaleString('en-IN')}</p>
                {originalPrice > price && <p>Original Price: ₹{originalPrice.toLocaleString('en-IN')}</p>}
                <p>Availability: {filament.inStock ? 'In Stock' : 'Out of Stock'}</p>
                
                {filament.features && filament.features.length > 0 && (
                    <>
                        <h2>Features</h2>
                        <ul>
                            {filament.features.map((feature: string, index: number) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </>
                )}
                
                {filament.applications && filament.applications.length > 0 && (
                    <>
                        <h2>Applications</h2>
                        <ul>
                            {filament.applications.map((app: string, index: number) => (
                                <li key={index}>{app}</li>
                            ))}
                        </ul>
                    </>
                )}
            </section>

            <FilamentDetailClient initialFilament={serializedFilament} />
        </>
    );
}
