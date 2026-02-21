export function triggerShipmentSync(orderId: string) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/sync-shipment`, {
        method: "POST",

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
