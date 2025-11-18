import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const validSortFields = ["name", "price", "category"] as const;
type SortField = (typeof validSortFields)[number];

const prebuiltProductSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().int().positive(),
    originalPrice: z.number().int().positive(),
    description: z.string().min(1),
    isCustomizable: z.boolean(),
    sizeData: z
        .array(
            z.object({
                name: z.string(),
                price: z.number(),
                originalPrice: z.number(),
                sizeType: z.enum(["standard", "fractional", "custom"]),
            })
        )
        .default([]),
    category: z.string().min(1).max(255),
    images: z
        .array(
            z
                .string()
                .refine(
                    (val) => val.startsWith("/") || /^https?:\/\//.test(val),
                    {
                        message:
                            "Invalid image URL (must be relative or absolute)",
                    }
                )
        )
        .default([]),
    highlighted: z.boolean().default(false),
});

/* -------------------------------------------------------------------------- */
/*                                   GET API                                  */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // pagination
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // filters
        const category = searchParams.get("category");
        const highlighted = searchParams.get("highlighted");
        const search = searchParams.get("search") || "";
        const searchField = searchParams.get("searchField") || "name";

        // sorting
        const sortBy = searchParams.get("sortBy");
        const order = searchParams.get("order") === "desc" ? "desc" : "asc";

        // -------------------------
        // 🔍 SEARCH LOGIC
        // -------------------------
        let fieldFilter: Prisma.PrebuiltProductWhereInput = {};

        if (search.trim() !== "") {
            if (searchField === "price") {
                const numeric = Number(search);
                if (!isNaN(numeric)) {
                    fieldFilter.price = numeric;
                } else {
                    fieldFilter.price = undefined; // ignore invalid price
                }
            } else {
                fieldFilter[searchField] = {
                    contains: search,
                    mode: "insensitive",
                };
            }
        }

        // -------------------------
        // 🧩 WHERE CONDITIONS
        // -------------------------
        const whereConditions: Prisma.PrebuiltProductWhereInput = {
            AND: [
                category ? { category } : {},
                highlighted === "true" ? { highlighted: true } : {},
                fieldFilter,
            ],
        };

        // -------------------------
        // ↕ FINAL SORTING LOGIC
        // -------------------------
        // -------------------------
        // ↕ FINAL SORTING LOGIC
        // -------------------------
        let orderByClause: any;

        if (sortBy === "price") {
            // PRIMARY → price
            // SECONDARY → name ascending
            orderByClause = [{ price: order }, { name: "asc" }];
        } else if (sortBy === "name") {
            orderByClause = { name: order };
        } else if (sortBy === "category") {
            orderByClause = { category: order };
        } else if (sortBy === "updatedAt") {
            // secondary fallback ensures predictable ordering
            orderByClause = [{ updatedAt: order }, { name: "asc" }];
        } else if (sortBy === "createdAt") {
            orderByClause = [{ createdAt: order }, { name: "asc" }];
        } else {
            // default → sort latest first and fallback by name
            orderByClause = [{ createdAt: "desc" }, { name: "asc" }];
        }

        // -------------------------
        // 📦 FETCH DATA
        // -------------------------
        const [products, totalCount] = await Promise.all([
            prisma.prebuiltProduct.findMany({
                where: whereConditions,
                orderBy: orderByClause,
                skip,
                take: limit,
                include: { sizes: true },
            }),

            prisma.prebuiltProduct.count({ where: whereConditions }),
        ]);

        return NextResponse.json({
            products,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            page,
        });
    } catch (error) {
        console.error("Database query failed:", error);
        return NextResponse.json(
            { error: "Failed to fetch pre-built products" },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------------------------- */
/*                                   POST API                                 */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = prebuiltProductSchema.parse(body);

        const {
            name,
            price,
            originalPrice,
            description,
            isCustomizable,
            sizeData,
            category,
            images,
            highlighted,
        } = validatedData;

        const product = await prisma.prebuiltProduct.create({
            data: {
                name,
                price,
                originalPrice,
                description,
                isCustomizable,
                sizeData,
                category,
                images,
                highlighted,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Failed to create prebuilt product:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    })),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create prebuilt product" },
            { status: 500 }
        );
    }
}
