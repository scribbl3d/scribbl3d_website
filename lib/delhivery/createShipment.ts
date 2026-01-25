// lib/delhivery/createShipment.ts
import { createDelhiveryShipmentRaw } from "./client";

type CreateShipmentInput = {
    order: any;
    shipping_mode: string;
    dimensions: {
        length: number;
        breadth: number;
        height: number;
    };
    weight: number;
    quantity: number;
};

export async function createDelhiveryShipment(input: CreateShipmentInput) {
    const response = await createDelhiveryShipmentRaw(input);

    const pkg = response?.packages?.[0];

    return {
        ok: Boolean(pkg?.waybill),
        waybill: pkg?.waybill || null,
        serviceable: pkg?.serviceable ?? null,
        raw: response,
    };
}
