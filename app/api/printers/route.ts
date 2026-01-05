import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getVolumeCategory(volumeMax: number): string {
    if (volumeMax < 200) return "Small (< 200mm)";
    if (volumeMax <= 400) return "Medium (200-400mm)";
    return "Large (> 400mm)";
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        /* ===================== PAGINATION ===================== */
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "15");
        const skip = (page - 1) * limit;

        /* ===================== SORT ===================== */
        const sortBy = searchParams.get("sortBy") || "new";

        let orderBy: any;
        switch (sortBy) {
            case "price_asc":
                orderBy = { price: "asc" };
                break;
            case "price_desc":
                orderBy = { price: "desc" };
                break;
            case "discount_asc":
                orderBy = { discount: "asc" };
                break;
            case "discount_desc":
                orderBy = { discount: "desc" };
                break;
            case "new":
            default:
                orderBy = { createdAt: "desc" };
                break;
        }

        /* ===================== FILTER PARAMS ===================== */
        const technology = searchParams.getAll("technology");
        const brand = searchParams.getAll("brand");
        const volumeCategory = searchParams.getAll("volumeCategory");
        const materials = searchParams.getAll("material");
        const recyclingRatio = searchParams.getAll("recyclingRatio");
        const atmosphereControl = searchParams.getAll("atmosphereControl");
        const applications = searchParams.getAll("application");
        const experience = searchParams.getAll("experience");
        const connectivities = searchParams.getAll("connectivity");

        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        /* ===================== WHERE CLAUSE ===================== */
        const where: any = {};

        if (technology.length > 0) where.technology = { in: technology };
        if (brand.length > 0) where.brand = { in: brand };
        if (experience.length > 0) where.experience = { in: experience };

        if (volumeCategory.length > 0) {
            const volumeConditions: any[] = [];

            if (volumeCategory.includes("Small (< 200mm)"))
                volumeConditions.push({ volumeMax: { lt: 200 } });
            if (volumeCategory.includes("Medium (200-400mm)"))
                volumeConditions.push({ volumeMax: { gte: 200, lte: 400 } });
            if (volumeCategory.includes("Large (> 400mm)"))
                volumeConditions.push({ volumeMax: { gt: 400 } });

            if (volumeConditions.length > 0) {
                where.OR = volumeConditions;
            }
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseInt(minPrice);
            if (maxPrice) where.price.lte = parseInt(maxPrice);
        }

        const attributeConditions: any[] = [];

        if (materials.length > 0)
            attributeConditions.push({
                attributes: {
                    some: {
                        attributeKey: "material",
                        attributeValue: { in: materials },
                    },
                },
            });

        if (atmosphereControl.length > 0)
            attributeConditions.push({
                attributes: {
                    some: {
                        attributeKey: "atmosphereControl",
                        attributeValue: { in: atmosphereControl },
                    },
                },
            });

        if (connectivities.length > 0)
            attributeConditions.push({
                attributes: {
                    some: {
                        attributeKey: "connectivity",
                        attributeValue: { in: connectivities },
                    },
                },
            });

        if (recyclingRatio.length > 0)
            attributeConditions.push({
                attributes: {
                    some: {
                        attributeKey: "recyclingRatio",
                        attributeValue: { in: recyclingRatio },
                    },
                },
            });

        if (applications.length > 0)
            attributeConditions.push({
                attributes: {
                    some: {
                        attributeKey: "application",
                        attributeValue: { in: applications },
                    },
                },
            });

        if (attributeConditions.length > 0) {
            where.AND = attributeConditions;
        }

        /* ===================== FETCH PRINTERS ===================== */
        const [printers, total] = await Promise.all([
            prisma.printer.findMany({
                where,
                include: {
                    attributes: true,
                    images: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.printer.count({ where }),
        ]);

        /* ===================== AVAILABLE FILTERS (UNCHANGED) ===================== */
        const availableFilters = await getAvailableFilters({
            technology,
            brand,
            volumeCategory,
            materials,
            recyclingRatio,
            atmosphereControl,
            minPrice,
            maxPrice,
            applications,
            experience,
            connectivities,
        });

        /* ===================== RESPONSE ===================== */
        return NextResponse.json({
            printers: printers.map((p) => {
                const mainImage =
                    p.images.find((img) => img.isMain)?.url ||
                    p.images[0]?.url ||
                    null;

                return {
                    ...p,
                    imageUrl: mainImage,
                    volumeDisplay: `${p.volumeLength} × ${p.volumeWidth} × ${p.volumeHeight}`,
                    volumeCategory: getVolumeCategory(p.volumeMax),
                    priceDisplay: `₹${(p.price / 100).toLocaleString("en-IN")}`,
                };
            }),
            filters: availableFilters, // ✅ RESTORED
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching printers:", error);
        return NextResponse.json(
            { error: "Failed to fetch printers" },
            { status: 500 }
        );
    }
}

/* ===================== FILTER HELPER (UNCHANGED) ===================== */
async function getAvailableFilters(currentFilters: any) {
    const filters: any = {
        technology: [],
        brand: [],
        volumeCategory: [],
        material: [],
        recyclingRatio: [],
        atmosphereControl: [],
        priceRange: { min: 0, max: 0 },
        application: [],
        experience: [],
        connectivity: [],
    };

    const technologies = await prisma.printer.findMany({
        select: { technology: true },
        distinct: ["technology"],
    });
    filters.technology = technologies.map((t) => t.technology);

    if (currentFilters.technology.length > 0) {
        const brands = await prisma.printer.findMany({
            where: { technology: { in: currentFilters.technology } },
            select: { brand: true },
            distinct: ["brand"],
        });
        filters.brand = brands.map((b) => b.brand);
    }

    if (currentFilters.brand.length > 0) {
        const volumes = await prisma.printer.findMany({
            where: {
                technology: { in: currentFilters.technology },
                brand: { in: currentFilters.brand },
            },
            select: { volumeMax: true },
        });
        filters.volumeCategory = Array.from(
            new Set(volumes.map((v) => getVolumeCategory(v.volumeMax)))
        );
    }

    if (currentFilters.volumeCategory.length > 0) {
        const materials = await prisma.printerAttribute.findMany({
            where: { attributeKey: "material" },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.material = materials.map((m) => m.attributeValue);
    }

    return filters;
}
