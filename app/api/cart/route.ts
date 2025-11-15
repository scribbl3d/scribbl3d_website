import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { productId, quantity, isPrebuilt, productSizeId, productColorId } =
      body;

    console.log("Received request to add product:", {
      productId,
      quantity,
      isPrebuilt,
      productSizeId,
      productColorId,
    });

    if (
      !productId ||
      typeof quantity !== "number" ||
      typeof isPrebuilt !== "boolean"
    ) {
      console.log("Invalid request payload:", {
        productId,
        quantity,
        isPrebuilt,
      });
      return NextResponse.json(
        {
          error:
            "Invalid request: productId, quantity, and isPrebuilt are required",
        },
        { status: 400 }
      );
    }

    // Verify that the product exists
    const product = isPrebuilt
      ? await db.prebuiltProduct.findUnique({ where: { id: productId } })
      : await db.product.findUnique({ where: { id: productId } });

    if (!product) {
      console.log(
        `${isPrebuilt ? "Prebuilt product" : "Product"} not found:`,
        productId
      );
      return NextResponse.json(
        { error: `${isPrebuilt ? "Prebuilt product" : "Product"} not found` },
        { status: 404 }
      );
    }

    console.log(
      `${isPrebuilt ? "Prebuilt product" : "Product"} found:`,
      product
    );

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { cart: true },
    });

    if (!user) {
      console.log("User not found:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let cart = user.cart;

    if (!cart) {
      console.log("Creating new cart for user:", session.user.id);
      cart = await db.cart.create({
        data: { userId: user.id },
      });
    }

    try {
      const existingCartItem = await db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          ...(isPrebuilt
            ? { prebuiltProductId: productId }
            : { productId: productId }),
          productSizeId: productSizeId || null,
          productColorId: productColorId || null,
        },
      });

      if (existingCartItem) {
        console.log("Updating existing cart item:", existingCartItem.id);
        await db.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
      } else {
        console.log("Creating new cart item");
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            ...(isPrebuilt
              ? { prebuiltProductId: productId }
              : { productId: productId }),
            quantity: quantity,
            productSizeId: productSizeId || null,
            productColorId: productColorId || null,
          },
        });
      }

      console.log("Successfully added/updated cart item");
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma error:", error.code, error.message);
        if (error.code === "P2025") {
          return NextResponse.json(
            {
              error: `${
                isPrebuilt ? "Prebuilt product" : "Product"
              } not found or invalid ID`,
            },
            { status: 404 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true,
                prebuiltProduct: true,
                productSize: true,
                productColor: true,
              },
            },
          },
        },
      },
    });

    if (!user?.cart) {
      return NextResponse.json({ cart: [] });
    }

    const cartItems = user.cart.items
      .map((item) => {
        const product = item.product || item.prebuiltProduct;
        if (!product) {
          console.log("Warning: Cart item without associated product:", item);
          return null;
        }

        return {
          id: item.id,
          productId: product.id,
          name: product.name,
          price: item.productSize?.price || product.price,
          quantity: item.quantity,
          images: product.images,
          isPrebuilt: !!item.prebuiltProduct,
          size: item.productSize?.name,
          color: item.productColor?.name,
        };
      })
      .filter(Boolean); // Remove any null items

    return NextResponse.json({ cart: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await db.cart.findFirst({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return NextResponse.json({ success: true });
    }

    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
