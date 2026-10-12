import { prisma } from "@/lib/prisma";

/**
 * Cart items as the customer sees them (prices, sizes, weights, stock).
 * Shared by GET /api/cart and server-side checkout pricing so both use
 * exactly the same data. A variant that belongs to a different product is
 * treated as orphaned; inactive or out-of-stock rows get inStock: false.
 */

/* =========================
   TYPES
========================= */
export type CartResponseItem = {
    id: string;
    sourceId?: string;
    variantId?: string | null;
    colourId?: string | null;
    itemType: string;
    name: string;
    slug?: string | null;
    price: number;
    quantity: number;
    images: string[];
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    weight?: string | null;
    customization?: string | null;
    machineDimensionLength?: number | null;
    machineDimensionWidth?: number | null;
    machineDimensionHeight?: number | null;
    inStock?: boolean;
    _orphaned?: boolean;
    _error?: boolean;
};

/* =========================
   HELPERS
========================= */
function safeNum(val: unknown): number {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

function extractMachineDimensions(specifications: any[]): {
    length: number | null;
    width: number | null;
    height: number | null;
} {
    for (const spec of specifications || []) {
        const labelLower = (spec.label || "").trim().toLowerCase();
        const value = spec.value || "";
        if (
            labelLower === "machine dimensions" ||
            labelLower.includes("machine dimension") ||
            labelLower === "dimensions" ||
            labelLower === "printer dimensions" ||
            labelLower === "outer dimensions"
        ) {
            const match = value.match(
                /(\d+)\s*(?:mm|cm)?\s*[x×]\s*(\d+)\s*(?:mm|cm)?\s*[x×]\s*(\d+)/i,
            );
            if (match) {
                return {
                    length: parseInt(match[1]),
                    width: parseInt(match[2]),
                    height: parseInt(match[3]),
                };
            }
        }
    }
    return { length: null, width: null, height: null };
}

/* =========================
   LOAD
========================= */
export async function loadCartItems(
    userId: string,
): Promise<CartResponseItem[]> {
    // Single query with includes — Prisma batches this efficiently
    const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
            items: {
                include: {
                    prebuiltProduct: {
                        include: {
                            images: {
                                where: { isMain: true },
                                take: 1,
                            },
                        },
                    },
                    prebuiltVariant: true,
                    printer: {
                        include: {
                            images: { orderBy: { sortOrder: "asc" } },
                            specifications: true,
                        },
                    },
                    resin: true,
                    resinColour: {
                        include: {
                            images: { orderBy: { sortOrder: "asc" } },
                        },
                    },
                    resinWeight: true,
                    filament: true,
                    filamentVariant: true,
                },
            },
        },
    });

    if (!cart) return [];

    // Process items — use included data first, heal orphans only if needed
    // Use a for...of loop instead of Promise.all to avoid connection storms
    const items: CartResponseItem[] = [];

    for (const item of cart.items) {
        try {
            /* ---------- RESIN ---------- */
            if (item.resinId) {
                let resin = item.resin;

                // If resin itself is gone, item is orphaned
                if (!resin) {
                    items.push({
                        id: item.id,
                        itemType: "unknown",
                        name: "Product no longer available",
                        price: 0,
                        quantity: item.quantity,
                        images: [],
                        _orphaned: true,
                    });
                    continue;
                }

                // Fetch fresh variant data to get updated prices
                let resinWeight = item.resinWeight;
                let resinColour = item.resinColour as any;

                if (item.resinWeightId) {
                    const freshWeight = await prisma.resinWeight.findUnique({
                        where: { id: item.resinWeightId },
                    });
                    if (freshWeight) {
                        resinWeight = freshWeight;
                    }
                }

                if (item.resinColourId) {
                    const freshColour = await prisma.resinColour.findUnique({
                        where: { id: item.resinColourId },
                        include: {
                            images: { orderBy: { sortOrder: "asc" } },
                        },
                    });
                    if (freshColour) {
                        resinColour = freshColour as any;
                    }
                }

                // A weight/colour from another resin must never price this one
                const missingVariant =
                    !resinWeight ||
                    !resinColour ||
                    resinWeight.resinId !== resin.id ||
                    resinColour.resinId !== resin.id;
                const resinInStock =
                    resin.inStock !== false &&
                    resinWeight?.inStock !== false &&
                    resinColour?.inStock !== false;

                const colourImages =
                    resinColour?.images?.map((i: any) => i.url) ?? [];
                const fallbackImage = (resin as any)?.cardImageUrl;
                const images =
                    colourImages.length > 0
                        ? colourImages
                        : fallbackImage
                          ? [fallbackImage]
                          : [];

                items.push({
                    id: item.id,
                    sourceId: resin.id,
                    variantId: item.resinWeightId ?? null,
                    colourId: item.resinColourId ?? null,
                    itemType: "resin",
                    name: resin.name,
                    slug: (resin as any).slug ?? null,
                    price: missingVariant ? 0 : safeNum(resinWeight?.price),
                    quantity: item.quantity,
                    images,
                    size: resinWeight ? `${resinWeight.weightInGrams}g` : null,
                    color: resinColour?.name ?? null,
                    colorHex: resinColour?.hexCode ?? null,
                    inStock: !missingVariant && resinInStock,
                    _orphaned: missingVariant,
                });
                continue;
            }

            /* ---------- FILAMENT ---------- */
            if (item.filamentId) {
                const filament = item.filament;

                // If filament itself is gone, item is orphaned
                if (!filament) {
                    items.push({
                        id: item.id,
                        itemType: "unknown",
                        name: "Product no longer available",
                        price: 0,
                        quantity: item.quantity,
                        images: [],
                        _orphaned: true,
                    });
                    continue;
                }

                // Fetch fresh variant data to get updated price
                let filamentVariant = item.filamentVariant;
                if (item.filamentVariantId) {
                    const freshVariant =
                        await prisma.filamentVariant.findUnique({
                            where: { id: item.filamentVariantId },
                        });
                    if (freshVariant) {
                        filamentVariant = freshVariant;
                    }
                }

                const missingVariant =
                    !filamentVariant ||
                    filamentVariant.filamentId !== filament.id;
                const isFilamentOutOfStock = filament.inStock === false;
                const isVariantOutOfStock = filamentVariant
                    ? filamentVariant.inStock === false
                    : false;
                const isOutOfStock =
                    isFilamentOutOfStock ||
                    isVariantOutOfStock ||
                    missingVariant;

                const images =
                    (filament as any)?.images?.length > 0
                        ? (filament as any).images
                        : [];

                items.push({
                    id: item.id,
                    sourceId: filament.id,
                    variantId: item.filamentVariantId ?? null,
                    itemType: "filament",
                    name: filament.name,
                    slug: (filament as any).slug ?? null,
                    price: missingVariant ? 0 : safeNum(filamentVariant?.price),
                    quantity: item.quantity,
                    images,
                    size: filamentVariant
                        ? `${filamentVariant.diameter} - ${filamentVariant.spoolWeight}`
                        : null,
                    color: (filament as any).colorName ?? null,
                    colorHex: (filament as any).hexCode ?? null,
                    inStock: !isOutOfStock,
                    _orphaned: missingVariant,
                });
                continue;
            }

            /* ---------- PRINTER ---------- */
            if (item.printerId) {
                const printer = item.printer;

                if (!printer) {
                    items.push({
                        id: item.id,
                        itemType: "unknown",
                        name: "Product no longer available",
                        price: 0,
                        quantity: item.quantity,
                        images: [],
                        _orphaned: true,
                    });
                    continue;
                }

                const machineDims = extractMachineDimensions(
                    (printer as any).specifications as any[],
                );

                items.push({
                    id: item.id,
                    sourceId: printer.id,
                    itemType: "printer",
                    name: printer.name,
                    slug: (printer as any).slug ?? null,
                    price: safeNum(printer.price),
                    quantity: item.quantity,
                    images:
                        (printer as any).images?.map((i: any) => i.url) ?? [],
                    weight: printer.weight?.toString() ?? null,
                    machineDimensionLength: machineDims.length,
                    machineDimensionWidth: machineDims.width,
                    machineDimensionHeight: machineDims.height,
                    inStock: printer.inStock !== false,
                });
                continue;
            }

            /* ---------- PREBUILT ---------- */
            if (item.prebuiltProductId) {
                const prebuiltProduct = item.prebuiltProduct;
                let prebuiltVariant = item.prebuiltVariant;

                if (!prebuiltProduct) {
                    items.push({
                        id: item.id,
                        itemType: "unknown",
                        name: "Product no longer available",
                        price: 0,
                        quantity: item.quantity,
                        images: [],
                        _orphaned: true,
                    });
                    continue;
                }

                const missingVariant =
                    !prebuiltVariant ||
                    prebuiltVariant.prebuildProductId !== prebuiltProduct.id;
                const prebuiltInStock =
                    prebuiltProduct.inStock !== false &&
                    prebuiltVariant?.isActive !== false &&
                    prebuiltVariant?.inStock !== false;

                items.push({
                    id: item.id,
                    sourceId: prebuiltProduct.id,
                    variantId: item.prebuiltVariantId ?? null,
                    itemType: "prebuilt",
                    name: prebuiltProduct.name,
                    slug: (prebuiltProduct as any).slug ?? null,
                    price: missingVariant ? 0 : safeNum(prebuiltVariant?.price),
                    quantity: item.quantity,
                    images:
                        (prebuiltProduct as any).images?.map(
                            (i: any) => i.url,
                        ) ?? [],
                    color: prebuiltVariant?.colorName ?? null,
                    colorHex: prebuiltVariant?.colorHex ?? null,
                    size: prebuiltVariant?.sizeName ?? null,
                    customization: item.customization ?? null,
                    inStock: !missingVariant && prebuiltInStock,
                    _orphaned: missingVariant,
                });
                continue;
            }

            /* ---------- FALLBACK ---------- */
            items.push({
                id: item.id,
                itemType: "unknown",
                name: "Unknown item",
                price: 0,
                quantity: item.quantity,
                images: [],
            });
        } catch (itemError) {
            console.error(
                `[CART] Failed to resolve item ${item.id}:`,
                itemError,
            );
            items.push({
                id: item.id,
                itemType: "unknown",
                name: "Error loading item",
                price: 0,
                quantity: item.quantity,
                images: [],
                _error: true,
            });
        }
    }

    return items;
}
