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
    alternates: { canonical: 'https://www.scribbl3d.com/resins' },
    openGraph: {
        title: 'Buy 3D Printer Resin Online in India | Scribbl3D',
        description:
            'Shop LCD/MSLA resins from top brands. Best prices in India, fast shipping.',
        url: 'https://www.scribbl3d.com/resins',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
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

    return (
        <>
            {/* Server-rendered for Googlebot — visually hidden, semantically present */}
            <section className="sr-only" aria-hidden="true">
                <h1>Buy 3D Printer Resin Online in India</h1>
                <p>
                    Shop our complete range of LCD and MSLA photopolymer 3D printer resins
                    from top brands including Elegoo, Anycubic, and Phrozen. Available in
                    4K, 8K, and 10K resolutions for miniatures, prototypes, jewelry, and
                    dental applications. Free shipping across India.
                </p>
                <ul>
                    {resins.map((resin: any) => (
                        <li key={resin.id}>
                            <a href={`/resins/${resin.slug}`}>
                                <h2>{resin.name}</h2>
                                <p>{resin.brand} — {resin.technology}</p>
                                {resin.shortDescription && <p>{resin.shortDescription}</p>}
                                {resin.weights?.[0] && (
                                    <p>From ₹{resin.weights[0].price.toLocaleString('en-IN')}</p>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <ResinsPageClient initialResins={resins} initialTotal={total} />
        </>
    );
}