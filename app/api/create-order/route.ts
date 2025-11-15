import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Product, PrebuiltProduct } from "@prisma/client";

interface CartItem {
  id: string;
  quantity: number;
  productId?: string;
  prebuiltProductId?: string;
  productSizeId?: string;
  productColorId?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string | null;
}

interface PrebuiltProductWithRelations extends PrebuiltProduct {
  sizes: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    sizeType: string;
    prebuiltProductId: string;
  }>;
  colors: Array<{
    id: string;
    name: string;
    hexCode: string;
    prebuiltProductId: string;
  }>;
}

export async function POST(req: Request) {
  try {
    console.log("[Create Order] Starting order creation");

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("[Create Order] Unauthorized request - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      items,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      transactionId,
    } = await req.json();

    console.log("[Create Order] Processing items:", items);

    // Transform cart items to order items with all necessary details
    const orderItems: OrderItem[] = await Promise.all(
      items.map(async (item: CartItem) => {
        let product: Product | null = null;
        let prebuiltProduct: PrebuiltProductWithRelations | null = null;

        // Check both tables for the item
        if (item.productId) {
          product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
        }

        if (item.prebuiltProductId || (!product && item.productId)) {
          prebuiltProduct = await prisma.prebuiltProduct.findUnique({
            where: { id: item.prebuiltProductId || item.productId },
            include: {
              sizes: true,
              colors: true,
            },
          });
        }

        if (!product && !prebuiltProduct) {
          throw new Error(
            `Product not found: ${item.productId || item.prebuiltProductId}`
          );
        }

        if (prebuiltProduct) {
          let size;
          if (item.productSizeId) {
            const productSize = prebuiltProduct.sizes.find(
              (s) => s.id === item.productSizeId
            );
            size = productSize?.name;
          }

          let color;
          if (item.productColorId) {
            const productColor = prebuiltProduct.colors.find(
              (c) => c.id === item.productColorId
            );
            color = productColor?.name;
          }

          return {
            name: prebuiltProduct.name,
            quantity: item.quantity,
            price: item.productSizeId
              ? prebuiltProduct.sizes.find((s) => s.id === item.productSizeId)
                  ?.price || prebuiltProduct.price
              : prebuiltProduct.price,
            size,
            color,
            image: prebuiltProduct.images?.[0] || null,
          };
        } else if (product) {
          return {
            name: product.name,
            quantity: item.quantity,
            price: product.price,
            color: product.color,
            image: product.images?.[0] || null,
          };
        } else {
          throw new Error("Invalid item: Product data not found");
        }
      })
    );

    console.log("[Create Order] Transformed order items:", orderItems);

    // Create new order with the transformed items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        items: JSON.stringify(orderItems),
        totalAmount,
        shippingAddress,
        billingAddress,
        paymentMethod,
        status: "payment_pending",
        transactionId,
      },
    });

    console.log("[Create Order] Order created successfully:", {
      orderId: order.id,
      status: order.status,
      transactionId: order.transactionId,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("[Create Order] Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: (error as Error).message },
      { status: 500 }
    );
  }
}
