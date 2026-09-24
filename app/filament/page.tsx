// app/filament/page.tsx — Server Component
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FilamentPageClient from './_components/FilamentPageClient';
import FAQSchema from '@/components/seo/FAQSchema';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';
import FaqSection from '@/components/shared/FaqSection';
import { LISTING_PAGE_SIZE, paginatedListingMetadata, parseListingPage } from '@/lib/listing-page';

const baseMetadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printer Filament Online in India — PLA, PETG, ABS, TPU, Nylon | Scribbl3D',
    },
    description:
        'Shop premium 3D printer filaments online in India. PLA, PLA+, PETG, ABS, TPU, Nylon & specialty filaments from top brands. ✓ Best Prices ✓ Fast Shipping ✓ Expert Support ✓ 100% Genuine Products',
    keywords: [
        '3D printer filament',
        'buy 3D filament online India',
        'PLA filament India',
        'PETG filament',
        'ABS filament',
        'TPU filament',
        'Nylon filament',
        'PLA+ filament',
        'specialty filament',
        'silk filament',
        'matte filament',
        'wood filament',
        'carbon fiber filament',
        '3D printing material',
        'best 3D filament India',
        'premium filament',
        'Scribbl3D'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/filament' },
    openGraph: {
        title: 'Buy 3D Printer Filament Online in India | Best Prices & Quality',
        description:
            'Shop premium 3D printer filaments - PLA, PETG, ABS, TPU, Nylon from top brands. Best prices in India with fast shipping.',
        url: 'https://www.scribbl3d.com/filament',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-image.png',
            width: 1200,
            height: 630,
            alt: '3D Printer Filaments - PLA, PETG, ABS, TPU'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printer Filament Online in India | Scribbl3D',
        description: 'Shop premium 3D printer filaments - PLA, PETG, ABS, TPU, Nylon. Best prices in India.',
        images: ['https://www.scribbl3d.com/og-image.png'],
    },
};

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const page = parseListingPage((await searchParams).page);
    return paginatedListingMetadata(baseMetadata, 'https://www.scribbl3d.com/filament', page);
}

export const revalidate = 60;

async function getInitialFilaments(page: number) {
    const [filaments, total] = await Promise.all([
        prisma.filament.findMany({
            include: {
                variants: {
                    orderBy: { price: "asc" },
                    take: 10,
                },
            },
            // Same order as the listing API, with an id tiebreaker for stable pages
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip: (page - 1) * LISTING_PAGE_SIZE,
            take: LISTING_PAGE_SIZE,
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

export default async function FilamentPage({ searchParams }: Props) {
    // ?page=N renders that page on the server so crawlers can reach every product
    const page = parseListingPage((await searchParams).page);
    const { filaments, total } = await getInitialFilaments(page);
    if (page > 1 && page > Math.ceil(total / LISTING_PAGE_SIZE)) {
        notFound();
    }
    const listingUrl = page > 1 ? `https://www.scribbl3d.com/filament?page=${page}` : 'https://www.scribbl3d.com/filament';

    const faqs = [
        {
            question: "What is the best 3D printer filament for beginners?",
            answer: "PLA and PLA+ are the best filaments for beginners. They print at low temperatures (190-220°C), don't require a heated bed, and are easy to work with. PLA+ offers improved strength and flexibility over standard PLA, making it ideal for functional prints."
        },
        {
            question: "What's the difference between PLA and PLA+?",
            answer: "PLA+ is an enhanced formulation with improved layer adhesion, higher impact resistance, and better flexibility compared to standard PLA. It prints at similar temperatures (190-220°C) but produces stronger, more durable parts with less brittleness."
        },
        {
            question: "Which filament is best for high-temperature functional parts?",
            answer: "For high-temperature applications, we recommend Nylon, ABS, or PETG. Nylon offers the highest heat resistance (up to 80°C continuous use) and mechanical strength. ABS provides good heat resistance (up to 70°C) with easier printing. PETG is a good middle ground with heat resistance up to 65°C."
        },
        {
            question: "Do Silk filaments require post-processing?",
            answer: "No. Scribbl3D Silk filaments feature an enhanced formulation that produces a glossy metallic finish directly off the print bed, minimizing visible layer lines without any post-processing. The silk finish is achieved through the filament's unique composition."
        },
        {
            question: "What diameter filament should I buy - 1.75mm or 2.85mm?",
            answer: "Most consumer 3D printers use 1.75mm diameter filament. Check your printer's specifications before purchasing. 1.75mm is more common and offers faster flow rates, while 2.85mm (sometimes called 3mm) is used in some professional and older printer models."
        }
    ];

    return (
        <>
            <CollectionPageSchema
                name="3D Printer Filaments"
                description="Shop premium 3D printer filaments - PLA, PETG, ABS, TPU, Nylon from top brands"
                url={listingUrl}
                numberOfItems={total}
                items={filaments.map((f: any) => ({
                    name: f.name,
                    url: `https://www.scribbl3d.com/filament/${f.slug || f.id}`,
                }))}
            />
            <FAQSchema faqs={faqs} />
            <FilamentPageClient initialFilaments={filaments} initialTotal={total} initialPage={page} />
            {/* Visible FAQs matching the FAQPage structured data; extra bottom space clears the mobile filter bar */}
            <FaqSection title="3D Printer Filament FAQs" faqs={faqs} className="pb-24 lg:pb-12" />
        </>
    );
}
