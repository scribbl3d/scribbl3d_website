import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ isInWishlist: false, isAuthenticated: false });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const isPrebuilt = searchParams.get("isPrebuilt") === "true";

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlist: {
          include: {
            items: {
              where: {
                OR: [
                  { productId: isPrebuilt ? undefined : productId },
                  { prebuiltProductId: isPrebuilt ? productId : undefined },
                ],
              },
            },
          },
        },
      },
    });

    const isInWishlist = (user?.wishlist?.items ?? []).length > 0;

    return NextResponse.json({ isInWishlist, isAuthenticated: true });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return NextResponse.json(
      { error: "Failed to check wishlist status", isAuthenticated: true },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
