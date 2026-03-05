// PATH: app/api/admin/prebuilt-products/route.ts

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

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
    excludeId?: string,
): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    const maxAttempts = 100;

    while (counter <= maxAttempts) {
        const existing = await prisma.prebuiltProducts.findUnique({
            where: { slug },
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
   GET – List all prebuilt products (Search + Sort + Pagination)
   ============================================================================ */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const searchField = searchParams.get("searchField") || "name";
        const searchTerm = searchParams.get("searchTerm") || "";
        const sort = searchParams.get("sort") || "";

        let fieldFilter: Prisma.PrebuiltProductsWhereInput = {};

        if (searchTerm.trim() !== "") {
            fieldFilter[
                searchField as keyof Prisma.PrebuiltProductsWhereInput
            ] = {
                contains: searchTerm,
                mode: "insensitive",
            } as any;
        }

        const where: Prisma.PrebuiltProductsWhereInput = {
            AND: [fieldFilter],
        };

        let orderBy: any = [];

        if (sort) {
            const [field, direction] = sort.split("-");
            const order = direction === "desc" ? "desc" : "asc";

            if (
                ["name", "category", "updatedAt", "createdAt"].includes(field)
            ) {
                orderBy.push({ [field]: order });
                if (field !== "name") orderBy.push({ name: "asc" });
            } else if (field === "price") {
                orderBy.push({ variants: { _count: order } });
            }
        }

        if (orderBy.length === 0) orderBy = [{ updatedAt: "desc" }];

        const [products, totalCount] = await Promise.all([
            prisma.prebuiltProducts.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    images: { orderBy: { position: "asc" }, take: 1 },
                    variants: { orderBy: { createdAt: "asc" } },
                },
            }),
            prisma.prebuiltProducts.count({ where }),
        ]);

        return NextResponse.json({
            products,
            page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
        });
    } catch (error) {
        console.error("[ADMIN_PREBUILT_PRODUCTS_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   POST – Create product
   ============================================================================ */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const shortDescription = formData.get("shortDescription") as string;
        const longDescription =
            (formData.get("longDescription") as string) || null;
        const category = formData.get("category") as string;
        const isCustomizable = formData.get("isCustomizable") === "true";
        const highlighted = formData.get("highlighted") === "true";
        const inStock = formData.get("inStock") !== "false"; // defaults to true

        const weight = formData.get("weight")
            ? parseFloat(formData.get("weight") as string)
            : null;

        if (!name?.trim() || !shortDescription?.trim() || !category?.trim()) {
            return NextResponse.json(
                { error: "Required fields missing" },
                { status: 400 },
            );
        }

        let finalSlug = slug?.trim();
        if (!finalSlug) finalSlug = generateSlug(name.trim());
        finalSlug = await ensureUniqueSlug(finalSlug);

        const features = JSON.parse(
            (formData.get("features") as string) || "[]",
        );
        const attributes = JSON.parse(
            (formData.get("attributes") as string) || "[]",
        );
        const variants = JSON.parse(
            (formData.get("variants") as string) || "[]",
        );

        const newFiles = formData.getAll("newImages") as File[];
        const newMetaStrings = formData.getAll("newImagesMeta") as string[];

        const imageRecords: any[] = [];

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

            imageRecords.push({
                url: uploadResult.secure_url,
                altText: meta.altText || name.trim(),
                position: meta.position ?? i,
                colorName: meta.colorName || null,
                isMain: meta.isMain ?? i === 0,
            });
        }

        const product = await prisma.prebuiltProducts.create({
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
                attributes: {
                    create: attributes
                        .filter((a: any) => a.label?.trim() && a.value?.trim())
                        .map((a: any) => ({
                            label: a.label.trim(),
                            value: a.value.trim(),
                        })),
                },
                variants: {
                    create: variants.map((v: any) => ({
                        price: Math.round(parseFloat(String(v.price)) || 0),
                        originalPrice: Math.round(
                            parseFloat(String(v.originalPrice)) || 0,
                        ),
                        isActive: v.isActive ?? true,
                        colorName: v.colorName?.trim() || null,
                        colorHex: v.colorHex?.trim() || null,
                        sizeName: v.sizeName?.trim() || null,
                        length: parseDim(v.length),
                        breadth: parseDim(v.breadth),
                        height: parseDim(v.height),
                    })),
                },
                images: { create: imageRecords },
            },
            include: {
                images: { orderBy: { position: "asc" } },
                attributes: true,
                variants: { orderBy: { createdAt: "asc" } },
            },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error("[PREBUILT_PRODUCT_POST]", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   DELETE – Delete product by ID
   ============================================================================ */
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 },
            );
        }

        await prisma.prebuiltProducts.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("[PREBUILT_PRODUCT_DELETE]", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 },
        );
    }
}
