import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({
            isInWishlist: false,
            isAuthenticated: false,
        });
    }

    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId");
    const prebuiltProductId = searchParams.get("prebuiltProductId");
    const printerId = searchParams.get("printerId");
    const resinId = searchParams.get("resinId");

    if (!productId && !prebuiltProductId && !printerId && !resinId) {
        return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findFirst({
        where: { userId: session.user.id },
    });

    if (!wishlist) {
        return NextResponse.json({
            isInWishlist: false,
            isAuthenticated: true,
        });
    }

    const item = await prisma.wishlistItem.findFirst({
        where: {
            wishlistId: wishlist.id,
            OR: [
                productId ? { productId } : undefined,
                prebuiltProductId ? { prebuiltProductId } : undefined,
                printerId ? { printerId } : undefined,
                resinId ? { resinId } : undefined,
            ].filter(Boolean) as any[],
        },
    });

    return NextResponse.json({
        isInWishlist: Boolean(item),
        isAuthenticated: true,
        wishlistItemId: item?.id ?? null,
    });
}
