// app/resins/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ResinsPageClient from './_components/ResinsPageClient';

export { type ResinFiltersState } from './_components/ResinsPageClient';

export const metadata: Metadata = {
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
            url: 'https://www.scribbl3d.com/og-resins.png',
            width: 1200,
            height: 630,
            alt: '3D Printer Resins - LCD/MSLA from Top Brands'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printer Resin Online in India | Scribbl3D',
        description: 'Shop LCD/MSLA photopolymer resins from Elegoo, Anycubic, Phrozen. 4K, 8K, 10K resolution.',
        images: ['https://www.scribbl3d.com/og-resins.png'],
    },
};

export const revalidate = 60;

async function getInitialResins() {
    const [resins, total] = await Promise.all([
        prisma.resin.findMany({
            include: {
                weights: { orderBy: { sortOrder: 'asc' } },
                colours: {
                    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 9,
        }),
        prisma.resin.count(),
    ]);

    return {
        resins: JSON.parse(JSON.stringify(resins)),
        total,
    };
}

export default async function ResinsPage() {
    const { resins, total } = await getInitialResins();

    return <ResinsPageClient initialResins={resins} initialTotal={total} />;
}