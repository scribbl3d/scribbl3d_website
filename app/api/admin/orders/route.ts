import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch orders from the database with user information
    const orders = await prisma.order.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Parse JSON fields before returning
    const parsedOrders = orders.map((order) => ({
      ...order,
      items:
        typeof order.items === "string" ? JSON.parse(order.items) : order.items,
      shippingAddress:
        typeof order.shippingAddress === "string"
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress,
      billingAddress:
        typeof order.billingAddress === "string"
          ? JSON.parse(order.billingAddress)
          : order.billingAddress,
      trackingInfo:
        order.trackingInfo && typeof order.trackingInfo === "string"
          ? JSON.parse(order.trackingInfo)
          : order.trackingInfo,
    }));

    return NextResponse.json(parsedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
