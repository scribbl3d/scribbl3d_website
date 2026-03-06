// PATH: app/admin/prebuilt-products/[id]/page.tsx
// THIS IS A SERVER COMPONENT (no "use client")

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { ProductFormData } from "../PrebuiltProductForm";
import EditPageClient from "./EditPageClient";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.prebuiltProducts.findUnique({
        where: { id },
        include: {
            images: { orderBy: { position: "asc" } },
            attributes: true,
            variants: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!product) {
        notFound();
    }

    const defaultValues: Partial<ProductFormData & { id: string }> = {
        id: product.id,
        name: product.name,
        slug: product.slug || "",
        shortDescription: product.shortDescription ?? undefined,
        longDescription: product.longDescription || "",
        category: product.category,
        isCustomizable: product.isCustomizable,
        inStock: product.inStock,
        highlighted: product.highlighted,
        weight: product.weight ? product.weight.toString() : "",
        features: product.features || [],
        attributes: (product.attributes || []).map((attr) => ({
            label: attr.label,
            value: attr.value,
        })),
        variants: (product.variants || []).map((v) => ({
            id: v.id,
            price: v.price,
            originalPrice: v.originalPrice,
            priceDisplay: v.price.toString(),
            originalPriceDisplay: v.originalPrice.toString(),
            isActive: v.isActive,
            inStock: v.inStock ?? true,
            colorName: v.colorName || "",
            colorHex: v.colorHex || "",
            sizeName: v.sizeName || "",
            length: v.length != null ? v.length.toString() : "",
            breadth: v.breadth != null ? v.breadth.toString() : "",
            height: v.height != null ? v.height.toString() : "",
        })),
        images: (product.images || []).map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText || "",
            position: img.position,
            colorName: img.colorName || "",
            isMain: img.isMain,
            isNew: false,
        })),
    };

    return <EditPageClient productId={id} defaultValues={defaultValues} />;
}
