// app/printers/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintersPageClient from './_components/PrintersPageClient';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { LISTING_PAGE_SIZE, paginatedListingMetadata, parseListingPage } from '@/lib/listing-page';

const baseMetadata: Metadata = {
    title: {
        absolute: 'Buy FDM & Resin 3D Printers Online in India | Scribbl3D',
    },
    description:
        'Buy FDM and resin 3D printers, premium filaments, and resins online in India from Bambu Lab, Creality, Anycubic, and Elegoo. Fast shipping, expert support, and genuine products.',
    keywords: [
        '3D printers India',
        'buy 3D printer online',
        '3D printer online India',
        'FDM 3D printer India',
        'resin 3D printer India',
        'desktop 3D printers India',
        'Bambu Lab India',
        'Creality India',
        'Anycubic India',
        'Elegoo India',
        'Phrozen India',
        'Jamghe India',
        'professional 3D printers',
        'industrial 3D printers',
        'high-speed 3D printers',
        '3D printer for beginners',
        'Scribbl3D'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/printers' },
    openGraph: {
        title: 'Buy FDM & Resin 3D Printers Online in India | Scribbl3D',
        description:
            'Buy FDM and resin 3D printers online in India from Bambu Lab, Creality, Anycubic, and Elegoo. Fast shipping, expert support, and genuine products.',
        url: 'https://www.scribbl3d.com/printers',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Buy FDM & Resin 3D Printers Online in India | Scribbl3D'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy FDM & Resin 3D Printers Online in India | Scribbl3D',
        description: 'Buy FDM and resin 3D printers online in India from Bambu Lab, Creality, Anycubic, and Elegoo. Fast shipping, expert support, and genuine products.',
        images: ['https://www.scribbl3d.com/og-image.png'],
    },
};

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const page = parseListingPage((await searchParams).page);
    return paginatedListingMetadata(baseMetadata, 'https://www.scribbl3d.com/printers', page);
}

export const revalidate = 60;

async function getInitialPrinters(page: number) {
    const [printers, total] = await Promise.all([
        prisma.printer.findMany({
            include: {
                images: true,
                attributes: true,
            },
            // Same order as the listing API, with an id tiebreaker for stable pages
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip: (page - 1) * LISTING_PAGE_SIZE,
            take: LISTING_PAGE_SIZE,
        }),
        prisma.printer.count(),
    ]);

    const serialized = printers.map((p) => {
        const mainImage =
            p.images.find((img) => img.isMain)?.url ||
            p.images[0]?.url ||
            null;
        return {
            ...p,
            imageUrl: mainImage,
            volumeDisplay: `${p.volumeLength} × ${p.volumeWidth} × ${p.volumeHeight}`,
            priceDisplay: `₹${(p.price / 100).toLocaleString('en-IN')}`,
        };
    });

    return {
        printers: JSON.parse(JSON.stringify(serialized)),
        total,
    };
}

export default async function PrintersPage({ searchParams }: Props) {
    // ?page=N renders that page on the server so crawlers can reach every product
    const page = parseListingPage((await searchParams).page);
    const { printers, total } = await getInitialPrinters(page);
    if (page > 1 && page > Math.ceil(total / LISTING_PAGE_SIZE)) {
        notFound();
    }
    const listingUrl = page > 1 ? `https://www.scribbl3d.com/printers?page=${page}` : 'https://www.scribbl3d.com/printers';

    return (
        <>
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://www.scribbl3d.com' },
                { name: '3D Printers', url: 'https://www.scribbl3d.com/printers' },
            ]} />
            <CollectionPageSchema
                name="3D Printers"
                description="Shop FDM and resin 3D printers from Bambu Lab, Creality, Anycubic, Elegoo, Phrozen"
                url={listingUrl}
                numberOfItems={total}
                items={printers.map((item: any) => ({
                    name: item.name,
                    url: `https://www.scribbl3d.com/printers/${item.slug}`,
                }))}
            />
            <PrintersPageClient initialPrinters={printers} initialTotal={total} initialPage={page} />
        </>
    );
}
