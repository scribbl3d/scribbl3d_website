import { prisma } from '@/lib/prisma';
import CategoryListingClient from './_components/CategoryListingClient';

export const revalidate = 60;

type Props = { params: Promise<{ category: string }> };

// Server wrapper: loads the same records as /api/prebuilt-products?category=…
export default async function CategoryListingPage({ params }: Props) {
    const { category } = await params;

    const products = await prisma.prebuiltProducts.findMany({
        where: {
            category: {
                equals: category.replace(/-/g, ' '),
                mode: 'insensitive',
            },
        },
        include: {
            images: { orderBy: { position: 'asc' } },
            attributes: true,
            variants: { where: { isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return <CategoryListingClient initialProducts={JSON.parse(JSON.stringify(products))} />;
}
