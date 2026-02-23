// PATH: app/api/admin/prebuilt-products/route.ts

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ============================================================================
   GET – List all prebuilt products (Search + Sort + Pagination)
   ============================================================================ */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        /* -------------------- PAGINATION -------------------- */
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        /* -------------------- SEARCH -------------------- */
        const searchField = searchParams.get("searchField") || "name";
        const searchTerm = searchParams.get("searchTerm") || "";

        /* -------------------- SORT -------------------- */
        const sort = searchParams.get("sort") || ""; // e.g. "name-asc", "updatedAt-desc"

        /* -------------------- SEARCH LOGIC -------------------- */
        let fieldFilter: Prisma.PrebuiltProductRiyaWhereInput = {};

        if (searchTerm.trim() !== "") {
            if (searchField === "category") {
                fieldFilter.category = {
                    contains: searchTerm,
                    mode: "insensitive",
                };
            } else {
                fieldFilter[
                    searchField as keyof Prisma.PrebuiltProductRiyaWhereInput
                ] = {
                    contains: searchTerm,
                    mode: "insensitive",
                } as any;
            }
        }

        const where: Prisma.PrebuiltProductRiyaWhereInput = {
            AND: [fieldFilter],
        };

        /* -------------------- SORT LOGIC -------------------- */
        let orderBy: Prisma.PrebuiltProductRiyaOrderByWithRelationInput[] = [];

        if (sort) {
            const [field, direction] = sort.split("-");
            const order = direction === "desc" ? "desc" : "asc";

            if (
                ["name", "category", "updatedAt", "createdAt"].includes(field)
            ) {
                orderBy.push({ [field]: order } as any);
                if (field !== "name") orderBy.push({ name: "asc" }); // tie-breaker
            }
        }

        if (orderBy.length === 0) {
            orderBy = [{ updatedAt: "desc" }];
        }

        /* -------------------- FETCH DATA -------------------- */
        const [products, totalCount] = await Promise.all([
            prisma.prebuiltProductRiya.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    images: { orderBy: { position: "asc" }, take: 1 },
                    attributes: true,
                    variants: { orderBy: { createdAt: "asc" } },
                },
            }),
            prisma.prebuiltProductRiya.count({ where }),
        ]);

        /* -------------------- FORMAT RESPONSE -------------------- */
        const formatted = products.map((p) => ({
            ...p,
            primaryImage: p.images[0]?.url || null,
            primaryVariant: p.variants[0] || null,
        }));

        return NextResponse.json({
            products: formatted,
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
   POST – Upload image  OR  Create product
   Detected by Content-Type:
     multipart/form-data  → image upload to Cloudinary
     application/json     → create new product
   ============================================================================ */
export async function POST(request: NextRequest) {
    const contentType = request.headers.get("content-type") ?? "";

    /* ──────────────────────────────────────────────────────────────────────────
       IMAGE UPLOAD  (multipart/form-data)
       Called from the form when user picks a file.
       Returns: { url, publicId, width, height }
    ────────────────────────────────────────────────────────────────────────── */
    if (contentType.includes("multipart/form-data")) {
        try {
            const formData = await request.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return NextResponse.json(
                    { error: "No file provided" },
                    { status: 400 },
                );
            }

            if (!file.type.startsWith("image/")) {
                return NextResponse.json(
                    { error: "Only image files are allowed" },
                    { status: 400 },
                );
            }

            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "File size must be under 10MB" },
                    { status: 400 },
                );
            }

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

            return NextResponse.json({
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height,
            });
        } catch (error) {
            console.error("[PREBUILT_IMAGE_UPLOAD]", error);
            return NextResponse.json(
                { error: "Image upload failed" },
                { status: 500 },
            );
        }
    }

    /* ──────────────────────────────────────────────────────────────────────────
       CREATE PRODUCT  (application/json)
    ────────────────────────────────────────────────────────────────────────── */
    try {
        const body = await request.json();

        const {
            name,
            shortDescription,
            longDescription,
            category,
            isCustomizable = false,
            highlighted = false,
            length,
            breadth,
            height,
            weight,
            features = [],
            attributes = [],
            variants = [],
            images = [],
        } = body;

        // Basic validation
        if (!name?.trim())
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 },
            );
        if (!shortDescription?.trim())
            return NextResponse.json(
                { error: "Short description required" },
                { status: 400 },
            );
        if (!category?.trim())
            return NextResponse.json(
                { error: "Category is required" },
                { status: 400 },
            );

        const product = await prisma.prebuiltProductRiya.create({
            data: {
                name: name.trim(),
                shortDescription: shortDescription.trim(),
                longDescription: longDescription?.trim() || null,
                category,
                isCustomizable,
                highlighted,
                length: length ? parseFloat(length) : null,
                breadth: breadth ? parseFloat(breadth) : null,
                height: height ? parseFloat(height) : null,
                weight: weight ? parseFloat(weight) : null,
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
                        price: parseInt(v.price) || 0,
                        originalPrice: parseInt(v.originalPrice) || 0,
                        stockQuantity: parseInt(v.stockQuantity) || 0,
                        isActive: v.isActive ?? true,
                        colorName: v.colorName || null,
                        colorHex: v.colorHex || null,
                        sizeName: v.sizeName || null,
                        sizeCode: v.sizeCode || null,
                    })),
                },

                images: {
                    create: images.map((img: any, i: number) => ({
                        url: img.url,
                        altText: img.altText || name.trim(),
                        position: img.position ?? i,
                        colorName: img.colorName || null,
                    })),
                },
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
