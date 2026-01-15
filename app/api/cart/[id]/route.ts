import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    try {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
        });

        if (!cartItem) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, item: cartItem });
    } catch (error) {
        console.error("GET cart item error:", error);
        return NextResponse.json(
            { error: "Failed to fetch cart item" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    try {
        const body = await req.json();
        const { quantity, customization } = body;

        if (quantity === undefined && customization === undefined) {
            return NextResponse.json(
                { error: "No update data provided" },
                { status: 400 }
            );
        }

        const updatedItem = await prisma.cartItem.update({
            where: {
                id,
                cart: { userId: session.user.id },
            },
            data: {
                ...(quantity !== undefined && { quantity }),
                ...(customization !== undefined && { customization }),
            },
        });

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (error) {
        console.error("PUT cart item error:", error);
        return NextResponse.json(
            { error: "Failed to update cart item" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;

    try {
        await prisma.cartItem.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE cart item error:", error);
        return NextResponse.json(
            { error: "Failed to remove cart item" },
            { status: 500 }
        );
    }
}
