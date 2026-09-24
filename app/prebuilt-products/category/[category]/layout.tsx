import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';
import { prisma } from '@/lib/prisma';

type Props = {
    params: Promise<{ category: string }>;
    children: React.ReactNode;
};

const CATEGORY_NAMES: Record<string, string> = {
    'cosplay': 'Cosplay Props & Accessories',
    'figurine': 'Figurines & Collectibles',
    'home-essentials': 'Home Essentials',
    'household-utilities': 'Household Utilities',
    'keychains': 'Keychains',
    'kits': 'DIY & Learning Kits',
    'lamps': 'Lamps & Lighting',
    'new-launch': 'New Launch',
    'personalised': 'Personalised Products',
    'statues': 'Statues & Decor',
    'the-latest': 'The Latest',
    'utilities': 'Utilities',
    'wall-decor': 'Wall Decor',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    'cosplay': 'High-detail cosplay props and accessories crafted for accuracy, durability, and convention-ready performance',
    'figurine': 'Premium 3D printed figurines designed with sharp detailing and smooth finishes',
    'home-essentials': 'Smart, minimal, and practical 3D printed products designed to simplify and elevate everyday living',
    'household-utilities': 'Functional and durable utility products engineered to solve real household problems efficiently',
    'keychains': 'Compact, creative, and customizable keychains — ideal for gifting, branding, and everyday carry',
    'kits': 'Curated DIY and learning kits designed to combine creativity, engineering, and hands-on exploration',
    'lamps': 'Aesthetic 3D printed lamps that blend modern design with warm, ambient lighting',
    'new-launch': 'Discover our latest product innovations — freshly designed and now available',
    'personalised': 'Custom-designed 3D printed products tailored to your name, brand, or unique idea',
    'statues': 'Elegant decorative statues crafted with precision detailing and premium surface finish',
    'the-latest': 'Trending and recently added products — stay updated with what\'s new at Scribbl3D',
    'utilities': 'Purpose-built 3D printed tools and accessories designed for functionality and long-term use',
    'wall-decor': 'Modern 3D printed wall décor pieces that add depth, texture, and character to your space',
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const categoryName = CATEGORY_NAMES[category] || category;
    const description = CATEGORY_DESCRIPTIONS[category] || `Shop ${categoryName} products`;
    const url = `/prebuilt-products/category/${category}`;

    return {
        title: `${categoryName} - 3D Printed Products`,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: `${categoryName} | Scribbl3D`,
            description,
            url,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${categoryName} | Scribbl3D`,
            description,
        },
    };
}

export default async function CategoryLayout({ params, children }: Props) {
    const { category } = await params;
    
    // Same category match as /api/prebuilt-products, which renders this listing
    const products = await prisma.prebuiltProducts.findMany({
        where: {
            category: {
                equals: category.replace(/-/g, ' '),
                mode: 'insensitive',
            },
        },
        select: { name: true, slug: true },
        orderBy: { createdAt: 'desc' },
    });

    // Unknown, empty categories are real 404s rather than empty self-canonical pages
    if (products.length === 0 && !CATEGORY_NAMES[category]) {
        notFound();
    }

    const categoryName = CATEGORY_NAMES[category] || category;
    const categoryDescription = CATEGORY_DESCRIPTIONS[category] || `Shop ${categoryName} products`;

    return (
        <>
            <CollectionPageSchema
                name={categoryName}
                description={categoryDescription}
                url={`https://www.scribbl3d.com/prebuilt-products/category/${category}`}
                numberOfItems={products.length}
                items={products
                    .filter((p) => p.slug)
                    .map((p) => ({
                        name: p.name,
                        url: `https://www.scribbl3d.com/prebuilt-products/${p.slug}`,
                    }))}
            />
            {children}
        </>
    );
}
