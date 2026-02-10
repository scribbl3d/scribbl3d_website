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
                shipments: {
                    // ✅ Changed from 'shipment' to 'shipments'
                    select: {
                        status: true,
                        waybill: true,
                        provider: true,
                        syncing: true,
                        lastSyncedAt: true,
                        isMaster: true, // Added for MPS support
                        shipmentType: true, // Added for MPS support
                        masterWaybill: true, // Added for MPS support
                        packageCount: true, // Added for MPS support
                    },
                },
            },
        });

        /**
         * 🔁 AUTO SYNC (hosting-agnostic)
         * Admin page read heals stale shipment data
         */
        for (const order of orders) {
            // Get master shipment for sync check
            const masterShipment =
                order.shipments?.find((s) => s.isMaster) ||
                order.shipments?.[0];
            if (shouldSyncShipment(masterShipment)) {
                triggerShipmentSync(order.id);
            }
        }

        /**
         * Parse JSON fields and normalize shipment data
         */
        const parsedOrders = orders.map((order) => {
            // Get master shipment (for backward compatibility)
            const masterShipment =
                order.shipments?.find((s) => s.isMaster) ||
                order.shipments?.[0] ||
                null;

            return {
                ...order,
                // Keep shipments array for MPS support
                shipments: order.shipments,
                // Add singular 'shipment' for backward compatibility with UI
                shipment: masterShipment,
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
            };
        });

        return NextResponse.json(parsedOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
