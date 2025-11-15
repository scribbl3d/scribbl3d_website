import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const prisma = new PrismaClient();

type ProductSelect = {
  id: true;
  name: true;
  price: true;
  images: true;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                  },
                },
                prebuiltProduct: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.wishlist) {
      return NextResponse.json([]);
    }

    return NextResponse.json(user.wishlist.items);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, isPrebuilt } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    let product:
      | Prisma.ProductGetPayload<{ select: ProductSelect }>
      | Prisma.PrebuiltProductGetPayload<{ select: ProductSelect }>
      | null = null;
    if (isPrebuilt) {
      product = await prisma.prebuiltProduct.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      });
    } else {
      product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      });
    }

    if (!product) {
      console.error(
        `Product not found: ${productId} (isPrebuilt: ${isPrebuilt})`
      );
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wishlist: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let wishlist = user.wishlist;
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: user.id },
      });
    }

    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        OR: [
          { productId: isPrebuilt ? undefined : productId },
          { prebuiltProductId: isPrebuilt ? productId : undefined },
        ],
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        ...(isPrebuilt
          ? { prebuiltProductId: productId }
          : { productId: productId }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
        prebuiltProduct: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json(wishlistItem);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add item to wishlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, isPrebuilt } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wishlist: true },
    });

    if (!user?.wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: user.wishlist.id,
        OR: [
          { productId: isPrebuilt ? undefined : productId },
          { prebuiltProductId: isPrebuilt ? productId : undefined },
        ],
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove item from wishlist" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
