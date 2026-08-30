import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// Force dynamic rendering and no caching for cart data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* =========================
   TYPES
========================= */
type CartResponseItem = {
    id: string;
    sourceId?: string;
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
   ADD TO CART
========================= */
export async function POST(req: Request) {
    try {
        const session = (await getServerSession(authOptions as any)) as {
            user?: { id?: string; name?: string; email?: string };
        } | null;
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const {
            prebuiltProductId,
            prebuiltVariantId,
            printerId,
            resinId,
            resinColourId,
            resinWeightId,
            filamentId,
            filamentVariantId,
            quantity = 1,
        } = body;

        if (!prebuiltProductId && !printerId && !resinId && !filamentId) {
            return NextResponse.json(
                { error: "Invalid cart item" },
                { status: 400 },
            );
        }

        if (prebuiltProductId) {
            if (!prebuiltVariantId) {
                return NextResponse.json(
                    { error: "Prebuilt variant required" },
                    { status: 400 },
                );
            }
            const variant = await prisma.prebuiltVariants.findFirst({
                where: {
                    id: prebuiltVariantId,
                    prebuildProductId: prebuiltProductId,
                    isActive: true,
                },
                select: { id: true },
            });
            if (!variant) {
                return NextResponse.json(
                    { error: "Invalid or inactive prebuilt variant" },
                    { status: 400 },
                );
            }
        }

        if (resinId) {
            if (!resinColourId || !resinWeightId) {
                return NextResponse.json(
                    { error: "Resin colour & weight required" },
                    { status: 400 },
                );
            }
            const weightExists = await prisma.resinWeight.findUnique({
                where: { id: resinWeightId },
                select: { id: true },
            });
            if (!weightExists) {
                return NextResponse.json(
                    { error: "Invalid resin weight" },
                    { status: 400 },
                );
            }
        }

        if (filamentId) {
            if (!filamentVariantId) {
                return NextResponse.json(
                    { error: "Filament variant required" },
                    { status: 400 },
                );
            }
            const variant = await prisma.filamentVariant.findFirst({
                where: {
                    id: filamentVariantId,
                    filamentId: filamentId,
                },
                select: { id: true, inStock: true },
            });
            if (!variant) {
                return NextResponse.json(
                    { error: "Invalid filament variant" },
                    { status: 400 },
                );
            }
            if (!variant.inStock) {
                return NextResponse.json(
                    { error: "Filament variant out of stock" },
                    { status: 400 },
                );
            }
        }

        let cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.user.id },
            });
        }

        const whereClause: any = { cartId: cart.id };
        if (prebuiltVariantId)
            whereClause.prebuiltVariantId = prebuiltVariantId;
        if (printerId) whereClause.printerId = printerId;
        if (resinId) {
            whereClause.resinId = resinId;
            whereClause.resinColourId = resinColourId;
            whereClause.resinWeightId = resinWeightId;
        }
        if (filamentId) {
            whereClause.filamentId = filamentId;
            whereClause.filamentVariantId = filamentVariantId;
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: whereClause,
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    quantity,
                    prebuiltProductId,
                    prebuiltVariantId,
                    printerId,
                    resinId,
                    resinColourId,
                    resinWeightId,
                    filamentId,
                    filamentVariantId,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/cart error:", error);
        return NextResponse.json(
            { error: "Failed to add to cart" },
            { status: 500 },
        );
    }
}

/* =========================
   GET CART
   
   Uses a single Prisma include query (1 connection,
   batched SQL) for the happy path. Only fires extra
   queries for orphaned items.
========================= */
export async function GET() {
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string; name?: string; email?: string };
    } | null;
    if (!session?.user?.id) {
        return NextResponse.json({ items: [] });
    }

    try {
        // Single query with includes — Prisma batches this efficiently
        const cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
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

        if (!cart) return NextResponse.json({ items: [] });

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

                    const missingVariant = !resinWeight || !resinColour;

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
                        itemType: "resin",
                        name: resin.name,
                        slug: (resin as any).slug ?? null,
                        price: missingVariant ? 0 : safeNum(resinWeight?.price),
                        quantity: item.quantity,
                        images,
                        size: resinWeight
                            ? `${resinWeight.weightInGrams}g`
                            : null,
                        color: resinColour?.name ?? null,
                        colorHex: resinColour?.hexCode ?? null,
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
                        const freshVariant = await prisma.filamentVariant.findUnique({
                            where: { id: item.filamentVariantId },
                        });
                        if (freshVariant) {
                            filamentVariant = freshVariant;
                        }
                    }

                    const missingVariant = !filamentVariant;
                    const isFilamentOutOfStock = filament.inStock === false;
                    const isVariantOutOfStock = filamentVariant ? filamentVariant.inStock === false : false;
                    const isOutOfStock = isFilamentOutOfStock || isVariantOutOfStock || missingVariant;
                    
                    const images = (filament as any)?.images?.length > 0 
                        ? (filament as any).images 
                        : [];

                    items.push({
                        id: item.id,
                        sourceId: filament.id,
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
                            (printer as any).images?.map((i: any) => i.url) ??
                            [],
                        weight: printer.weight?.toString() ?? null,
                        machineDimensionLength: machineDims.length,
                        machineDimensionWidth: machineDims.width,
                        machineDimensionHeight: machineDims.height,
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

                    const missingVariant = !prebuiltVariant;

                    items.push({
                        id: item.id,
                        sourceId: prebuiltProduct.id,
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

        const response = NextResponse.json({ items });
        
        // Add no-cache headers to prevent any caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    } catch (error) {
        console.error("GET /api/cart error:", error);
        return NextResponse.json({ items: [] });
    }
}

/* =========================
   CLEAR CART
========================= */
export async function DELETE() {
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string; name?: string; email?: string };
    } | null;
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/cart error:", error);
        return NextResponse.json(
            { error: "Failed to clear cart" },
            { status: 500 },
        );
    }
}
