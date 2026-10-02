// app/prebuilt-products/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PrebuiltPageClient from './_components/PrebuiltPageClient';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy Custom 3D Printed Products Online in India | Scribbl3D',
    },
    description:
        'Shop custom 3D printed products online in India at Scribbl3D. Personalized keychains, lithophane photo lamps, home decor & figurines. Fast Pan-India dispatch!',
    keywords: [
        '3D printed products India',
        'custom 3D printed keychains',
        'lithophane photo lamps India',
        '3D printed home decor',
        'personalized 3D printed gifts',
        '3D printed mini figurines',
        'buy 3D printed items online',
        'cosplay mask helmets India',
        'Red Hood mask',
        'Doom mask',
        'Scribbl3D custom prints'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/prebuilt-products' },
    openGraph: {
        title: 'Buy Custom 3D Printed Products & Gifts in India | Scribbl3D',
        description:
            'Discover unique custom 3D printed products in India. Personalized name keychains, lithophane photo lamps, desk accessories, and decor with express delivery.',
        url: 'https://www.scribbl3d.com/prebuilt-products',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-image.png',
            width: 1200,
            height: 630,
            alt: 'Scribbl3D - Custom 3D Printed Products, Lamps & Decor India'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy Custom 3D Printed Products Online in India | Scribbl3D',
        description: 'Shop custom 3D printed products online in India at Scribbl3D. Personalized keychains, lithophane photo lamps, home decor & figurines.',
        images: ['https://www.scribbl3d.com/og-image.png'],
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
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://www.scribbl3d.com' },
                { name: 'Prebuilt Products', url: 'https://www.scribbl3d.com/prebuilt-products' },
            ]} />
            <CollectionPageSchema
                name="3D Printed Products"
                description="Shop unique 3D printed products — custom keychains, lamps, decor, figurines, and more"
                url="https://www.scribbl3d.com/prebuilt-products"
                numberOfItems={products.length}
                items={products
                    .filter((p: any) => p.slug)
                    .map((p: any) => ({
                        name: p.name,
                        url: `https://www.scribbl3d.com/prebuilt-products/${p.slug}`,
                    }))}
            />
            <PrebuiltPageClient initialProducts={products} />
        </>
    );
}
