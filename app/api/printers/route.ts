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
        const chamberType = searchParams.getAll("chamberType");
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

        if (chamberType.length > 0)
            attributeConditions.push({
                attributes: {
                    some: {
                        attributeKey: "chamberType",
                        attributeValue: { in: chamberType },
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

        /* ===================== AVAILABLE FILTERS ===================== */
        const availableFilters = await getAvailableFilters({
            technology,
            brand,
            volumeCategory,
            materials,
            recyclingRatio,
            chamberType,
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
            filters: availableFilters,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching printers:", error);
        return NextResponse.json(
            { error: "Failed to fetch printers" },
            { status: 500 },
        );
    }
}

/* ===================== PROGRESSIVE FILTER HELPER WITH SKIP LOGIC ===================== */
async function getAvailableFilters(currentFilters: any) {
    const filters: any = {
        technology: [],
        brand: [],
        volumeCategory: [],
        material: [],
        recyclingRatio: [],
        chamberType: [],
        priceRange: { min: 0, max: 0 },
        application: [],
        experience: [],
        connectivity: [],
    };

    try {
        // Helper: Build cumulative where clause for printer-level filters
        const buildPrinterWhere = () => {
            const where: any = {};
            if (currentFilters.technology?.length > 0) {
                where.technology = { in: currentFilters.technology };
            }
            if (currentFilters.brand?.length > 0) {
                where.brand = { in: currentFilters.brand };
            }
            if (currentFilters.volumeCategory?.length > 0) {
                const volumeConditions: any[] = [];
                if (currentFilters.volumeCategory.includes("Small (< 200mm)"))
                    volumeConditions.push({ volumeMax: { lt: 200 } });
                if (
                    currentFilters.volumeCategory.includes("Medium (200-400mm)")
                )
                    volumeConditions.push({
                        volumeMax: { gte: 200, lte: 400 },
                    });
                if (currentFilters.volumeCategory.includes("Large (> 400mm)"))
                    volumeConditions.push({ volumeMax: { gt: 400 } });
                if (volumeConditions.length > 0) {
                    where.OR = volumeConditions;
                }
            }
            return where;
        };

        // Helper: Get matching printer IDs based on current selections
        const getMatchingPrinterIds = async () => {
            const printerWhere = buildPrinterWhere();
            const attributeConditions: any[] = [];

            if (currentFilters.materials?.length > 0) {
                attributeConditions.push({
                    attributes: {
                        some: {
                            attributeKey: "material",
                            attributeValue: { in: currentFilters.materials },
                        },
                    },
                });
            }

            if (currentFilters.chamberType?.length > 0) {
                attributeConditions.push({
                    attributes: {
                        some: {
                            attributeKey: "chamberType",
                            attributeValue: { in: currentFilters.chamberType },
                        },
                    },
                });
            }

            if (currentFilters.connectivities?.length > 0) {
                attributeConditions.push({
                    attributes: {
                        some: {
                            attributeKey: "connectivity",
                            attributeValue: {
                                in: currentFilters.connectivities,
                            },
                        },
                    },
                });
            }

            const finalWhere =
                attributeConditions.length > 0
                    ? { ...printerWhere, AND: attributeConditions }
                    : printerWhere;

            const printers = await prisma.printer.findMany({
                where: finalWhere,
                select: { id: true, price: true, experience: true },
            });

            return printers;
        };

        // Helper: Get attribute values for given printer IDs
        const getAttributeValues = async (
            ids: string[],
            attributeKey: string,
        ) => {
            if (ids.length === 0) return [];

            const attributes = await prisma.printerAttribute.findMany({
                where: {
                    printerId: { in: ids },
                    attributeKey: attributeKey,
                },
                select: { attributeValue: true },
                distinct: ["attributeValue"],
            });
            
            let values = attributes.map((a) => a.attributeValue);
            
            // Safety filter: Exclude temperature values from material filter
            if (attributeKey === "material") {
                values = values.filter(
                    (v) => !v.includes("°C") && !v.includes("°F") && !v.includes("UP TO")
                );
            }
            
            return values;
        };

        // 1. Technology - Always show all available
        const technologies = await prisma.printer.findMany({
            select: { technology: true },
            distinct: ["technology"],
        });
        filters.technology = technologies.map((t) => t.technology);

        // If no technology selected, stop here
        if (!currentFilters.technology?.length) {
            return filters;
        }

        // 2. Brand - Filter by selected technology
        const brands = await prisma.printer.findMany({
            where: { technology: { in: currentFilters.technology } },
            select: { brand: true },
            distinct: ["brand"],
        });
        filters.brand = brands.map((b) => b.brand);

        // 3. Volume Category - Filter by technology + brand (if brand selected or empty)
        const shouldShowVolume =
            currentFilters.brand?.length > 0 || filters.brand.length === 0;
        if (shouldShowVolume) {
            const volumeWhere: any = {
                technology: { in: currentFilters.technology },
            };
            if (currentFilters.brand?.length > 0) {
                volumeWhere.brand = { in: currentFilters.brand };
            }

            const volumes = await prisma.printer.findMany({
                where: volumeWhere,
                select: { volumeMax: true },
            });
            filters.volumeCategory = Array.from(
                new Set(volumes.map((v) => getVolumeCategory(v.volumeMax))),
            );
        }

        // 4. Material - Show when volume selected OR brand selected (if no volumes) OR brand empty
        const brandSelected = currentFilters.brand?.length > 0;
        const volumeSelected = currentFilters.volumeCategory?.length > 0;
        const shouldShowMaterial =
            volumeSelected ||
            (brandSelected && filters.volumeCategory.length === 0) ||
            (filters.brand.length === 0 && filters.volumeCategory.length === 0);

        if (shouldShowMaterial) {
            const printerWhere = buildPrinterWhere();
            const matchingPrinters = await prisma.printer.findMany({
                where:
                    Object.keys(printerWhere).length > 0
                        ? printerWhere
                        : { technology: { in: currentFilters.technology } },
                select: { id: true },
            });
            const ids = matchingPrinters.map((p) => p.id);
            filters.material = await getAttributeValues(ids, "material");
        }

        // 5. Chamber Type - Show when material selected OR skipped to here
        const materialSelected = currentFilters.materials?.length > 0;
        const shouldShowChamber =
            materialSelected ||
            (shouldShowMaterial && filters.material.length === 0);

        if (shouldShowChamber) {
            const printers = await getMatchingPrinterIds();
            const ids = printers.map((p) => p.id);
            filters.chamberType = await getAttributeValues(ids, "chamberType");
        }

        // 6. Connectivity - Show when chamber selected OR skipped
        const chamberSelected = currentFilters.chamberType?.length > 0;
        const shouldShowConnectivity =
            chamberSelected ||
            (shouldShowChamber && filters.chamberType.length === 0);

        if (shouldShowConnectivity) {
            const printers = await getMatchingPrinterIds();
            const ids = printers.map((p) => p.id);
            filters.connectivity = await getAttributeValues(
                ids,
                "connectivity",
            );
        }

        // 7. Final filters - Show when connectivity selected OR skipped
        const connectivitySelected = currentFilters.connectivities?.length > 0;
        const shouldShowFinal =
            connectivitySelected ||
            (shouldShowConnectivity && filters.connectivity.length === 0);

        if (shouldShowFinal) {
            const printers = await getMatchingPrinterIds();
            const ids = printers.map((p) => p.id);

            // Application
            filters.application = await getAttributeValues(ids, "application");

            // Recycling Ratio
            filters.recyclingRatio = await getAttributeValues(
                ids,
                "recyclingRatio",
            );

            // Experience (from printer table)
            filters.experience = Array.from(
                new Set(printers.map((p) => p.experience).filter(Boolean)),
            );

            // Price Range
            const prices = printers.map((p) => p.price);
            if (prices.length > 0) {
                filters.priceRange = {
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                };
            }
        }
    } catch (error) {
        console.error("Error in getAvailableFilters:", error);
        // Return at least technologies even if there's an error
        try {
            const technologies = await prisma.printer.findMany({
                select: { technology: true },
                distinct: ["technology"],
            });
            filters.technology = technologies.map((t) => t.technology);
        } catch (e) {
            console.error("Failed to fetch technologies:", e);
        }
    }

    return filters;
}
