// app/resins/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ResinsPageClient from './_components/ResinsPageClient';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { LISTING_PAGE_SIZE, paginatedListingMetadata, parseListingPage } from '@/lib/listing-page';

export { type ResinFiltersState } from './_components/ResinsPageClient';

const baseMetadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printer Resin Online in India | UV & 8K | Scribbl3D',
    },
    description:
        'Buy 3D printer resin online in India at Scribbl3D. Shop 405nm Standard, 8K, Water-Washable & ABS-Like UV resins from Elegoo, Phrozen and Anycubic. GST invoice. Shop now!',
    keywords: [
        '3D printer resin India',
        'buy resin online',
        'LCD resin',
        'MSLA resin',
        'Elegoo resin',
        'Anycubic resin',
        'Phrozen resin',
        '8K resin',
        'water-washable resin',
        'ABS-like resin',
        'photopolymer resin',
        'Scribbl3D'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/resins' },
    openGraph: {
        title: 'Buy 3D Printing Resins Online in India - 405nm & 8K UV Resins | Scribbl3D',
        description:
            'Explore high-precision 3D printing UV resins in India at Scribbl3D. Stocking Elegoo, Phrozen, and Anycubic photopolymer resins with fast dispatch.',
        url: 'https://www.scribbl3d.com/resins',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Scribbl3D - Buy UV 3D Printer Resins in India'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printer Resin Online in India | UV & 8K | Scribbl3D',
        description: 'Buy 3D printer resin online in India at Scribbl3D. Shop 405nm Standard, 8K, Water-Washable & ABS-Like UV resins with GST invoice.',
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
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://www.scribbl3d.com' },
                { name: 'Resins', url: 'https://www.scribbl3d.com/resins' },
            ]} />
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