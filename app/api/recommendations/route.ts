import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET  /api/recommendations?limit=6          — generic mix (empty cart)
 * POST /api/recommendations                  — group-based (filled cart)
 *
 * POST body:
 *   groups: Array<{ itemType, limit, technology?, category? }>
 *   excludeIds: string[]
 *
 * Recommendation Logic:
 *   1. Prebuilt  → 2 filaments (PLA), 2 printers (random), 2 resins (random)
 *   2. Filaments → 3 printers (FDM), 3 filaments (random)
 *   3. Resins    → 3 printers (DLP/SLA), 3 resins (random)
 *   4. Printers  → 2 printers (same tech), 2 filaments (random), 2 resins (random)
 */

type RecommendationResult = {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    mrp?: number;
    itemType: string;
    category?: string;
    technology?: string;
};

/* ================================================================
   FETCHERS — one per item type
================================================================ */

async function fetchProducts(
    limit: number,
    excludeIds: string[],
    category?: string,
): Promise<RecommendationResult[]> {
    const products = await prisma.product.findMany({
        where: {
            id: { notIn: excludeIds },
            ...(category ? { category } : {}),
        },
        select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            images: true,
            category: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return products.map((p) => ({
        id: p.id,
        name: p.name,
        images: p.images ?? [],
        price: p.price,
        mrp: p.originalPrice ?? undefined,
        itemType: "product",
        category: p.category ?? undefined,
    }));
}

async function fetchPrinters(
    limit: number,
    excludeIds: string[],
    technology?: string,
    cartPrinterIds?: string[],
): Promise<RecommendationResult[]> {
    let techFilter: any = {};

    if (technology === "SAME" && cartPrinterIds?.length) {
        const cartPrinters = await prisma.printer.findMany({
            where: { id: { in: cartPrinterIds } },
            select: { technology: true },
        });
        const techs = Array.from(
            new Set(cartPrinters.map((p) => p.technology)),
        );
        if (techs.length > 0) {
            techFilter = { technology: { in: techs } };
        }
    } else if (technology && technology !== "SAME") {
        techFilter = { technology };
    }

    let printers = await prisma.printer.findMany({
        where: {
            id: { notIn: excludeIds },
            ...techFilter,
        },
        select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            technology: true,
            images: {
                select: { url: true },
                orderBy: { sortOrder: "asc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    // Fallback: if no printers found with specific tech, fetch any printers
    if (printers.length === 0 && technology) {
        printers = await prisma.printer.findMany({
            where: {
                id: { notIn: excludeIds },
            },
            select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                technology: true,
                images: {
                    select: { url: true },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }

    return printers.map((p) => ({
        id: p.id,
        name: p.name,
        images: p.images.map((i) => i.url),
        price: p.price,
        mrp: p.originalPrice ?? undefined,
        itemType: "printer",
        technology: p.technology,
    }));
}

async function fetchPrebuilts(
    limit: number,
    excludeIds: string[],
): Promise<RecommendationResult[]> {
    const prebuilts = await prisma.prebuiltProduct.findMany({
        where: {
            id: { notIn: excludeIds },
        },
        select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            category: true,
            images: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return prebuilts.map((p) => ({
        id: p.id,
        name: p.name,
        images: p.images ?? [],
        price: p.price,
        mrp: p.originalPrice ?? undefined,
        itemType: "prebuilt",
        category: p.category ?? undefined,
    }));
}

async function fetchResins(
    limit: number,
    excludeIds: string[],
): Promise<RecommendationResult[]> {
    const resins = await prisma.resin.findMany({
        where: {
            id: { notIn: excludeIds },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            cardImageUrl: true,
            resolution: true,
            colours: {
                select: {
                    images: {
                        select: { url: true },
                        orderBy: { sortOrder: "asc" },
                        take: 1,
                    },
                },
                take: 1,
            },
            weights: {
                select: {
                    price: true,
                    originalPrice: true,
                },
                orderBy: { weightInGrams: "asc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return resins
        .filter((r) => r.weights[0])
        .map((r) => {
            const colourImage = r.colours[0]?.images[0]?.url;
            const image = r.cardImageUrl || colourImage;

            // Pick highest resolution
            const maxResolution =
                r.resolution.length > 0
                    ? r.resolution.reduce((max, curr) => {
                          const maxNum = parseFloat(max) || 0;
                          const currNum = parseFloat(curr) || 0;
                          return currNum > maxNum ? curr : max;
                      })
                    : undefined;

            return {
                id: r.id,
                name: r.name,
                images: image ? [image] : [],
                price: r.weights[0].price,
                mrp: r.weights[0].originalPrice ?? undefined,
                itemType: "resin",
                category: maxResolution,
            };
        });
}

/* ================================================================
   GET — Generic recommendations (empty cart / fallback)
================================================================ */

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Number(searchParams.get("limit") ?? 6), 12);

        const perType = Math.max(1, Math.ceil(limit / 4));

        const [products, printers, prebuilts, resins] = await Promise.all([
            fetchProducts(perType, []),
            fetchPrinters(perType, []),
            fetchPrebuilts(perType, []),
            fetchResins(perType, []),
        ]);

        const results = [...products, ...printers, ...prebuilts, ...resins];
        const shuffled = results.sort(() => Math.random() - 0.5);

        return NextResponse.json(shuffled.slice(0, limit));
    } catch (error) {
        console.error("Recommendations GET error:", error);
        return NextResponse.json([], { status: 200 });
    }
}

/* ================================================================
   POST — Group-based recommendations (filled cart)
================================================================ */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            groups,
            excludeIds = [],
        }: {
            groups: Array<{
                itemType: string;
                limit: number;
                technology?: string;
                category?: string;
            }>;
            excludeIds: string[];
        } = body;

        if (!groups || groups.length === 0) {
            return NextResponse.json([]);
        }

        // Find cart printer IDs for "SAME" technology matching
        // We need to resolve printer IDs from excludeIds that are printers
        const cartPrinterIds = excludeIds; // API will check which are actually printers

        const allResults: RecommendationResult[] = [];
        const seenIds = new Set<string>();

        // Process each group sequentially to avoid duplicates
        for (const group of groups) {
            // Combine global excludeIds with already-recommended IDs
            const combinedExcludes = [...excludeIds, ...Array.from(seenIds)];

            let results: RecommendationResult[] = [];

            switch (group.itemType.toLowerCase()) {
                case "product":
                    results = await fetchProducts(
                        group.limit,
                        combinedExcludes,
                        group.category,
                    );
                    break;
                case "printer":
                    results = await fetchPrinters(
                        group.limit,
                        combinedExcludes,
                        group.technology,
                        cartPrinterIds,
                    );
                    break;
                case "prebuilt":
                    results = await fetchPrebuilts(
                        group.limit,
                        combinedExcludes,
                    );
                    break;
                case "resin":
                    results = await fetchResins(group.limit, combinedExcludes);
                    break;
            }

            for (const r of results) {
                if (!seenIds.has(r.id)) {
                    seenIds.add(r.id);
                    allResults.push(r);
                }
            }
        }

        return NextResponse.json(allResults);
    } catch (error) {
        console.error("Recommendations POST error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
