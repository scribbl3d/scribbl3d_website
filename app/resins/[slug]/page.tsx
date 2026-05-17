// app/resins/[slug]/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ResinDetailClient from './_components/ResinDetailClient';
import { generateStructuredData, truncateAtWord } from '@/lib/metadata';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

type Props = { params: Promise<{ slug: string }> };

async function getResin(slug: string) {
    return prisma.resin.findUnique({
        where: { slug },
        include: {
            attributes: true,
            compatibilities: true,
            weights: { orderBy: { sortOrder: 'asc' } },
            colours: {
                orderBy: { sortOrder: 'asc' },
                include: { images: { orderBy: { sortOrder: 'asc' } } },
            },
            specifications: { orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] },
            features: { orderBy: { sortOrder: 'asc' } },
            applications: { orderBy: { sortOrder: 'asc' } },
            downloads: { orderBy: { sortOrder: 'asc' } },
        },
    });
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const resin = await getResin(slug);

    if (!resin) {
        return { title: 'Resin Not Found | Scribbl3D' };
    }

    const firstWeight = resin.weights?.[0];
    const priceDisplay = firstWeight ? `₹${firstWeight.price.toLocaleString('en-IN')}` : '';
    const title = `${resin.name} — Buy ${resin.technology} Resin in India | Scribbl3D`;
    const description = `Buy ${resin.name} ${resin.technology} resin in India${priceDisplay ? ` from ${priceDisplay}` : ''}. ${truncateAtWord(resin.shortDescription ?? 'Fast shipping, expert support, and best prices.', 100)}`;
    const url = `${baseUrl}/resins/${resin.slug}`;
    const rawImage = resin.colours?.[0]?.images?.[0]?.url || resin.cardImageUrl || '';
    const mainImage = rawImage
        ? rawImage.replace('/upload/', '/upload/w_1200,h_630,c_pad,b_white/')
        : `${baseUrl}/og-image.png`;

    return {
        title,
        description,
        keywords: [resin.name, resin.brand, resin.technology, '3D resin', 'buy resin India', 'Scribbl3D'],
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: [{ url: mainImage, width: 1200, height: 630, alt: resin.name }],
            locale: 'en_IN',
            siteName: 'Scribbl3D',
        },
        twitter: { card: 'summary_large_image', title, description, images: [mainImage] },
        other: {
            ...(firstWeight && {
                'product:price:amount': firstWeight.price.toString(),
                'product:price:currency': 'INR',
            }),
        },
    };
}

export default async function ResinDetailPage({ params }: Props) {
    const { slug } = await params;
    const resin = await getResin(slug);

    if (!resin) {
        notFound();
    }

    const serializedResin = JSON.parse(JSON.stringify(resin));

    const firstWeight = resin.weights?.[0];
    const jsonLd = generateStructuredData('product', {
        name: resin.name,
        description: resin.description || resin.shortDescription || '',
        images: resin.colours?.flatMap((c) => c.images?.map((img) => img.url) || []) || [],
        brand: resin.brand,
        price: firstWeight?.price || 0,
        category: 'resins',
        slug: resin.slug,
        inStock: resin.inStock,
    });

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <ResinDetailClient resin={serializedResin} />
        </>
    );
}