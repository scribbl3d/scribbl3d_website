// PATH: app/api/admin/prebuilt-products/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const ensureUniqueSlug = async (
    baseSlug: string,
    excludeId: string,
): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    const maxAttempts = 100;

    while (counter <= maxAttempts) {
        const existing = await prisma.prebuiltProducts.findFirst({
            where: { slug, NOT: { id: excludeId } },
        });
        if (!existing) return slug;
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return `${baseSlug}-${Date.now()}`;
};

const parseDim = (val: unknown): number | null => {
    if (val === null || val === undefined || val === "") return null;
    const n = typeof val === "number" ? val : parseFloat(String(val));
    return isNaN(n) ? null : n;
};

/* ============================================================================
   GET /api/admin/prebuilt-products/[id]
   ============================================================================ */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
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
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error(`[PREBUILT_GET] error`, error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   PUT /api/admin/prebuilt-products/[id]
   ============================================================================ */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const shortDescription = formData.get("shortDescription") as string;
        const longDescription =
            (formData.get("longDescription") as string) || null;
        const category = formData.get("category") as string;
        const isCustomizable = formData.get("isCustomizable") === "true";
        const highlighted = formData.get("highlighted") === "true";
        const inStock = formData.get("inStock") !== "false";

        const weight = formData.get("weight")
            ? parseFloat(formData.get("weight") as string)
            : null;

        let finalSlug = slug?.trim();
        if (!finalSlug) finalSlug = generateSlug(name.trim());
        finalSlug = await ensureUniqueSlug(finalSlug, id);

        const features = JSON.parse(
            (formData.get("features") as string) || "[]",
        );
        const attributes = JSON.parse(
            (formData.get("attributes") as string) || "[]",
        );
        const variants = JSON.parse(
            (formData.get("variants") as string) || "[]",
        );

        const existingImages = JSON.parse(
            (formData.get("existingImages") as string) || "[]",
        );

        const newFiles = formData.getAll("newImages") as File[];
        const newMetaStrings = formData.getAll("newImagesMeta") as string[];

        const uploadedImages: {
            url: string;
            altText: string;
            position: number;
            colorName: string | null;
            isMain: boolean;
        }[] = await Promise.all(
            newFiles.map(async (file, i) => {
                const meta = JSON.parse(newMetaStrings[i] || "{}");
                const buffer = Buffer.from(await file.arrayBuffer());

                const uploadResult: any = await new Promise((resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            {
                                folder: "prebuilt-products-new",
                                resource_type: "image",

                                transformation: [
                                    {
                                        width: 1600,
                                        height: 1600,
                                        crop: "pad",
                                        background: "white",
                                        quality: "auto:good",
                                        fetch_format: "auto",
                                    },
                                ],
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            },
                        )
                        .end(buffer);
                });

                return {
                    url: uploadResult.secure_url,
                    altText: meta.altText || name.trim(),
                    position: meta.position ?? existingImages.length + i,
                    colorName: meta.colorName || null,
                    isMain: meta.isMain ?? false,
                };
            })
        );

        const existing = await prisma.prebuiltProducts.findUnique({
            where: { id },
            include: { images: true, variants: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        // Removed images
        const keptImageIds = new Set(existingImages.map((img: any) => img.id));
        const removedImages = existing.images.filter(
            (img) => !keptImageIds.has(img.id),
        );

        for (const img of removedImages) {
            try {
                const publicId = img.url
                    .split("/")
                    .slice(-2)
                    .join("/")
                    .replace(/\.[^/.]+$/, "");
                await cloudinary.uploader.destroy(publicId);
            } catch {
                console.warn("Cloudinary delete failed:", img.url);
            }
        }

        // Removed variants
        const incomingVariantIds = variants
            .filter((v: any) => v.id)
            .map((v: any) => v.id as string);
        const removedVariantIds = existing.variants
            .map((v) => v.id)
            .filter((vid) => !incomingVariantIds.includes(vid));

        // Transaction
        await prisma.$transaction(async (tx) => {
            await tx.prebuiltProducts.update({
                where: { id },
                data: {
                    name: name.trim(),
                    slug: finalSlug,
                    shortDescription: shortDescription.trim(),
                    longDescription: longDescription?.trim() || null,
                    category,
                    isCustomizable,
                    highlighted,
                    inStock,
                    weight,
                    features,
                },
            });

            await tx.prebuiltAttributes.deleteMany({
                where: { prebuildProductId: id },
            });

            if (attributes.length) {
                await tx.prebuiltAttributes.createMany({
                    data: attributes
                        .filter((a: any) => a.label?.trim() && a.value?.trim())
                        .map((a: any) => ({
                            prebuildProductId: id,
                            label: a.label.trim(),
                            value: a.value.trim(),
                        })),
                });
            }

            if (removedVariantIds.length) {
                await tx.prebuiltVariants.deleteMany({
                    where: { id: { in: removedVariantIds } },
                });
            }

            for (const v of variants) {
                const variantData = {
                    price: Math.round(parseFloat(String(v.price)) || 0),
                    originalPrice: Math.round(
                        parseFloat(String(v.originalPrice)) || 0,
                    ),
                    isActive: v.isActive ?? true,
                    inStock: v.inStock ?? true, // ← variant-level inStock
                    colorName: v.colorName?.trim() || null,
                    colorHex: v.colorHex?.trim() || null,
                    sizeName: v.sizeName?.trim() || null,
                    length: parseDim(v.length),
                    breadth: parseDim(v.breadth),
                    height: parseDim(v.height),
                };

                if (v.id) {
                    await tx.prebuiltVariants.update({
                        where: { id: v.id },
                        data: variantData,
                    });
                } else {
                    await tx.prebuiltVariants.create({
                        data: { prebuildProductId: id, ...variantData },
                    });
                }
            }

            if (removedImages.length) {
                await tx.prebuiltImages.deleteMany({
                    where: { id: { in: removedImages.map((img) => img.id) } },
                });
            }

            for (const img of existingImages) {
                await tx.prebuiltImages.update({
                    where: { id: img.id },
                    data: {
                        altText: img.altText || name.trim(),
                        position: img.position,
                        colorName: img.colorName || null,
                        isMain: img.isMain ?? false,
                    },
                });
            }

            if (uploadedImages.length) {
                await tx.prebuiltImages.createMany({
                    data: uploadedImages.map((img) => ({
                        prebuildProductId: id,
                        url: img.url,
                        altText: img.altText,
                        position: img.position,
                        colorName: img.colorName,
                        isMain: img.isMain,
                    })),
                });
            }
        });

        const updated = await prisma.prebuiltProducts.findUnique({
            where: { id },
            include: {
                images: { orderBy: { position: "asc" } },
                attributes: true,
                variants: { orderBy: { createdAt: "asc" } },
            },
        });

        return NextResponse.json({ product: updated });
    } catch (error) {
        console.error(`[PREBUILT_PUT] error`, error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   DELETE /api/admin/prebuilt-products/[id]
   ============================================================================ */
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const product = await prisma.prebuiltProducts.findUnique({
            where: { id },
            include: { images: true },
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        for (const img of product.images) {
            try {
                const publicId = img.url
                    .split("/")
                    .slice(-2)
                    .join("/")
                    .replace(/\.[^/.]+$/, "");
                await cloudinary.uploader.destroy(publicId);
            } catch {
                console.warn("Cloudinary delete failed:", img.url);
            }
        }

        await prisma.prebuiltProducts.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[PREBUILT_DELETE] error`, error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 },
        );
    }
}
