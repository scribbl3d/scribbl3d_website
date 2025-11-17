import {
    ASSET_PATHS,
    URL_PATHS,
    ensureAssetDirectory,
} from "@/lib/asset-paths";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Allowed sorting fields
const validSortFields = ["name", "price", "createdAt"] as const;
type SortField = (typeof validSortFields)[number];

const productSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().int().positive(),
    originalPrice: z.number().int().positive(),
    images: z.array(z.string()).default([]),
    color: z.string().min(1).max(50),
    category: z.string().min(1).max(255),
    tileType: z.string().min(1).max(255),
    discount: z.number().int().positive(),
    length: z.number().optional(),
    breadth: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    productDetails: z.array(z.string()).optional(),
    productdesc: z.string().optional(),
});

// ✅ GET — fetch with pagination + sorting + filtering
// ✅ GET — fetch with pagination + sorting + filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const category = searchParams.get("category");
        const color = searchParams.get("color");
        const tileType = searchParams.get("tileType");

        const search = searchParams.get("search") || "";
        const searchField = searchParams.get("searchField") || "name";

        const sortBy = searchParams.get("sortBy");
        const order = searchParams.get("order") === "desc" ? "desc" : "asc";

        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);
        const skip = (page - 1) * limit;

        // SEARCH LOGIC
        let fieldFilter: any = {};
        if (search.trim() !== "") {
            if (searchField === "price") {
                fieldFilter.price = Number(search);
            } else {
                fieldFilter[searchField] = {
                    contains: search,
                    mode: "insensitive",
                };
            }
        }

        // WHERE CLAUSE
        const whereConditions: Prisma.ProductWhereInput = {
            AND: [
                category ? { category } : {},
                color ? { color } : {},
                tileType ? { tileType } : {},
                fieldFilter,
            ],
        };

        // SORTING — FIXED
        let orderByClause: any = undefined;

        if (sortBy === "price") {
            orderByClause = [
                { price: order },
                { name: "asc" }, // stable fallback
            ];
        } else if (sortBy === "name") {
            orderByClause = { name: order };
        } else if (sortBy === "category") {
            orderByClause = { category: order };
        } else if (sortBy === "updatedAt") {
            orderByClause = { updatedAt: order };
        } else if (sortBy === "createdAt") {
            orderByClause = { createdAt: order };
        } else {
            orderByClause = { createdAt: "desc" }; // default
        }

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where: whereConditions,
                orderBy: orderByClause,
                skip,
                take: limit,
                include: {
                    reviews: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                },
            }),
            prisma.product.count({ where: whereConditions }),
        ]);

        return NextResponse.json({
            products,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Database query failed:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

function safeJsonParse<T>(
    input: string | null | undefined,
    context: string
): T | null {
    try {
        if (!input) return null;
        return JSON.parse(input) as T;
    } catch {
        console.error(`Invalid JSON in ${context}`);
        return null;
    }
}

async function streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

// ✅ POST — create new product (files handled)
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("images");
        const productDataStr = formData.get("productData") as string | null;
        const keepImagesStr = formData.get("keepImages") as string | null;

        const keepImages = keepImagesStr
            ? safeJsonParse<string[]>(keepImagesStr, "keepImages")
            : [];

        if (!productDataStr) {
            return NextResponse.json(
                { error: "No product data provided" },
                { status: 400 }
            );
        }

        const productData = safeJsonParse<any>(productDataStr, "productData");
        if (!productData) {
            return NextResponse.json(
                { error: "Invalid product data format" },
                { status: 400 }
            );
        }

        let discount = Math.round(
            (1 - productData.price / productData.originalPrice) * 100
        );
        if (discount < 1) discount = 1;

        const imagePaths = keepImages ? [...keepImages] : [];
        await ensureAssetDirectory(ASSET_PATHS.PRODUCT_IMAGES);

        for (const file of files) {
            if (!(file as any)?.name) continue;
            const buffer = await streamToBuffer((file as any).stream());
            const filename =
                Date.now() + "-" + (file as any).name.replace(/\s/g, "-");

            const filepath = path.join(ASSET_PATHS.PRODUCT_IMAGES, filename);
            await writeFile(filepath, buffer);

            imagePaths.push(URL_PATHS.PRODUCT_IMAGES + "/" + filename);
        }

        const validatedData = productSchema.parse({
            ...productData,
            images: imagePaths,
            discount,
        });

        const savedProduct = await prisma.product.create({
            data: validatedData,
        });

        return NextResponse.json(savedProduct);
    } catch (error) {
        console.error("Failed to create product:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
