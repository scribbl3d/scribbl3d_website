// app/api/internal/cancel-shipment/route.ts
import { NextResponse } from "next/server";

// Retired: cancelling a shipment on its own left paid orders unrefunded.
// POST /api/admin/orders/[orderId]/cancel now cancels the shipment and
// refunds in one step (lib/shipment/cancelShipments.ts).
export async function POST() {
    return NextResponse.json(
        { error: "Use the order cancel endpoint instead" },
        { status: 410 },
    );
}
