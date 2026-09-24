// app/resins/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ResinsPageClient from './_components/ResinsPageClient';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';
import { LISTING_PAGE_SIZE, paginatedListingMetadata, parseListingPage } from '@/lib/listing-page';

export { type ResinFiltersState } from './_components/ResinsPageClient';

const baseMetadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printer Resin Online in India — Elegoo, Anycubic, Phrozen | Scribbl3D',
    },
    description:
        'Shop LCD/MSLA photopolymer resins from Elegoo, Anycubic, Phrozen, and more. 4K, 8K, 10K resolution. Best prices in India, fast shipping.',
    keywords: [
        '3D printer resin India',
        'buy resin online',
        'LCD resin',
        'MSLA resin',
        'Elegoo resin',
        'Anycubic resin',
        'Phrozen resin',
        '8K resin',
        'photopolymer resin',
        'Scribbl3D'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/resins' },
    openGraph: {
        title: 'Buy 3D Printer Resin Online in India | Scribbl3D',
        description:
            'Shop LCD/MSLA resins from top brands. Best prices in India, fast shipping.',
        url: 'https://www.scribbl3d.com/resins',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-image.png',
            width: 1200,
            height: 630,
            alt: '3D Printer Resins - LCD/MSLA from Top Brands'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printer Resin Online in India | Scribbl3D',
        description: 'Shop LCD/MSLA photopolymer resins from Elegoo, Anycubic, Phrozen. 4K, 8K, 10K resolution.',
        images: ['https://www.scribbl3d.com/og-image.png'],
    },
};

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const page = parseListingPage((await searchParams).page);
    return paginatedListingMetadata(baseMetadata, 'https://www.scribbl3d.com/resins', page);
}

export const revalidate = 60;

async function getInitialResins(page: number) {
    const [resins, total] = await Promise.all([
        prisma.resin.findMany({
            include: {
                weights: { orderBy: { sortOrder: 'asc' } },
                colours: {
                    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            // Same order as the listing API, with an id tiebreaker for stable pages
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip: (page - 1) * LISTING_PAGE_SIZE,
            take: LISTING_PAGE_SIZE,
        }),
        prisma.resin.count(),
    ]);

    return {
        resins: JSON.parse(JSON.stringify(resins)),
        total,
    };
}

export default async function ResinsPage({ searchParams }: Props) {
    // ?page=N renders that page on the server so crawlers can reach every product
    const page = parseListingPage((await searchParams).page);
    const { resins, total } = await getInitialResins(page);
    if (page > 1 && page > Math.ceil(total / LISTING_PAGE_SIZE)) {
        notFound();
    }
    const listingUrl = page > 1 ? `https://www.scribbl3d.com/resins?page=${page}` : 'https://www.scribbl3d.com/resins';

    return (
        <>
            <CollectionPageSchema
                name="3D Printer Resins"
                description="Shop LCD/MSLA photopolymer resins from Elegoo, Anycubic, Phrozen. 4K, 8K, 10K resolution"
                url={listingUrl}
                numberOfItems={total}
                items={resins.map((item: any) => ({
                    name: item.name,
                    url: `https://www.scribbl3d.com/resins/${item.slug}`,
                }))}
            />
            <ResinsPageClient initialResins={resins} initialTotal={total} initialPage={page} />
        </>
    );
}