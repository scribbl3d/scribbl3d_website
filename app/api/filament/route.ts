import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Filters
        const material = searchParams.get("material");
        const finishType = searchParams.get("finishType");
        const brand = searchParams.get("brand");
        const diameter = searchParams.get("diameter");
        const spoolWeight = searchParams.get("spoolWeight");
        const search = searchParams.get("search") || "";
        const inStock = searchParams.get("inStock");

        // Sorting
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const order = searchParams.get("order") === "desc" ? "desc" : "asc";

        // Pagination
        const page = Number.parseInt(searchParams.get("page") || "1");
        const limit = Number.parseInt(searchParams.get("limit") || "9");
        const skip = (page - 1) * limit;

        // Build WHERE clause
        const whereConditions: Prisma.FilamentWhereInput = {
            AND: [
                material ? { material } : {},
                finishType ? { finishType } : {},
                brand ? { brand } : {},
                inStock !== null ? { inStock: inStock === "true" } : {},
                search ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { shortDescription: { contains: search, mode: "insensitive" } },
                        { colorName: { contains: search, mode: "insensitive" } },
                    ]
                } : {},
            ],
        };

        // Add variant filters if specified
        if (diameter || spoolWeight) {
            whereConditions.variants = {
                some: {
                    AND: [
                        diameter ? { diameter } : {},
                        spoolWeight ? { spoolWeight } : {},
                    ],
                },
            };
        }

        // Build ORDER BY clause
        let orderByClause: any = [];
        if (sortBy === "price") {
            // Sort by minimum variant price
            orderByClause = { createdAt: order };
        } else if (sortBy === "name") {
            orderByClause = { name: order };
        } else {
            orderByClause = { createdAt: order };
        }

        // Fetch filaments with variants - optimized query
        const filaments = await prisma.filament.findMany({
            where: whereConditions,
            orderBy: orderByClause,
            skip,
            take: limit,
            include: {
                variants: {
                    where: { inStock: true },
                    orderBy: { price: "asc" },
                    take: 5, // Limit variants to reduce data transfer
                },
            },
        });

        // Get total count separately to avoid timeout
        const totalCount = await prisma.filament.count({ where: whereConditions });

        // Transform data for frontend
        const transformedFilaments = filaments.map((filament) => {
            const defaultVariant = filament.variants.find(v => v.isDefault) || filament.variants[0];
            
            return {
                id: filament.id,
                name: filament.name,
                slug: filament.slug,
                shortDescription: filament.shortDescription,
                longDescription: filament.longDescription,
                material: filament.material,
                finishType: filament.finishType,
                brand: filament.brand,
                category: filament.category,
                colorName: filament.colorName,
                hexCode: filament.hexCode,
                images: filament.images,
                features: filament.features,
                applications: filament.applications,
                compatibility: filament.compatibility,
                inStock: filament.inStock,
                createdAt: filament.createdAt,
                updatedAt: filament.updatedAt,
                // Default variant info for listing
                price: defaultVariant?.price || 0,
                originalPrice: defaultVariant?.originalPrice || null,
                diameter: defaultVariant?.diameter || null,
                spoolWeight: defaultVariant?.spoolWeight || null,
                // All variants for selection
                variants: filament.variants,
            };
        });

        return NextResponse.json({
            filaments: transformedFilaments,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        });
    } catch (error) {
        console.error("Error fetching filaments:", error);
        return NextResponse.json(
            { error: "Failed to fetch filaments" },
            { status: 500 }
        );
    }
}
