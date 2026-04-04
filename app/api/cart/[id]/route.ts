import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* =========================
   ADD TO CART (unchanged)
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
            productId,
            prebuiltProductId,
            prebuiltVariantId,
            printerId,
            resinId,
            resinColourId,
            resinWeightId,
            quantity = 1,
        } = body;

        if (!productId && !prebuiltProductId && !printerId && !resinId) {
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

        let cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.user.id },
            });
        }

        const whereClause: any = { cartId: cart.id };
        if (productId) whereClause.productId = productId;
        if (prebuiltVariantId)
            whereClause.prebuiltVariantId = prebuiltVariantId;
        if (printerId) whereClause.printerId = printerId;
        if (resinId) {
            whereClause.resinId = resinId;
            whereClause.resinColourId = resinColourId;
            whereClause.resinWeightId = resinWeightId;
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
                    productId,
                    prebuiltProductId,
                    prebuiltVariantId,
                    printerId,
                    resinId,
                    resinColourId,
                    resinWeightId,
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
   HELPERS
========================= */
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

function safeNum(val: unknown): number {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

/* =========================
   GET CART
========================= */
export async function GET() {
    const session = (await getServerSession(authOptions as any)) as {
        user?: { id?: string; name?: string; email?: string };
    } | null;
    if (!session?.user?.id) {
        return NextResponse.json({ items: [] });
    }

    try {
        const cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
            include: {
                items: true, // Raw items first — no includes
            },
        });

        if (!cart) return NextResponse.json({ items: [] });

        /* ──────────────────────────────────────────────
           Resolve each item independently with direct
           lookups — never rely on Prisma include for
           live pricing data
        ────────────────────────────────────────────── */
        const items = await Promise.all(
            cart.items.map(async (item) => {
                try {
                    /* ---------- RESIN ---------- */
                    if (item.resinId) {
                        // Always do direct lookups for live data
                        const [resin, resinWeight, resinColour] =
                            await Promise.all([
                                prisma.resin.findUnique({
                                    where: { id: item.resinId },
                                }),
                                item.resinWeightId
                                    ? prisma.resinWeight.findUnique({
                                          where: { id: item.resinWeightId },
                                      })
                                    : null,
                                item.resinColourId
                                    ? prisma.resinColour.findUnique({
                                          where: { id: item.resinColourId },
                                          include: {
                                              images: {
                                                  orderBy: {
                                                      sortOrder: "asc",
                                                  },
                                              },
                                          },
                                      })
                                    : null,
                            ]);

                        // Log for debugging — remove after confirming fix
                        console.log(
                            `[CART DEBUG] Resin item ${item.id}:`,
                            JSON.stringify({
                                resinId: item.resinId,
                                resinWeightId: item.resinWeightId,
                                resinColourId: item.resinColourId,
                                resinFound: !!resin,
                                weightFound: !!resinWeight,
                                weightPrice: resinWeight?.price,
                                colourFound: !!resinColour,
                                colourName: resinColour?.name,
                            }),
                        );

                        if (!resin) {
                            return {
                                id: item.id,
                                itemType: "unknown" as const,
                                name: "Product no longer available",
                                price: 0,
                                quantity: item.quantity,
                                images: [],
                                _orphaned: true,
                            };
                        }

                        // Image chain: colour images → resin card image → empty
                        const colourImages =
                            resinColour?.images?.map((i) => i.url) ?? [];
                        const fallbackImage = (resin as any)?.cardImageUrl;
                        const images =
                            colourImages.length > 0
                                ? colourImages
                                : fallbackImage
                                  ? [fallbackImage]
                                  : [];

                        return {
                            id: item.id,
                            sourceId: resin.id,
                            itemType: "resin" as const,
                            name: resin.name,
                            price: safeNum(resinWeight?.price),
                            quantity: item.quantity,
                            images,
                            size: resinWeight
                                ? `${resinWeight.weightInGrams}g`
                                : null,
                            color: resinColour?.name ?? null,
                            colorHex: resinColour?.hexCode ?? null,
                        };
                    }

                    /* ---------- PRINTER ---------- */
                    if (item.printerId) {
                        const printer = await prisma.printer.findUnique({
                            where: { id: item.printerId },
                            include: {
                                images: { orderBy: { sortOrder: "asc" } },
                                specifications: true,
                            },
                        });

                        if (!printer) {
                            return {
                                id: item.id,
                                itemType: "unknown" as const,
                                name: "Product no longer available",
                                price: 0,
                                quantity: item.quantity,
                                images: [],
                                _orphaned: true,
                            };
                        }

                        const machineDims = extractMachineDimensions(
                            printer.specifications as any[],
                        );

                        return {
                            id: item.id,
                            sourceId: printer.id,
                            itemType: "printer" as const,
                            name: printer.name,
                            price: safeNum(printer.price),
                            quantity: item.quantity,
                            images: printer.images?.map((i) => i.url) ?? [],
                            weight: printer.weight?.toString() ?? null,
                            machineDimensionLength: machineDims.length,
                            machineDimensionWidth: machineDims.width,
                            machineDimensionHeight: machineDims.height,
                        };
                    }

                    /* ---------- PREBUILT ---------- */
                    if (item.prebuiltProductId) {
                        const [prebuiltProduct, prebuiltVariant] =
                            await Promise.all([
                                prisma.prebuiltProducts.findUnique({
                                    where: { id: item.prebuiltProductId },
                                    include: {
                                        images: {
                                            where: { isMain: true },
                                            take: 1,
                                        },
                                    },
                                }),
                                item.prebuiltVariantId
                                    ? prisma.prebuiltVariants.findUnique({
                                          where: {
                                              id: item.prebuiltVariantId,
                                          },
                                      })
                                    : null,
                            ]);

                        if (!prebuiltProduct) {
                            return {
                                id: item.id,
                                itemType: "unknown" as const,
                                name: "Product no longer available",
                                price: 0,
                                quantity: item.quantity,
                                images: [],
                                _orphaned: true,
                            };
                        }

                        return {
                            id: item.id,
                            sourceId: prebuiltProduct.id,
                            itemType: "prebuilt" as const,
                            name: prebuiltProduct.name,
                            price: safeNum(prebuiltVariant?.price),
                            quantity: item.quantity,
                            images:
                                prebuiltProduct.images?.map((i) => i.url) ?? [],
                            color: prebuiltVariant?.colorName ?? null,
                            colorHex: prebuiltVariant?.colorHex ?? null,
                            size: prebuiltVariant?.sizeName ?? null,
                            customization: item.customization ?? null,
                        };
                    }

                    /* ---------- PRODUCT ---------- */
                    if (item.productId) {
                        const product = await prisma.product.findUnique({
                            where: { id: item.productId },
                        });

                        if (!product) {
                            return {
                                id: item.id,
                                itemType: "unknown" as const,
                                name: "Product no longer available",
                                price: 0,
                                quantity: item.quantity,
                                images: [],
                                _orphaned: true,
                            };
                        }

                        return {
                            id: item.id,
                            sourceId: product.id,
                            itemType: "product" as const,
                            name: product.name,
                            price: safeNum(product.price),
                            quantity: item.quantity,
                            images: (product as any).images ?? [],
                        };
                    }

                    /* ---------- FALLBACK ---------- */
                    return {
                        id: item.id,
                        itemType: "unknown" as const,
                        name: "Unknown item",
                        price: 0,
                        quantity: item.quantity,
                        images: [],
                    };
                } catch (itemError) {
                    // If a single item fails, don't crash the whole cart
                    console.error(
                        `[CART] Failed to resolve item ${item.id}:`,
                        itemError,
                    );
                    return {
                        id: item.id,
                        itemType: "unknown" as const,
                        name: "Error loading item",
                        price: 0,
                        quantity: item.quantity,
                        images: [],
                        _error: true,
                    };
                }
            }),
        );

        return NextResponse.json({ items });
    } catch (error) {
        console.error("GET /api/cart error:", error);
        return NextResponse.json({ items: [] });
    }
}

/* =========================
   CLEAR CART
========================= */
async function legacyDeleteAllCart() {
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

/* =========================
   UPDATE CART ITEM
========================= */
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const session = (await getServerSession(authOptions as any)) as {
            user?: { id?: string };
        } | null;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();

        const updateData: { quantity?: number; customization?: string | null } = {};

        if (body.quantity !== undefined) {
            const q = Number(body.quantity);
            if (!Number.isInteger(q) || q < 1) {
                return NextResponse.json(
                    { error: "Quantity must be a positive integer" },
                    { status: 400 },
                );
            }
            updateData.quantity = q;
        }

        if (body.customization !== undefined) {
            updateData.customization =
                typeof body.customization === "string"
                    ? body.customization
                    : null;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid fields to update" },
                { status: 400 },
            );
        }

        const updated = await prisma.cartItem.updateMany({
            where: {
                id,
                cart: {
                    userId: session.user.id,
                },
            },
            data: updateData,
        });

        if (updated.count === 0) {
            return NextResponse.json(
                { error: "Cart item not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/cart/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to update cart item" },
            { status: 500 },
        );
    }
}

/* =========================
   DELETE CART ITEM
========================= */
export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const session = (await getServerSession(authOptions as any)) as {
            user?: { id?: string };
        } | null;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        const deleted = await prisma.cartItem.deleteMany({
            where: {
                id,
                cart: {
                    userId: session.user.id,
                },
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: "Cart item not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/cart/[id] error:", error);
        return NextResponse.json(
            { error: "Failed to delete cart item" },
            { status: 500 },
        );
    }
}
