// PATH: app/admin/prebuilt-products/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditPageClient from "./EditPageClient";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.prebuiltProductRiya.findUnique({
        where: { id },
        select: { name: true },
    });

    return {
        title: product ? `Edit: ${product.name} | Admin` : "Not Found | Admin",
    };
}

export default async function EditPrebuiltProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.prebuiltProductRiya.findUnique({
        where: { id },
        include: {
            images: { orderBy: { position: "asc" } },
            attributes: true,
            variants: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!product) notFound();

    const defaultValues = {
        id: product.id,
        name: product.name,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription ?? "",
        category: product.category,
        isCustomizable: product.isCustomizable,
        highlighted: product.highlighted,

        // Numbers converted to strings to match ProductFormData type
        length: product.length?.toString() ?? "",
        breadth: product.breadth?.toString() ?? "",
        height: product.height?.toString() ?? "",
        weight: product.weight?.toString() ?? "",

        features: product.features as any, // Cast if JSON typing is strict

        attributes: product.attributes.map((a) => ({
            label: a.label,
            value: a.value,
        })),

        variants: product.variants.map((v) => ({
            id: v.id,
            price: v.price.toString(), // Ensure match with client-side state
            originalPrice: v.originalPrice.toString(),
            isActive: v.isActive,
            colorName: v.colorName ?? "",
            colorHex: v.colorHex ?? "",
            sizeName: v.sizeName ?? "",
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
        <EditPageClient
            productId={product.id}
            defaultValues={defaultValues as any}
        />
    );
}
