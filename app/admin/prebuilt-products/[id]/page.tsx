// PATH: app/admin/prebuilt-products/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditPageClient from "./EditPageClient";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
    const product = await prisma.prebuiltProductRiya.findUnique({
        where: { id: params.id },
        select: { name: true },
    });
    return {
        title: product ? `Edit: ${product.name} | Admin` : "Not Found | Admin",
    };
}

export default async function EditPrebuiltProductPage({ params }: Props) {
    const product = await prisma.prebuiltProductRiya.findUnique({
        where: { id: params.id },
        include: {
            images: { orderBy: { position: "asc" } },
            attributes: true,
            variants: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!product) notFound();

    // Shape DB data into form defaults
    const defaultValues = {
        id: product.id,
        name: product.name,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription ?? "",
        category: product.category,
        isCustomizable: product.isCustomizable,
        highlighted: product.highlighted,
        length: product.length ?? undefined,
        breadth: product.breadth ?? undefined,
        height: product.height ?? undefined,
        weight: product.weight ?? undefined,
        features: product.features,
        attributes: product.attributes.map((a) => ({
            label: a.label,
            value: a.value,
        })),
        variants: product.variants.map((v) => ({
            id: v.id,
            price: v.price,
            originalPrice: v.originalPrice,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
            colorName: v.colorName ?? "",
            colorHex: v.colorHex ?? "",
            sizeName: v.sizeName ?? "",
            sizeCode: v.sizeCode ?? "",
        })),
        images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText ?? "",
            position: img.position,
            colorName: img.colorName ?? "",
        })),
    };

    return (
        <EditPageClient productId={product.id} defaultValues={defaultValues} />
    );
}
