// app/prebuilt-products/[slug]/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrebuiltProductDetailClient from './_components/PrebuiltProductDetailClient';
import { buildBreadcrumbJsonLd, buildProductJsonLd, jsonLdString, truncateAtWord } from '@/lib/metadata';

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

    // Lowest priced active variant, matching the JSON-LD price range
    const prices = (product.variants || []).filter((v) => v.isActive && v.price > 0).map((v) => v.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const priceDisplay = lowestPrice ? `₹${lowestPrice.toLocaleString('en-IN')}` : '';
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
            ...(lowestPrice && {
                'product:price:amount': lowestPrice.toString(),
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

    const url = `${baseUrl}/prebuilt-products/${product.slug}`;
    const activeVariants = (product.variants || []).filter((v) => v.isActive);
    const jsonLd = buildProductJsonLd({
        name: product.name,
        description: product.longDescription || product.shortDescription,
        url,
        images: product.images?.map((img) => img.url) || [],
        brand: 'Scribbl3D',
        sku: product.id,
        category: product.category || undefined,
        offers: activeVariants.map((v) => ({
            price: v.price,
            inStock: product.inStock && v.inStock,
            sku: v.id,
            name: [product.name, v.colorName, v.sizeName].filter(Boolean).join(' - '),
            color: v.colorName,
            size: v.sizeName,
        })),
        variesBy: [
            ...(activeVariants.some((v) => v.colorName) ? ['color' as const] : []),
            ...(activeVariants.some((v) => v.sizeName) ? ['size' as const] : []),
        ],
        // Customisable and personalised products follow the customised-product return rule
        returnPolicy:
            product.isCustomizable || product.category?.toLowerCase().startsWith('personalis')
                ? 'customised'
                : 'standard',
    });
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Prebuilt Products', url: '/prebuilt-products' },
        { name: product.name, url },
    ]);

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd) }}
            />
            <PrebuiltProductDetailClient product={serializedProduct} />
        </>
    );
}
