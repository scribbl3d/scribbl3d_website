// app/prebuilt-products/[slug]/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrebuiltProductDetailClient from './_components/PrebuiltProductDetailClient';
import { generateStructuredData, truncateAtWord } from '@/lib/metadata';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
    return prisma.prebuiltProducts.findUnique({
        where: { slug },
        include: {
            images: { orderBy: { position: 'asc' } },
            variants: true,
            attributes: true,
            reviews: { orderBy: { createdAt: 'desc' } },
        },
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return { title: 'Product Not Found | Scribbl3D' };
    }

    const firstVariant = product.variants?.find((v) => v.isActive) || product.variants?.[0];
    const priceDisplay = firstVariant ? `₹${firstVariant.price.toLocaleString('en-IN')}` : '';
    const title = `${product.name} — Buy in India | Scribbl3D`;
    const description = `Buy ${product.name}${priceDisplay ? ` from ${priceDisplay}` : ''}. ${truncateAtWord(product.shortDescription ?? 'Fast shipping, expert support, and best prices.', 100)}`;
    const url = `${baseUrl}/prebuilt-products/${product.slug}`;
    const rawImage = product.images?.find((i) => i.isMain)?.url || product.images?.[0]?.url || '';
    const mainImage = rawImage
        ? rawImage.replace('/upload/', '/upload/w_1200,h_630,c_pad,b_white/')
        : `${baseUrl}/og-image.png`;

    return {
        title,
        description,
        keywords: [product.name, product.category || 'prebuilt', '3D printed', 'buy India', 'Scribbl3D'],
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: [{ url: mainImage, width: 1200, height: 630, alt: product.name }],
            locale: 'en_IN',
            siteName: 'Scribbl3D',
        },
        twitter: { card: 'summary_large_image', title, description, images: [mainImage] },
        other: {
            ...(firstVariant && {
                'product:price:amount': firstVariant.price.toString(),
                'product:price:currency': 'INR',
            }),
        },
    };
}

export default async function PrebuiltProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const serializedProduct = JSON.parse(JSON.stringify(product));

    const firstVariant = product.variants?.find((v) => v.isActive) || product.variants?.[0];
    const jsonLd = generateStructuredData('product', {
        name: product.name,
        description: product.longDescription || product.shortDescription || '',
        images: product.images?.map((img) => img.url) || [],
        brand: 'Scribbl3D',
        price: firstVariant?.price || 0,
        category: 'prebuilt-products',
        slug: product.slug,
        inStock: product.inStock,
    });

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <PrebuiltProductDetailClient product={serializedProduct} />
        </>
    );
}
