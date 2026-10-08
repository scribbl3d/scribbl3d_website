/**
 * Delivery timestamp helpers for the review system.
 *
 * Delhivery tracking timestamps have no timezone offset and are in IST,
 * e.g. "2025-05-12T14:33:21.123". They are parsed as +05:30.
 */

const IST_OFFSET = "+05:30";

export function parseDelhiveryDate(value: unknown): Date | null {
    if (typeof value !== "string" || value.trim() === "") return null;

    const trimmed = value.trim();
    const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
    const date = new Date(hasOffset ? trimmed : `${trimmed}${IST_OFFSET}`);

    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Extract the delivered time from a Delhivery tracking response
 * (the JSON stored in `Shipment.rawResponse`).
 *
 * Priority: `DeliveryDate` → status time when status is Delivered →
 * the latest "Delivered" scan.
 */
export function extractDeliveredAt(trackingJson: any): Date | null {
    const shipment = trackingJson?.ShipmentData?.[0]?.Shipment;
    if (!shipment) return null;

    const deliveryDate = parseDelhiveryDate(shipment.DeliveryDate);
    if (deliveryDate) return deliveryDate;

    const status = shipment.Status;
    if (
        typeof status?.Status === "string" &&
        status.Status.toLowerCase() === "delivered"
    ) {
        const statusDate = parseDelhiveryDate(status.StatusDateTime);
        if (statusDate) return statusDate;
    }

    let latestScan: Date | null = null;
    for (const entry of Array.isArray(shipment.Scans) ? shipment.Scans : []) {
        const scan = entry?.ScanDetail;
        if (
            typeof scan?.Scan === "string" &&
            scan.Scan.toLowerCase() === "delivered"
        ) {
            const scanDate = parseDelhiveryDate(scan.ScanDateTime);
            if (scanDate && (!latestScan || scanDate > latestScan)) {
                latestScan = scanDate;
            }
        }
    }

    return latestScan;
}
