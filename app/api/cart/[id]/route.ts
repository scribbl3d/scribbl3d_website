import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = (await params).id;

  try {
    const cartItem = await db.cartItem.findUnique({
      where: {
        id: id,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: cartItem });
  } catch (error) {
    console.error("Error fetching cart item:", error);
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
  if (!session || !session.user) {
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

    const updatedItem = await db.cartItem.update({
      where: {
        id: id,
        cart: {
          userId: session.user.id,
        },
      },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(customization !== undefined && { customization }),
      },
    });

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating cart item:", error);
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
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = (await params).id;

  try {
    const deletedItem = await db.cartItem.delete({
      where: {
        id: id,
      },
    });

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
