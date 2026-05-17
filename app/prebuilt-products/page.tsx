// app/prebuilt-products/page.tsx — Server Component
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PrebuiltPageClient from './_components/PrebuiltPageClient';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy 3D Printed Products Online in India | Scribbl3D',
    },
    description:
        'Shop unique 3D printed products in India — custom keychains, lamps, decor, figurines, and more. Personalise your order. Fast shipping, expert craftsmanship at Scribbl3D.',
    alternates: { canonical: 'https://www.scribbl3d.com/prebuilt-products' },
    openGraph: {
        title: 'Buy 3D Printed Products Online in India | Scribbl3D',
        description:
            'Shop unique 3D printed products — custom keychains, lamps, decor, figurines, and more. Fast shipping at Scribbl3D.',
        url: 'https://www.scribbl3d.com/prebuilt-products',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
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
            {/* Server-rendered for Googlebot — visually hidden, semantically present */}
            <section className="sr-only" aria-hidden="true">
                <h1>Buy 3D Printed Products Online in India</h1>
                <p>
                    Shop unique 3D printed products in India — custom keychains, lamps,
                    decor, figurines, and more. Personalise your order with fast shipping
                    and expert craftsmanship at Scribbl3D.
                </p>
                <ul>
                    {products.map((product: any) => (
                        <li key={product.id}>
                            <a href={`/prebuilt-products/${product.slug}`}>
                                <h2>{product.name}</h2>
                                {product.shortDescription && <p>{product.shortDescription}</p>}
                                {product.variants?.[0] && (
                                    <p>From ₹{product.variants[0].price.toLocaleString('en-IN')}</p>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            </section>

            <PrebuiltPageClient initialProducts={products} />
        </>
    );
}
