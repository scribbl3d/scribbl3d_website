export function shouldSyncShipment(shipment: any) {
    if (!shipment?.waybill) return false;
    if (shipment.status === "delivered") return false;
    if (shipment.syncing) return false;

    if (!shipment.lastSyncedAt) return true;

    const age = Date.now() - new Date(shipment.lastSyncedAt).getTime();
    console.log(
        "Shipment getting triggered ------------------------------(ms):",
        age,
    );
    // 30 minutes
    return age > 30 * 1000;
}
