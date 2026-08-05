// app/printers/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PrintersPageClient from './_components/PrintersPageClient';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printers Online in India — Bambu Lab, Creality, Anycubic | Scribbl3D',
    },
    description:
        'Shop FDM and resin 3D printers from Bambu Lab, Creality, Anycubic, Elegoo, and Phrozen. Best prices in India, fast shipping, expert support.',
    keywords: [
        '3D printers India',
        'buy 3D printer online',
        'Bambu Lab India',
        'Creality printer',
        'Anycubic printer',
        'FDM printer',
        'resin printer',
        'SLA printer',
        'best 3D printer India',
        'Scribbl3D'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/printers' },
    openGraph: {
        title: 'Buy 3D Printers Online in India | Scribbl3D',
        description:
            'Shop FDM and resin 3D printers from top brands. Best prices in India.',
        url: 'https://www.scribbl3d.com/printers',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-printers.png',
            width: 1200,
            height: 630,
            alt: '3D Printers - FDM & Resin from Top Brands'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printers Online in India | Scribbl3D',
        description: 'Shop FDM and resin 3D printers from Bambu Lab, Creality, Anycubic, Elegoo, Phrozen. Best prices in India.',
        images: ['https://www.scribbl3d.com/og-printers.png'],
    },
};

export const revalidate = 60;

async function getInitialPrinters() {
    const [printers, total] = await Promise.all([
        prisma.printer.findMany({
            include: {
                images: true,
                attributes: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 9,
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

export default async function PrintersPage() {
    const { printers, total } = await getInitialPrinters();

    return (
        <>
            <CollectionPageSchema
                name="3D Printers"
                description="Shop FDM and resin 3D printers from Bambu Lab, Creality, Anycubic, Elegoo, Phrozen"
                url="https://www.scribbl3d.com/printers"
                numberOfItems={total}
            />
            <PrintersPageClient initialPrinters={printers} initialTotal={total} />
        </>
    );
}
