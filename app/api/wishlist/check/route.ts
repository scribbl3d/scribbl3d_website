import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({
            isInWishlist: false,
            isAuthenticated: false,
        });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const printerId = searchParams.get("printerId");
    const isPrebuilt = searchParams.get("isPrebuilt") === "true";

    if (!productId && !printerId) {
        return NextResponse.json(
            { error: "productId or printerId is required" },
            { status: 400 }
        );
    }

    try {
        const wishlist = await prisma.wishlist.findFirst({
            where: {
                user: { email: session.user.email },
            },
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
                    printerId ? { printerId } : undefined,
                    !isPrebuilt && productId ? { productId } : undefined,
                    isPrebuilt && productId
                        ? { prebuiltProductId: productId }
                        : undefined,
                ].filter(Boolean) as any[],
            },
        });

        return NextResponse.json({
            isInWishlist: Boolean(item),
            isAuthenticated: true,
        });
    } catch (error) {
        console.error("GET /api/wishlist/check error:", error);
        return NextResponse.json(
            { error: "Failed to check wishlist status", isAuthenticated: true },
            { status: 500 }
        );
    }
}
