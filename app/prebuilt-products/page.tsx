// app/prebuilt-products/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PrebuiltPageClient from './_components/PrebuiltPageClient';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printed Products Online in India | Scribbl3D',
    },
    description:
        'Shop unique 3D printed products in India — custom keychains, lamps, decor, figurines, and more. Personalise your order. Fast shipping, expert craftsmanship at Scribbl3D.',
    keywords: [
        '3D printed products India',
        'custom 3D prints',
        '3D printed keychains',
        '3D printed lamps',
        '3D printed decor',
        '3D printed figurines',
        'personalized 3D prints',
        'buy 3D prints online',
        'Scribbl3D'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/prebuilt-products' },
    openGraph: {
        title: 'Buy 3D Printed Products Online in India | Scribbl3D',
        description:
            'Shop unique 3D printed products — custom keychains, lamps, decor, figurines, and more. Fast shipping at Scribbl3D.',
        url: 'https://www.scribbl3d.com/prebuilt-products',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-prebuilt.png',
            width: 1200,
            height: 630,
            alt: '3D Printed Products - Custom Keychains, Lamps, Decor'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printed Products Online in India | Scribbl3D',
        description: 'Shop unique 3D printed products — custom keychains, lamps, decor, figurines. Personalise your order.',
        images: ['https://www.scribbl3d.com/og-prebuilt.png'],
    },
};

export const revalidate = 60;

async function getInitialProducts() {
    const products = await prisma.prebuiltProducts.findMany({
        include: {
            images: { orderBy: { position: 'asc' } },
            attributes: true,
            variants: { where: { isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return JSON.parse(JSON.stringify(products));
}

export default async function PrebuiltPage() {
    const products = await getInitialProducts();

    return (
        <>
            <CollectionPageSchema
                name="3D Printed Products"
                description="Shop unique 3D printed products — custom keychains, lamps, decor, figurines, and more"
                url="https://www.scribbl3d.com/prebuilt-products"
                numberOfItems={products.length}
            />
            <PrebuiltPageClient initialProducts={products} />
        </>
    );
}
