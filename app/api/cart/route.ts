import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

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
            productId,
            prebuiltProductId,
            printerId,

            resinId,
            resinColourId,
            resinWeightId,

            prebuiltColour,
            prebuiltSize,

            quantity = 1,
        } = body;

        if (!productId && !prebuiltProductId && !printerId && !resinId) {
            return NextResponse.json(
                { error: "Invalid cart item" },
                { status: 400 },
            );
        }
        if (prebuiltProductId) {
            if (!prebuiltColour || !prebuiltSize) {
                return NextResponse.json(
                    { error: "Prebuilt colour & size required" },
                    { status: 400 },
                );
            }
        }

        /* ---------- RESIN VALIDATION ---------- */
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

        /* ---------- GET OR CREATE CART ---------- */
        let cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: session.user.id },
            });
        }

        /* ---------- MERGE LOGIC ---------- */
        const whereClause: any = {
            cartId: cart.id,
        };

        if (productId) whereClause.productId = productId;
        if (prebuiltProductId) {
            whereClause.prebuiltProductId = prebuiltProductId;
            whereClause.prebuiltColour = prebuiltColour;
            whereClause.prebuiltSize = prebuiltSize;
        }

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
                data: {
                    quantity: existingItem.quantity + quantity,
                },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    quantity,

                    productId,
                    prebuiltProductId,
                    printerId,

                    resinId,
                    resinColourId,
                    resinWeightId,

                    prebuiltColour,
                    prebuiltSize,
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
   HELPER: Extract machine dimensions from printer specifications
========================= */
function extractMachineDimensions(specifications: any[]): {
    length: number | null;
    width: number | null;
    height: number | null;
} {
    for (const spec of specifications || []) {
        const label = (spec.label || "").trim();
        const value = spec.value || "";

        const labelLower = label.toLowerCase();
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
                items: {
                    include: {
                        product: true,
                        prebuiltProduct: true,
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
                    },
                },
            },
        });

        if (!cart) {
            return NextResponse.json({ items: [] });
        }

        const items = cart.items.map((item) => {
            /* ---------- RESIN ---------- */
            if (item.resin) {
                return {
                    id: item.id,
                    sourceId: item.resin.id,
                    itemType: "resin",
                    name: item.resin.name,
                    price: item.resinWeight?.price ?? 0,
                    quantity: item.quantity,
                    images: item.resinColour?.images?.map((i) => i.url) ?? [],
                    size: item.resinWeight
                        ? `${item.resinWeight.weightInGrams}g`
                        : null,
                    color: item.resinColour?.name ?? null,
                    colorHex: item.resinColour?.hexCode ?? null,
                };
            }

            /* ---------- PRINTER ---------- */
            if (item.printer) {
                const machineDims = extractMachineDimensions(
                    item.printer.specifications as any[],
                );

                return {
                    id: item.id,
                    sourceId: item.printer.id,
                    itemType: "printer",
                    name: item.printer.name,
                    price: item.printer.price,
                    quantity: item.quantity,
                    images: item.printer.images.map((i) => i.url),
                    weight: item.printer.weight
                        ? item.printer.weight.toString()
                        : null,
                    machineDimensionLength: machineDims.length,
                    machineDimensionWidth: machineDims.width,
                    machineDimensionHeight: machineDims.height,
                };
            }

            /* ---------- PREBUILT ---------- */
            if (item.prebuiltProduct) {
                return {
                    id: item.id,
                    sourceId: item.prebuiltProduct.id,
                    itemType: "prebuilt",
                    name: item.prebuiltProduct.name,
                    price: item.prebuiltProduct.price,
                    quantity: item.quantity,
                    images: item.prebuiltProduct.images ?? [],
                    size: item.prebuiltSize ?? null,
                    color: item.prebuiltColour ?? null,
                };
            }

            /* ---------- PRODUCT ---------- */
            if (item.product) {
                return {
                    id: item.id,
                    sourceId: item.product.id,
                    itemType: "product",
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    images: item.product.images ?? [],
                };
            }

            return {
                id: item.id,
                itemType: "unknown",
                name: "Unknown item",
                price: 0,
                quantity: item.quantity,
                images: [],
            };
        });

        return NextResponse.json({ items });
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
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
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
