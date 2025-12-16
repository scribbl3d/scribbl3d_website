import { Order } from "@prisma/client";
import { createDelhiveryShipmentRaw } from "./client";
export async function createDelhiveryShipment(order: Order) {
    const response = await createDelhiveryShipmentRaw(order);

    const pkg = response?.packages?.[0];

    return {
        ok: Boolean(pkg?.waybill),
        waybill: pkg?.waybill || null,
        serviceable: pkg?.serviceable ?? null,
        raw: response,
    };
}
