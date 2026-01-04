import { prisma } from "@/lib/prisma"; // Ensure you are using the Singleton prisma import
import { NextRequest, NextResponse } from "next/server";

function getVolumeCategory(volumeMax: number): string {
    if (volumeMax < 200) return "Small (< 200mm)";
    if (volumeMax <= 400) return "Medium (200-400mm)";
    return "Large (> 400mm)";
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // 1. EXTRACT PARAMS
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

        // 2. BUILD WHERE CLAUSE (For filtering Printers)
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
            if (volumeConditions.length > 0) where.OR = volumeConditions;
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

        // 3. FETCH PRINTERS
        const printers = await prisma.printer.findMany({
            where,
            include: { attributes: true, images: true },
            orderBy: { name: "asc" },
        });

        // 4. FETCH AVAILABLE FILTERS (The Options List)
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
            filters: availableFilters,
            total: printers.length,
        });
    } catch (error) {
        console.error("Error fetching printers:", error);
        return NextResponse.json(
            { error: "Failed to fetch printers" },
            { status: 500 }
        );
    }
}

// 5. HELPER FUNCTION - ROBUST LOADING
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

    // 1. Technology (Always load)
    const technologies = await prisma.printer.findMany({
        select: { technology: true },
        distinct: ["technology"],
    });
    filters.technology = technologies.map((t) => t.technology);

    // 2. Brand (Depends on Tech)
    if (currentFilters.technology.length > 0) {
        const brands = await prisma.printer.findMany({
            where: { technology: { in: currentFilters.technology } },
            select: { brand: true },
            distinct: ["brand"],
        });
        filters.brand = brands.map((b) => b.brand);
    }

    // 3. Volume (Depends on Brand)
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

    // 4. Material (Depends on Volume)
    if (currentFilters.volumeCategory.length > 0) {
        const where: any = {
            technology: { in: currentFilters.technology },
            brand: { in: currentFilters.brand },
        };

        const volumeConditions: any[] = [];
        if (currentFilters.volumeCategory.includes("Small (< 200mm)"))
            volumeConditions.push({ volumeMax: { lt: 200 } });
        if (currentFilters.volumeCategory.includes("Medium (200-400mm)"))
            volumeConditions.push({ volumeMax: { gte: 200, lte: 400 } });
        if (currentFilters.volumeCategory.includes("Large (> 400mm)"))
            volumeConditions.push({ volumeMax: { gt: 400 } });
        if (volumeConditions.length > 0) where.OR = volumeConditions;

        const materials = await prisma.printerAttribute.findMany({
            where: { attributeKey: "material", printer: where },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.material = materials.map((m) => m.attributeValue);
    }

    // 5. Price Range (Pre-load if Material exists)
    if (currentFilters.materials?.length > 0) {
        const prices = await prisma.printer.findMany({
            where: {
                attributes: {
                    some: {
                        attributeKey: "material",
                        attributeValue: { in: currentFilters.materials },
                    },
                },
            },
            select: { price: true },
        });
        if (prices.length > 0) {
            filters.priceRange = {
                min: Math.min(...prices.map((p) => p.price)),
                max: Math.max(...prices.map((p) => p.price)),
            };
        }
    }

    // 6. Chamber Type (FIXED: Pre-load logic)
    // If Materials OR Volume is selected, we fetch these options.
    // We do NOT wait for Price. This ensures the filter doesn't disappear if price is typed.
    if (
        currentFilters.materials?.length > 0 ||
        currentFilters.volumeCategory?.length > 0
    ) {
        const where: any = { attributeKey: "atmosphereControl" };

        // Refine by material if available, otherwise just broad fetch based on volume/tech context would be safer,
        // but fetching based on Material is the most accurate.
        if (currentFilters.materials?.length > 0) {
            where.printer = {
                attributes: {
                    some: {
                        attributeKey: "material",
                        attributeValue: { in: currentFilters.materials },
                    },
                },
            };
        }

        const res = await prisma.printerAttribute.findMany({
            where,
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.atmosphereControl = res.map((r) => r.attributeValue);
    }

    // 7. Connectivity (FIXED: Pre-load logic)
    // If we have Volume/Materials, we are deep enough to show Connectivity.
    if (
        currentFilters.materials?.length > 0 ||
        currentFilters.volumeCategory?.length > 0
    ) {
        const res = await prisma.printerAttribute.findMany({
            where: { attributeKey: "connectivity" },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.connectivity = res.map((r) => r.attributeValue);
    }

    // 8. Remaining Filters
    if (currentFilters.volumeCategory?.length > 0) {
        const apps = await prisma.printerAttribute.findMany({
            where: { attributeKey: "application" },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.application = apps.map((r) => r.attributeValue);

        const recycling = await prisma.printerAttribute.findMany({
            where: { attributeKey: "recyclingRatio" },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.recyclingRatio = recycling.map((r) => r.attributeValue);

        const exp = await prisma.printer.findMany({
            select: { experience: true },
            distinct: ["experience"],
        });
        filters.experience = exp.map((r) => r.experience);
    }

    return filters;
}
