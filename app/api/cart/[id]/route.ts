import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// Adding items goes through POST /api/cart (validated); reading through GET /api/cart.

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
            if (!Number.isInteger(q) || q < 1 || q > 99) {
                return NextResponse.json(
                    { error: "Quantity must be a whole number from 1 to 99" },
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
