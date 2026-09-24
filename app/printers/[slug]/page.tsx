// app/printers/[slug]/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrinterDetailClient from './_components/PrinterDetailClient';
import { buildBreadcrumbJsonLd, buildProductJsonLd, jsonLdString, truncateAtWord } from '@/lib/metadata';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

type Props = { params: Promise<{ slug: string }> };

async function getPrinter(slug: string) {
    const printer = await prisma.printer.findUnique({
        where: { slug },
        include: {
            images: { orderBy: { sortOrder: 'asc' } },
            attributes: true,
            specifications: { orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] },
            features: { orderBy: { sortOrder: 'asc' } },
            applications: { orderBy: { sortOrder: 'asc' } },
            downloads: { orderBy: { sortOrder: 'asc' } },
        },
    });
    return printer;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const printer = await getPrinter(slug);

    if (!printer) {
        return { title: 'Printer Not Found | Scribbl3D' };
    }

    // Admin-managed SEO fields take precedence over generated copy
    const title = printer.metaTitle?.trim() || `${printer.name} — Buy in India | Scribbl3D`;
    const description = printer.metaDescription?.trim() || `Buy ${printer.name} 3D printer in India at ₹${printer.price.toLocaleString('en-IN')}. ${truncateAtWord(printer.shortDescription ?? 'Fast shipping, expert support, and best prices.', 100)}`;
    const url = `${baseUrl}/printers/${printer.slug}`;
    const mainImage = printer.images?.[0]?.url
        ? printer.images[0].url.replace('/upload/', '/upload/w_1200,h_630,c_pad,b_white/')
        : `${baseUrl}/og-image.png`;

    return {
        title,
        description,
        keywords: [printer.name, printer.brand, printer.technology, '3D printer', 'buy 3D printer India', 'Scribbl3D'],
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: [{ url: mainImage, width: 1200, height: 630, alt: printer.name }],
            locale: 'en_IN',
            siteName: 'Scribbl3D',
        },
        twitter: { card: 'summary_large_image', title, description, images: [mainImage] },
        other: {
            'product:price:amount': printer.price.toString(),
            'product:price:currency': 'INR',
        },
    };
}

export default async function PrinterDetailPage({ params }: Props) {
    const { slug } = await params;
    const printer = await getPrinter(slug);

    if (!printer) {
        notFound();
    }

    // Serialize to plain object (removes Date instances for client boundary)
    const serializedPrinter = JSON.parse(JSON.stringify(printer));

    // Product JSON-LD structured data
    const url = `${baseUrl}/printers/${printer.slug}`;
    const jsonLd = buildProductJsonLd({
        name: printer.name,
        description: printer.description || printer.shortDescription,
        url,
        images: printer.images?.map((img) => img.url) || [],
        brand: printer.brand,
        sku: printer.id,
        category: '3D Printers',
        offers: [{ price: printer.price, inStock: printer.inStock, sku: printer.id }],
        returnPolicy: 'printer',
        properties: [
            { name: 'Technology', value: printer.technology },
            ...printer.specifications.map((spec) => ({ name: spec.label, value: spec.value })),
        ],
    });
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: '3D Printers', url: '/printers' },
        { name: printer.name, url },
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
            <PrinterDetailClient printer={serializedPrinter} />
        </>
    );
}
