import { internalRequestHeaders } from "@/lib/internal-auth";

export function triggerShipmentSync(orderId: string) {
    let headers: Record<string, string>;
    try {
        headers = internalRequestHeaders();
    } catch (err) {
        // Missing INTERNAL_API_SECRET must not break the caller (e.g. the orders list)
        console.error("[SYNC] Not triggered:", err instanceof Error ? err.message : err);
        return;
    }
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/sync-shipment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({ orderId }),
    })
        .then((res) => {
            if (!res.ok) {
                console.error(
                    `[SYNC] Failed to trigger for order ${orderId}`,
                    res.status,
                );
            } else {
                console.log(
                    `[SYNC] Triggered shipment sync for order ${orderId}`,
                );
            }
        })
        .catch((err) => {
            console.error(
                `[SYNC] Network error triggering sync for ${orderId}`,
                err,
            );
        });
}
