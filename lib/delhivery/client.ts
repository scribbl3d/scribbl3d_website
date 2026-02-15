// lib/delhivery/client.ts
import axios from "axios";
import qs from "qs";
import {
    mapOrderToDelhiveryShipment,
    mapOrderToMPSShipments,
} from "./mapOrderToPayload";

const DELHIVERY_BASE_URL = "https://track.delhivery.com";

const DELHIVERY_CREATE_URL = `${DELHIVERY_BASE_URL}/api/cmu/create.json`;
const DELHIVERY_WAYBILL_URL = `${DELHIVERY_BASE_URL}/waybill/api/bulk/json/`;

const WAREHOUSE_NAME = "Scribbl SURFACE";

/**
 * Prefetch waybills from Delhivery
 * Required for MPS (Multi-Package Shipment) as waybills must be pre-assigned
 */
export async function prefetchWaybills(count: number): Promise<{
    ok: boolean;
    waybills: string[];
    raw: any;
}> {
    try {
        const res = await axios.get(DELHIVERY_WAYBILL_URL, {
            params: {
                cl: WAREHOUSE_NAME,
                count: count,
            },
            headers: {
                Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                Accept: "application/json",
            },
        });

        // Delhivery returns waybills in format: "waybill1,waybill2,waybill3"
        // or as an array depending on the response format
        let waybills: string[] = [];

        if (typeof res.data === "string") {
            waybills = res.data.split(",").map((w: string) => w.trim());
        } else if (Array.isArray(res.data)) {
            waybills = res.data;
        } else if (res.data?.waybill) {
            waybills = Array.isArray(res.data.waybill)
                ? res.data.waybill
                : [res.data.waybill];
        }

        console.log(
            `[Delhivery] Prefetched ${waybills.length} waybills:`,
            waybills,
        );

        return {
            ok: waybills.length >= count,
            waybills,
            raw: res.data,
        };
    } catch (error: any) {
        console.error("[Delhivery] Waybill prefetch failed:", error.message);
        return {
            ok: false,
            waybills: [],
            raw: error.response?.data || error.message,
        };
    }
}

/**
 * Create a Single Package Shipment (SPS)
 */
export async function createDelhiveryShipmentRaw(input: any) {
    const shipment = mapOrderToDelhiveryShipment(input);

    const payload = {
        shipments: [shipment],
        pickup_location: {
            name: WAREHOUSE_NAME,
        },
    };

    console.log("[Delhivery SPS] Payload:", JSON.stringify(payload, null, 2));

    const body = qs.stringify({
        format: "json",
        data: JSON.stringify(payload),
    });

    const res = await axios.post(DELHIVERY_CREATE_URL, body, {
        headers: {
            Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return res.data;
}

/**
 * Create a Multi-Package Shipment (MPS)
 *
 * Key differences from SPS:
 * - Multiple shipment objects in the shipments array
 * - Each shipment has shipment_type: "MPS"
 * - All shipments share the same master_id (master waybill)
 * - mps_children contains total package count
 * - Each package has its own pre-assigned waybill
 */
export async function createDelhiveryMPSShipmentRaw(input: {
    order: any;
    shipping_mode: string;
    packages: Array<{
        dimensions: {
            length: number;
            breadth: number;
            height: number;
        };
        weight: number;
        quantity: number;
        products_desc?: string;
    }>;
    masterWaybill: string;
    waybills: string[];
}) {
    const shipments = mapOrderToMPSShipments(input);

    const payload = {
        shipments,
        pickup_location: {
            name: WAREHOUSE_NAME,
        },
    };

    console.log("[Delhivery MPS] Payload:", JSON.stringify(payload, null, 2));

    const body = qs.stringify({
        format: "json",
        data: JSON.stringify(payload),
    });

    const res = await axios.post(DELHIVERY_CREATE_URL, body, {
        headers: {
            Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    console.log("[Delhivery MPS] Response:", JSON.stringify(res.data, null, 2));

    return res.data;
}
