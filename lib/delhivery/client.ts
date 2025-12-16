import axios from "axios";
import qs from "qs";
import { mapOrderToDelhiveryShipment } from "./mapOrderToPayload";
const DELHIVERY_URL =
    "https://staging-express.delhivery.com/api/cmu/create.json";

// lib/delhivery/client.ts

export async function createDelhiveryShipmentRaw(order: any) {
    const shipment = mapOrderToDelhiveryShipment(order);

    const payload = {
        end_date: "2025-12-31",
        shipments: [shipment],
        pickup_location: {
            name: "Scribbl SURFACE",
            end_date: "2025-12-31",
        },
    };

    console.log("Delhivery Payload:", JSON.stringify(payload, null, 2));

    const body = qs.stringify({
        format: "json",
        data: JSON.stringify(payload),
    });

    const res = await axios.post(DELHIVERY_URL, body, {
        headers: {
            Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return res.data;
}
