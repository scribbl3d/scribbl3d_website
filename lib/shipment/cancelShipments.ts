import { db } from "@/lib/db";
import axios from "axios";

/**
 * Cancels an order's Delhivery waybills before a refund. A waybill is only
 * marked cancelled in the database once Delhivery confirms it.
 */

const DELHIVERY_BASE_URL = "https://track.delhivery.com";

// Not yet picked up: Delhivery can still cancel these
const PRE_TRANSIT_STATUSES = ["manifested", "created", "pending", "unknown", "not picked"];
// Moving towards the customer: cannot be cancelled, needs an RTO with Delhivery
const IN_TRANSIT_STATUSES = ["in transit", "in_transit", "dispatched", "out for delivery", "out_for_delivery"];

type ShipmentRow = { id: string; waybill: string | null; status: string };

export type CancelShipmentsResult = {
    ok: boolean;
    inTransit: boolean;
    results: { waybill: string; success: boolean; error?: string }[];
};

const normalise = (status: string | null | undefined) => String(status || "").trim().toLowerCase();

export function hasShipmentInTransit(shipments: ShipmentRow[]): boolean {
    return shipments.some((s) => s.waybill && IN_TRANSIT_STATUSES.includes(normalise(s.status)));
}

function isConfirmedCancellation(data: any): boolean {
    return data?.status === true || normalise(data?.status) === "true";
}

export async function cancelOrderShipments(shipments: ShipmentRow[]): Promise<CancelShipmentsResult> {
    if (hasShipmentInTransit(shipments)) {
        return { ok: false, inTransit: true, results: [] };
    }

    const cancellable = shipments.filter((s) => s.waybill && PRE_TRANSIT_STATUSES.includes(normalise(s.status)));
    const results: CancelShipmentsResult["results"] = [];

    for (const shipment of cancellable) {
        const waybill = shipment.waybill!;
        try {
            const response = await axios.post(
                `${DELHIVERY_BASE_URL}/api/p/edit`,
                { waybill, cancellation: "true" },
                {
                    headers: {
                        Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    timeout: 15000,
                },
            );

            if (!isConfirmedCancellation(response.data)) {
                results.push({
                    waybill,
                    success: false,
                    error: String(response.data?.remark || response.data?.error || "Delhivery did not confirm the cancellation"),
                });
                continue;
            }

            await db.shipment.update({
                where: { id: shipment.id },
                data: { status: "cancelled" },
            });
            results.push({ waybill, success: true });
        } catch (err: any) {
            results.push({
                waybill,
                success: false,
                error: err?.response?.data?.remark || err?.message || "Shipment cancellation failed",
            });
        }
    }

    return { ok: results.every((r) => r.success), inTransit: false, results };
}
