// app/printers/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PrintersPageClient from './_components/PrintersPageClient';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printers Online in India — Bambu Lab, Creality, Anycubic | Scribbl3D',
    },
    description:
        'Shop FDM and resin 3D printers from Bambu Lab, Creality, Anycubic, Elegoo, and Phrozen. Best prices in India, fast shipping, expert support.',
    alternates: { canonical: 'https://www.scribbl3d.com/printers' },
    openGraph: {
        title: 'Buy 3D Printers Online in India | Scribbl3D',
        description:
            'Shop FDM and resin 3D printers from top brands. Best prices in India.',
        url: 'https://www.scribbl3d.com/printers',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
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
            {/* Server-rendered for Googlebot — visually hidden, semantically present */}
            <section className="sr-only" aria-hidden="true">
                <h1>Buy 3D Printers Online in India</h1>
                <p>
                    Shop our complete range of FDM and resin 3D printers from top brands
                    including Bambu Lab, Creality, Anycubic, Elegoo, and Phrozen. Best
                    prices in India with fast shipping and expert support.
                </p>
                <ul>
                    {printers.map((printer: any) => (
                        <li key={printer.id}>
                            <a href={`/printers/${printer.slug}`}>
                                <h2>{printer.name}</h2>
                                <p>{printer.brand} — {printer.technology}</p>
                                {printer.shortDescription && <p>{printer.shortDescription}</p>}
                                <p>{printer.priceDisplay}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <PrintersPageClient initialPrinters={printers} initialTotal={total} />
        </>
    );
}
