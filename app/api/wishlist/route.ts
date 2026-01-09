import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * GET → fetch wishlist items
 * POST → toggle wishlist item
 */
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ items: [] });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            wishlist: {
                include: {
                    items: {
                        include: {
                            product: true,
                            prebuiltProduct: true,
                            printer: {
                                include: {
                                    images: { orderBy: { sortOrder: "asc" } },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return NextResponse.json({
        items: user?.wishlist?.items ?? [],
    });
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, isPrebuilt, printerId } = await request.json();

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { wishlist: true },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlist =
        user.wishlist ??
        (await prisma.wishlist.create({ data: { userId: user.id } }));

    const existingItem = await prisma.wishlistItem.findFirst({
        where: {
            wishlistId: wishlist.id,
            OR: [
                printerId ? { printerId } : undefined,
                !isPrebuilt && productId ? { productId } : undefined,
                isPrebuilt && productId
                    ? { prebuiltProductId: productId }
                    : undefined,
            ].filter(Boolean) as any,
        },
    });

    if (existingItem) {
        await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
        return NextResponse.json({ removed: true });
    }

    await prisma.wishlistItem.create({
        data: {
            wishlistId: wishlist.id,
            ...(printerId
                ? { printerId }
                : isPrebuilt
                  ? { prebuiltProductId: productId }
                  : { productId }),
        },
    });

    return NextResponse.json({ added: true });
}
