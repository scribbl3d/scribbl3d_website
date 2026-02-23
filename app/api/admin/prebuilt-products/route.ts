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

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const searchField = searchParams.get("searchField") || "name";
        const searchTerm = searchParams.get("searchTerm") || "";
        const sort = searchParams.get("sort") || "";

        let fieldFilter: Prisma.PrebuiltProductRiyaWhereInput = {};

        if (searchTerm.trim() !== "") {
            fieldFilter[
                searchField as keyof Prisma.PrebuiltProductRiyaWhereInput
            ] = {
                contains: searchTerm,
                mode: "insensitive",
            } as any;
        }

        const where: Prisma.PrebuiltProductRiyaWhereInput = {
            AND: [fieldFilter],
        };

        let orderBy: Prisma.PrebuiltProductRiyaOrderByWithRelationInput[] = [];

        if (sort) {
            const [field, direction] = sort.split("-");
            const order = direction === "desc" ? "desc" : "asc";
            if (
                ["name", "category", "updatedAt", "createdAt"].includes(field)
            ) {
                orderBy.push({ [field]: order } as any);
                if (field !== "name") orderBy.push({ name: "asc" });
            }
        }

        if (orderBy.length === 0) orderBy = [{ updatedAt: "desc" }];

        const [products, totalCount] = await Promise.all([
            prisma.prebuiltProductRiya.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    images: { orderBy: { position: "asc" }, take: 1 },
                    variants: { orderBy: { createdAt: "asc" }, take: 1 },
                },
            }),
            prisma.prebuiltProductRiya.count({ where }),
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
   Uses multipart/form-data exactly like the printers route.
   - Basic fields as form fields
   - features / attributes / variants as JSON strings
   - Images as "newImages" files + "newImagesMeta" JSON strings
   ============================================================================ */
export async function POST(request: NextRequest) {
    try {
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

        // 2️⃣ Parse JSON arrays
        const features = JSON.parse(
            (formData.get("features") as string) || "[]",
        );
        const attributes = JSON.parse(
            (formData.get("attributes") as string) || "[]",
        );
        const variants = JSON.parse(
            (formData.get("variants") as string) || "[]",
        );

        // 3️⃣ Upload images → Cloudinary
        const newFiles = formData.getAll("newImages") as File[];
        const newMetaStrings = formData.getAll("newImagesMeta") as string[];

        const imageRecords: {
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

            imageRecords.push({
                url: uploadResult.secure_url,
                altText: meta.altText || name.trim(),
                position: meta.position ?? i,
                colorName: meta.colorName || null,
                isMain: meta.isMain ?? i === 0,
            });
        }

        // 4️⃣ Create in DB
        const product = await prisma.prebuiltProductRiya.create({
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
                        isActive: v.isActive ?? true,
                        colorName: v.colorName || null,
                        colorHex: v.colorHex || null,
                        sizeName: v.sizeName || null,
                        sizeCode: v.sizeCode || null,
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
