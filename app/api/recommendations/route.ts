import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/recommendations
 *
 * Query params:
 *   itemType   — one or more types to recommend (product, printer, prebuilt, resin)
 *   technology — optional filter for printer technology (FDM, FFF, SLA, DLP)
 *   exclude    — one or more cart item IDs to exclude
 *   limit      — max results (default 6, max 12)
 *
 * Returns a unified array of product suggestions:
 *   { id, name, images, price, mrp, itemType, category, technology, buildVolume }
 */

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const itemTypes = searchParams.getAll("itemType");
        const technologies = searchParams.getAll("technology");
        const excludeIds = searchParams.getAll("exclude");
        const limit = Math.min(Number(searchParams.get("limit") ?? 6), 12);

        // If no item types specified, return a mix of everything
        const types =
            itemTypes.length > 0
                ? itemTypes.map((t) => t.toLowerCase())
                : ["product", "printer", "prebuilt", "resin"];

        // Distribute limit across types roughly evenly
        const perType = Math.max(2, Math.ceil(limit / types.length));

        const results: Array<{
            id: string;
            name: string;
            images: string[];
            price: number;
            mrp?: number;
            itemType: string;
            category?: string;
            technology?: string;
            buildVolume?: string;
        }> = [];

        /* ========================
           PRODUCT (Filaments etc.)
           Schema: images String[], category, price Int, originalPrice Int
        ======================== */
        if (types.includes("product")) {
            const products = await prisma.product.findMany({
                where: {
                    id: { notIn: excludeIds },
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
                take: perType,
            });

            for (const p of products) {
                results.push({
                    id: p.id,
                    name: p.name,
                    images: p.images ?? [],
                    price: p.price,
                    mrp: p.originalPrice ?? undefined,
                    itemType: "product",
                    category: p.category ?? undefined,
                });
            }
        }

        /* ========================
           PRINTER
           Schema: images PrinterImage[], technology, brand, price Int, originalPrice Int?
                   volumeLength/Width/Height Int
        ======================== */
        if (types.includes("printer")) {
            const technologyFilter =
                technologies.length > 0
                    ? {
                          technology: {
                              in: technologies.map((t) => t.toUpperCase()),
                          },
                      }
                    : {};

            const printers = await prisma.printer.findMany({
                where: {
                    id: { notIn: excludeIds },
                    ...technologyFilter,
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    originalPrice: true,
                    technology: true,
                    volumeLength: true,
                    volumeWidth: true,
                    volumeHeight: true,
                    images: {
                        select: { url: true },
                        orderBy: { sortOrder: "asc" },
                        take: 1,
                    },
                },
                orderBy: { createdAt: "desc" },
                take: perType,
            });

            for (const p of printers) {
                results.push({
                    id: p.id,
                    name: p.name,
                    images: p.images.map((i) => i.url),
                    price: p.price,
                    mrp: p.originalPrice ?? undefined,
                    itemType: "printer",
                    technology: p.technology,
                    buildVolume: `${p.volumeLength}×${p.volumeWidth}×${p.volumeHeight}mm`,
                });
            }
        }

        /* ========================
           PREBUILT PRODUCT
           Schema: images String[], category, price Int, originalPrice Int
        ======================== */
        if (types.includes("prebuilt")) {
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
                take: perType,
            });

            for (const p of prebuilts) {
                results.push({
                    id: p.id,
                    name: p.name,
                    images: p.images ?? [],
                    price: p.price,
                    mrp: p.originalPrice ?? undefined,
                    itemType: "prebuilt",
                    category: p.category ?? undefined,
                });
            }
        }

        /* ========================
           RESIN
           Schema: images via ResinColour → ResinImage (url), also cardImageUrl
                   weights via ResinWeight (price, originalPrice)
        ======================== */
        if (types.includes("resin")) {
            const resins = await prisma.resin.findMany({
                where: {
                    id: { notIn: excludeIds },
                },
                select: {
                    id: true,
                    name: true,
                    resolution: true,
                    cardImageUrl: true,
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
                take: perType,
            });

            for (const r of resins) {
                const firstWeight = r.weights[0];
                if (!firstWeight) continue;

                // Use cardImageUrl first, then fall back to first colour image
                const colourImage = r.colours[0]?.images[0]?.url;
                const image = r.cardImageUrl || colourImage;

                // Pick highest resolution: e.g. ["4K", "8K", "32K"] → "32K"
                const maxResolution =
                    r.resolution.length > 0
                        ? r.resolution.reduce((max, curr) => {
                              const maxNum = parseFloat(max) || 0;
                              const currNum = parseFloat(curr) || 0;
                              return currNum > maxNum ? curr : max;
                          })
                        : undefined;

                results.push({
                    id: r.id,
                    name: r.name,
                    images: image ? [image] : [],
                    price: firstWeight.price,
                    mrp: firstWeight.originalPrice ?? undefined,
                    itemType: "resin",
                    category: maxResolution,
                });
            }
        }

        /* ========================
           SHUFFLE & LIMIT
        ======================== */
        const shuffled = results.sort(() => Math.random() - 0.5);

        return NextResponse.json(shuffled.slice(0, limit));
    } catch (error) {
        console.error("Recommendations API error:", error);
        return NextResponse.json([], { status: 200 });
    }
}
