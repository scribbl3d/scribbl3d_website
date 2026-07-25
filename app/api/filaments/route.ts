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
        const printerCompatibility = searchParams.get("printerCompatibility");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
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
        const materialArray = material ? material.split(",").map(m => m.trim()).filter(Boolean) : [];
        const finishTypeArray = finishType ? finishType.split(",").map(f => f.trim()).filter(Boolean) : [];
        const brandArray = brand ? brand.split(",").map(b => b.trim()).filter(Boolean) : [];
        const diameterArray = diameter ? diameter.split(",").map(d => d.trim()).filter(Boolean) : [];
        const spoolWeightArray = spoolWeight ? spoolWeight.split(",").map(s => s.trim()).filter(Boolean) : [];
        const printerCompatibilityArray = printerCompatibility ? printerCompatibility.split(",").map(p => p.trim()).filter(Boolean) : [];
        
        const whereConditions: Prisma.FilamentWhereInput = {
            AND: [
                materialArray.length > 0 ? {
                    OR: materialArray.map(m => ({ material: m }))
                } : {},
                finishTypeArray.length > 0 ? {
                    OR: finishTypeArray.map(f => ({ finishType: f }))
                } : {},
                brandArray.length > 0 ? {
                    OR: brandArray.map(b => ({ brand: b }))
                } : {},
                printerCompatibilityArray.length > 0 ? {
                    OR: printerCompatibilityArray.map(p => ({
                        compatibility: {
                            hasSome: [p]
                        }
                    }))
                } : {},
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
        if (diameterArray.length > 0 || spoolWeightArray.length > 0) {
            const variantConditions: any[] = [];
            
            if (diameterArray.length > 0) {
                variantConditions.push({
                    OR: diameterArray.map(d => ({ diameter: d }))
                });
            }
            
            if (spoolWeightArray.length > 0) {
                variantConditions.push({
                    OR: spoolWeightArray.map(s => ({ spoolWeight: s }))
                });
            }
            
            // Add price range filter on variants if specified
            if (minPrice || maxPrice) {
                const priceCondition: any = {};
                if (minPrice) priceCondition.gte = Number.parseInt(minPrice);
                if (maxPrice) priceCondition.lte = Number.parseInt(maxPrice);
                variantConditions.push({ price: priceCondition });
            }
            
            whereConditions.variants = {
                some: variantConditions.length > 0 ? { AND: variantConditions } : {}
            };
        } else if (minPrice || maxPrice) {
            // Price filter without diameter/spool weight filters
            const priceCondition: any = {};
            if (minPrice) priceCondition.gte = Number.parseInt(minPrice);
            if (maxPrice) priceCondition.lte = Number.parseInt(maxPrice);
            whereConditions.variants = {
                some: { price: priceCondition }
            };
        }

        // Build ORDER BY clause for non-price sorting
        let orderByClause: any = {};
        if (sortBy === "updatedAt") {
            orderByClause = { updatedAt: order };
        } else if (sortBy === "name") {
            orderByClause = { name: order };
        } else if (sortBy !== "price") {
            orderByClause = { createdAt: order };
        }

        // Get total count
        const totalCount = await prisma.filament.count({ where: whereConditions });

        // For price sorting, we need to fetch ALL matching filaments, transform, sort, then paginate
        // For other sorting, we can paginate at DB level for better performance
        let filaments;
        
        if (sortBy === "price") {
            // Fetch ALL matching filaments (without pagination)
            filaments = await prisma.filament.findMany({
                where: whereConditions,
                include: {
                    variants: {
                        orderBy: { price: "asc" },
                        take: 10,
                    },
                },
            });
        } else {
            // Fetch with pagination for non-price sorting
            filaments = await prisma.filament.findMany({
                where: whereConditions,
                orderBy: orderByClause,
                skip,
                take: limit,
                include: {
                    variants: {
                        orderBy: { price: "asc" },
                        take: 10,
                    },
                },
            });
        }

        // Transform data for frontend
        const transformedFilaments = filaments.map((filament) => {
            const defaultVariant = filament.variants.find(v => v.isDefault) || filament.variants[0];
            const price = defaultVariant?.price || 0;
            const originalPrice = defaultVariant?.originalPrice || null;
            const discount = originalPrice && originalPrice > price 
                ? Math.round(((originalPrice - price) / originalPrice) * 100) 
                : 0;
            
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
                price,
                originalPrice,
                discount,
                diameter: defaultVariant?.diameter || null,
                spoolWeight: defaultVariant?.spoolWeight || null,
                // All variants for selection
                variants: filament.variants,
            };
        });

        // Sort by price if requested, then paginate in memory
        let finalFilaments = transformedFilaments;
        if (sortBy === "price") {
            // Sort all results by price
            finalFilaments.sort((a, b) => {
                const priceA = a.price || 0;
                const priceB = b.price || 0;
                return order === "asc" ? priceA - priceB : priceB - priceA;
            });
            
            // Apply pagination in memory
            finalFilaments = finalFilaments.slice(skip, skip + limit);
        }

        return NextResponse.json({
            filaments: finalFilaments,
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
