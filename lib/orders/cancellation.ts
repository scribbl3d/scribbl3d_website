/**
 * Server-side mirror of the customer "Cancel Order" rule shown on
 * app/profile/orders/[orderId]/page.tsx (display status order_confirmed or
 * order_processing). Keep the two in sync.
 */

type ShipmentLike = { isMaster?: boolean | null; status?: string | null };

export function pickDisplayShipment<T extends ShipmentLike>(shipments: T[] | null | undefined): T | null {
    return shipments?.find((s) => s.isMaster) || shipments?.[0] || null;
}

export function canCustomerCancelOrder(orderStatus: string, shipmentStatus?: string | null): boolean {
    if (["payment_pending", "payment_failed", "cancelled"].includes(orderStatus)) return false;
    if (orderStatus === "delivered" && shipmentStatus === "delivered") return false;
    if (shipmentStatus) return shipmentStatus === "manifested";
    return orderStatus === "confirmed" || orderStatus === "shipped";
}
