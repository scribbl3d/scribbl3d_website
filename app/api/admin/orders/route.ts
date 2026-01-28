import { prisma } from "@/lib/prisma";
import { shouldSyncShipment } from "@/lib/shipment/shouldSync";
import { NextResponse } from "next/server";

/**
 * Fire-and-forget background sync
 * NEVER await this
 */
function triggerShipmentSync(orderId: string) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/sync-shipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
    }).catch(() => {});
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { id: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                shipment: {
                    select: {
                        status: true,
                        waybill: true,
                        provider: true,
                        syncing: true,
                        lastSyncedAt: true,
                    },
                },
            },
        });

        /**
         * 🔁 AUTO SYNC (hosting-agnostic)
         * Admin page read heals stale shipment data
         */
        for (const order of orders) {
            if (shouldSyncShipment(order.shipment)) {
                triggerShipmentSync(order.id);
            }
        }

        /**
         * Parse JSON fields
         */
        const parsedOrders = orders.map((order) => ({
            ...order,
            items:
                typeof order.items === "string"
                    ? JSON.parse(order.items)
                    : order.items,
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
            { status: 500 },
        );
    }
}
