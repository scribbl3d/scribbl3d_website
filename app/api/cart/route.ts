import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { loadCartItems } from "@/lib/cart/loadCartItems";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

const MAX_QUANTITY = 99;

// Force dynamic rendering and no caching for cart data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
            quantity: rawQuantity = 1,
        } = body;

        const quantity = Number(rawQuantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
            return NextResponse.json(
                { error: `Quantity must be a whole number from 1 to ${MAX_QUANTITY}` },
                { status: 400 },
            );
        }

        // Exactly one product family per cart line
        const families = [prebuiltProductId, printerId, resinId, filamentId].filter(Boolean);
        if (families.length !== 1) {
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
                select: {
                    id: true,
                    inStock: true,
                    prebuiltProduct: { select: { inStock: true } },
                },
            });
            if (!variant) {
                return NextResponse.json(
                    { error: "Invalid or inactive prebuilt variant" },
                    { status: 400 },
                );
            }
            if (!variant.inStock || !variant.prebuiltProduct.inStock) {
                return NextResponse.json(
                    { error: "This product is out of stock" },
                    { status: 400 },
                );
            }
        }

        if (printerId) {
            const printer = await prisma.printer.findUnique({
                where: { id: printerId },
                select: { inStock: true },
            });
            if (!printer) {
                return NextResponse.json(
                    { error: "Invalid printer" },
                    { status: 400 },
                );
            }
            if (!printer.inStock) {
                return NextResponse.json(
                    { error: "This printer is out of stock" },
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
            // Weight and colour must both belong to this resin
            const [resin, weight, colour] = await Promise.all([
                prisma.resin.findUnique({
                    where: { id: resinId },
                    select: { inStock: true },
                }),
                prisma.resinWeight.findFirst({
                    where: { id: resinWeightId, resinId },
                    select: { inStock: true },
                }),
                prisma.resinColour.findFirst({
                    where: { id: resinColourId, resinId },
                    select: { inStock: true },
                }),
            ]);
            if (!resin || !weight || !colour) {
                return NextResponse.json(
                    { error: "Invalid resin weight or colour" },
                    { status: 400 },
                );
            }
            if (!resin.inStock || !weight.inStock || !colour.inStock) {
                return NextResponse.json(
                    { error: "This resin option is out of stock" },
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
                select: {
                    id: true,
                    inStock: true,
                    filament: { select: { inStock: true } },
                },
            });
            if (!variant) {
                return NextResponse.json(
                    { error: "Invalid filament variant" },
                    { status: 400 },
                );
            }
            if (!variant.inStock || !variant.filament.inStock) {
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
                data: {
                    quantity: Math.min(existingItem.quantity + quantity, MAX_QUANTITY),
                },
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
        const items = await loadCartItems(session.user.id);

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
