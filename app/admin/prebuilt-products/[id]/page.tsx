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
    // ✅ Server component can use await
    const { id } = await params;

    // Fetch product from database
    const product = await prisma.prebuiltProductRiya.findUnique({
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

    // Prepare defaultValues with SLUG
    const defaultValues: Partial<ProductFormData & { id: string }> = {
        id: product.id,
        name: product.name,
        slug: product.slug || "", // ← SLUG FROM DATABASE
        shortDescription: product.shortDescription,
        longDescription: product.longDescription || "",
        category: product.category,
        isCustomizable: product.isCustomizable,
        highlighted: product.highlighted,
        length: product.length ? product.length.toString() : "",
        breadth: product.breadth ? product.breadth.toString() : "",
        height: product.height ? product.height.toString() : "",
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
            priceDisplay: (v.price / 100).toString(),
            originalPriceDisplay: (v.originalPrice / 100).toString(),
            isActive: v.isActive,
            colorName: v.colorName || "",
            colorHex: v.colorHex || "",
            sizeName: v.sizeName || "",
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

    // ✅ Pass all data to CLIENT component
    return <EditPageClient productId={id} defaultValues={defaultValues} />;
}
