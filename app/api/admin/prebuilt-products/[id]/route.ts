// PATH: app/api/admin/prebuilt-products/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ============================================================================
   GET /api/admin/prebuilt-products/[id]
   ============================================================================ */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params; // Await params for Next.js 15+ compatibility

        const product = await prisma.prebuiltProductRiya.findUnique({
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
        const { id } = await params; // Await params for Next.js 15+ compatibility
        const formData = await request.formData();

        // 1️⃣ Basic fields
        const name = formData.get("name") as string;
        const shortDescription = formData.get("shortDescription") as string;
        const longDescription =
            (formData.get("longDescription") as string) || null;
        const category = formData.get("category") as string;
        const isCustomizable = formData.get("isCustomizable") === "true";
        const highlighted = formData.get("highlighted") === "true";

        const weight = formData.get("weight")
            ? parseFloat(formData.get("weight") as string)
            : null;
        const length = formData.get("length")
            ? parseFloat(formData.get("length") as string)
            : null;
        const breadth = formData.get("breadth")
            ? parseFloat(formData.get("breadth") as string)
            : null;
        const height = formData.get("height")
            ? parseFloat(formData.get("height") as string)
            : null;

        // 2️⃣ JSON fields
        const features = JSON.parse(
            (formData.get("features") as string) || "[]",
        );
        const attributes = JSON.parse(
            (formData.get("attributes") as string) || "[]",
        );
        const variants = JSON.parse(
            (formData.get("variants") as string) || "[]",
        );

        // 3️⃣ Images
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
        }[] = [];

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const meta = JSON.parse(newMetaStrings[i] || "{}");
            const buffer = Buffer.from(await file.arrayBuffer());

            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "prebuilt-products-new",
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        },
                    )
                    .end(buffer);
            });

            uploadedImages.push({
                url: uploadResult.secure_url,
                altText: meta.altText || name.trim(),
                position: meta.position ?? existingImages.length + i,
                colorName: meta.colorName || null,
                isMain: meta.isMain ?? false,
            });
        }

        // 4️⃣ Existing product
        const existing = await prisma.prebuiltProductRiya.findUnique({
            where: { id },
            include: { images: true, variants: true },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        // 5️⃣ Removed images
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

        // 6️⃣ Removed variants
        const incomingVariantIds = variants
            .filter((v: any) => v.id)
            .map((v: any) => v.id as string);

        const removedVariantIds = existing.variants
            .map((v) => v.id)
            .filter((vid) => !incomingVariantIds.includes(vid));

        // 7️⃣ Transaction
        await prisma.$transaction(async (tx) => {
            await tx.prebuiltProductRiya.update({
                where: { id },
                data: {
                    name: name.trim(),
                    shortDescription: shortDescription.trim(),
                    longDescription: longDescription?.trim() || null,
                    category,
                    isCustomizable,
                    highlighted,
                    length,
                    breadth,
                    height,
                    weight,
                    features,
                },
            });

            await tx.prebuiltAttributeRiya.deleteMany({
                where: { prebuildProductId: id },
            });

            if (attributes.length) {
                await tx.prebuiltAttributeRiya.createMany({
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
                await tx.prebuiltVariantRiya.deleteMany({
                    where: { id: { in: removedVariantIds } },
                });
            }

            for (const v of variants) {
                if (v.id) {
                    await tx.prebuiltVariantRiya.update({
                        where: { id: v.id },
                        data: {
                            price: parseInt(v.price) || 0,
                            originalPrice: parseInt(v.originalPrice) || 0,
                            isActive: v.isActive ?? true,
                            colorName: v.colorName || null,
                            colorHex: v.colorHex || null,
                            sizeName: v.sizeName || null,
                        },
                    });
                } else {
                    await tx.prebuiltVariantRiya.create({
                        data: {
                            prebuildProductId: id,
                            price: parseInt(v.price) || 0,
                            originalPrice: parseInt(v.originalPrice) || 0,
                            isActive: v.isActive ?? true,
                            colorName: v.colorName || null,
                            colorHex: v.colorHex || null,
                            sizeName: v.sizeName || null,
                        },
                    });
                }
            }

            if (removedImages.length) {
                await tx.prebuiltImageRiya.deleteMany({
                    where: { id: { in: removedImages.map((img) => img.id) } },
                });
            }

            for (const img of existingImages) {
                await tx.prebuiltImageRiya.update({
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
                await tx.prebuiltImageRiya.createMany({
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

        const updated = await prisma.prebuiltProductRiya.findUnique({
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
        const { id } = await params; // Await params for Next.js 15+ compatibility

        const product = await prisma.prebuiltProductRiya.findUnique({
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

        await prisma.prebuiltProductRiya.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`[PREBUILT_DELETE] error`, error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 },
        );
    }
}
