// app/api/printers/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Helper to get volume category
function getVolumeCategory(volumeMax: number): string {
    if (volumeMax < 200) return "Small (< 200mm)";
    if (volumeMax <= 400) return "Medium (200-400mm)";
    return "Large (> 400mm)";
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Get filter parameters
        const technology = searchParams.get("technology");
        const brand = searchParams.get("brand");
        const volumeCategory = searchParams.get("volumeCategory");
        const materials = searchParams.getAll("material");
        const recyclingRatio = searchParams.get("recyclingRatio");
        const atmosphereControl = searchParams.get("atmosphereControl");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const applications = searchParams.getAll("application");
        const experience = searchParams.get("experience");
        const connectivities = searchParams.getAll("connectivity");

        // Build where clause
        const where: any = {};

        if (technology) {
            where.technology = technology;
        }

        if (brand) {
            where.brand = brand;
        }

        if (volumeCategory) {
            if (volumeCategory === "Small (< 200mm)") {
                where.volumeMax = { lt: 200 };
            } else if (volumeCategory === "Medium (200-400mm)") {
                where.volumeMax = { gte: 200, lte: 400 };
            } else if (volumeCategory === "Large (> 400mm)") {
                where.volumeMax = { gt: 400 };
            }
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseInt(minPrice);
            if (maxPrice) where.price.lte = parseInt(maxPrice);
        }

        if (experience) {
            where.experience = experience;
        }

        // Handle attribute filters
        type AttributeFilter = {
            attributeKey: string;
            attributeValue: string | number | boolean | { in: string[] };
        };

        const attributeFilters: AttributeFilter[] = [];

        if (materials.length > 0) {
            attributeFilters.push({
                attributeKey: "material",
                attributeValue: { in: materials },
            });
        }

        if (recyclingRatio) {
            attributeFilters.push({
                attributeKey: "recyclingRatio",
                attributeValue: recyclingRatio,
            });
        }

        if (atmosphereControl) {
            attributeFilters.push({
                attributeKey: "atmosphereControl",
                attributeValue: atmosphereControl,
            });
        }

        if (applications.length > 0) {
            attributeFilters.push({
                attributeKey: "application",
                attributeValue: { in: applications },
            });
        }

        if (connectivities.length > 0) {
            attributeFilters.push({
                attributeKey: "connectivity",
                attributeValue: { in: connectivities },
            });
        }

        if (attributeFilters.length > 0) {
            where.attributes = {
                some: {
                    OR: attributeFilters,
                },
            };
        }

        // Fetch printers
        const printers = await prisma.printer.findMany({
            where,
            include: {
                attributes: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        // Get available filter options based on current selections
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
            printers: printers.map((p) => ({
                ...p,
                volumeDisplay: `${p.volumeLength} × ${p.volumeWidth} × ${p.volumeHeight}`,
                volumeCategory: getVolumeCategory(p.volumeMax),
                priceDisplay: `₹${(p.price / 100).toLocaleString("en-IN")}`,
            })),
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

    // Progressive reveal logic
    // Step 1: Always show technologies
    const technologies = await prisma.printer.findMany({
        select: { technology: true },
        distinct: ["technology"],
    });
    filters.technology = technologies.map((t) => t.technology);

    // Step 2: If technology selected, show brands
    if (currentFilters.technology) {
        const brands = await prisma.printer.findMany({
            where: { technology: currentFilters.technology },
            select: { brand: true },
            distinct: ["brand"],
        });
        filters.brand = brands.map((b) => b.brand);
    }

    // Step 3: If brand selected, show volume categories
    if (currentFilters.brand) {
        const where: any = {
            technology: currentFilters.technology,
            brand: currentFilters.brand,
        };
        const volumes = await prisma.printer.findMany({
            where,
            select: { volumeMax: true },
        });

        const categories = new Set(
            volumes.map((v) => getVolumeCategory(v.volumeMax))
        );
        filters.volumeCategory = Array.from(categories);
    }

    // Step 4: If volume selected, show materials
    if (currentFilters.volumeCategory) {
        const where: any = {
            technology: currentFilters.technology,
            brand: currentFilters.brand,
        };

        // Apply volume filter
        if (currentFilters.volumeCategory === "Small (< 200mm)") {
            where.volumeMax = { lt: 200 };
        } else if (currentFilters.volumeCategory === "Medium (200-400mm)") {
            where.volumeMax = { gte: 200, lte: 400 };
        } else if (currentFilters.volumeCategory === "Large (> 400mm)") {
            where.volumeMax = { gt: 400 };
        }

        const materials = await prisma.printerAttribute.findMany({
            where: {
                attributeKey: "material",
                printer: where,
            },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.material = materials.map((m) => m.attributeValue);
    }

    // Step 5: If material selected, show recycling ratio
    if (currentFilters.materials?.length > 0) {
        const recyclingRatios = await prisma.printerAttribute.findMany({
            where: {
                attributeKey: "recyclingRatio",
            },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.recyclingRatio = recyclingRatios.map((r) => r.attributeValue);
    }

    // Step 6: If recycling selected, show atmosphere control
    if (currentFilters.recyclingRatio) {
        const atmosphereControls = await prisma.printerAttribute.findMany({
            where: {
                attributeKey: "atmosphereControl",
            },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.atmosphereControl = atmosphereControls.map(
            (a) => a.attributeValue
        );
    }

    // Step 7: If atmosphere selected, show price range
    if (currentFilters.atmosphereControl) {
        const prices = await prisma.printer.findMany({
            select: { price: true },
        });
        filters.priceRange = {
            min: Math.min(...prices.map((p) => p.price)),
            max: Math.max(...prices.map((p) => p.price)),
        };
    }

    // Step 8: If price selected, show applications
    if (currentFilters.minPrice || currentFilters.maxPrice) {
        const applications = await prisma.printerAttribute.findMany({
            where: {
                attributeKey: "application",
            },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.application = applications.map((a) => a.attributeValue);
    }

    // Step 9: If application selected, show experience
    if (currentFilters.applications?.length > 0) {
        const experiences = await prisma.printer.findMany({
            select: { experience: true },
            distinct: ["experience"],
        });
        filters.experience = experiences.map((e) => e.experience);
    }

    // Step 10: If experience selected, show connectivity
    if (currentFilters.experience) {
        const connectivities = await prisma.printerAttribute.findMany({
            where: {
                attributeKey: "connectivity",
            },
            select: { attributeValue: true },
            distinct: ["attributeValue"],
        });
        filters.connectivity = connectivities.map((c) => c.attributeValue);
    }

    return filters;
}
