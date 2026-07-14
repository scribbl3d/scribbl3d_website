// app/filament/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import FilamentPageClient from './_components/FilamentPageClient';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printer Filament Online in India — PLA, PETG, ABS, TPU | Scribbl3D',
    },
    description:
        'Shop premium 3D printer filaments - PLA, PLA+, PETG, ABS, TPU, Nylon, and specialty filaments. Best prices in India, fast shipping, expert support.',
    alternates: { canonical: 'https://www.scribbl3d.com/filament' },
    openGraph: {
        title: 'Buy 3D Printer Filament Online in India | Scribbl3D',
        description:
            'Shop premium 3D printer filaments from top brands. Best prices in India.',
        url: 'https://www.scribbl3d.com/filament',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
    },
};

export const revalidate = 60;

async function getInitialFilaments() {
    const [filaments, total] = await Promise.all([
        prisma.filament.findMany({
            include: {
                variants: {
                    orderBy: { price: "asc" },
                    take: 10,
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 9,
        }),
        prisma.filament.count(),
    ]);

    // Transform data for frontend
    const transformedFilaments = filaments.map((filament) => {
        const defaultVariant = filament.variants.find(v => v.isDefault) || filament.variants[0];
        const price = defaultVariant?.price || 0;
        const originalPrice = defaultVariant?.originalPrice || null;
        const discount = originalPrice && originalPrice > price 
            ? Math.round(((originalPrice - price) / originalPrice) * 100) 
            : 0;
        
        return {
            id: filament.id,
            name: filament.name,
            slug: filament.slug,
            shortDescription: filament.shortDescription,
            material: filament.material,
            finishType: filament.finishType,
            brand: filament.brand,
            colorName: filament.colorName,
            hexCode: filament.hexCode,
            images: filament.images,
            inStock: filament.inStock,
            price,
            originalPrice,
            discount,
            diameter: defaultVariant?.diameter || null,
            spoolWeight: defaultVariant?.spoolWeight || null,
            variants: filament.variants,
        };
    });

    return {
        filaments: JSON.parse(JSON.stringify(transformedFilaments)),
        total,
    };
}

export default async function FilamentPage() {
    const { filaments, total } = await getInitialFilaments();

    return (
        <>
            {/* Server-rendered for Googlebot — visually hidden, semantically present */}
            <section className="sr-only" aria-hidden="true">
                <h1>Buy 3D Printer Filament Online in India</h1>
                <p>
                    Shop our complete range of 3D printer filaments including PLA, PLA+, PETG, 
                    ABS, TPU, Nylon, and specialty filaments. Best prices in India with fast 
                    shipping and expert support.
                </p>
                <ul>
                    {filaments.map((filament: any) => (
                        <li key={filament.id}>
                            <a href={`/filament/${filament.slug || filament.id}`}>
                                <h2>{filament.name}</h2>
                                <p>{filament.brand} — {filament.material} — {filament.finishType}</p>
                                {filament.shortDescription && <p>{filament.shortDescription}</p>}
                                <p>₹{filament.price}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <FilamentPageClient initialFilaments={filaments} initialTotal={total} />
        </>
    );
}
