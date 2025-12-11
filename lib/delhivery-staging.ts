// lib/delhivery-staging.ts
import { prisma } from "@/lib/prisma";
import axios from "axios";

const DELHIVERY_API_URL = process.env.DELHIVERY_API_URL!;
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN!;
const PICKUP_LOCATION_NAME =
    process.env.DELHIVERY_WAREHOUSE_NAME || "Scribble 3d";
const MOCK_MODE =
    String(process.env.DELHIVERY_MOCK_MODE || "").toLowerCase() === "true";

function asString(x: any) {
    if (x == null) return "";
    return typeof x === "string" ? x : String(x);
}

/** Return shape for createDelhiveryStagingShipment */
export type DelhiveryResult = {
    ok: boolean;
    delhiveryResp?: any;
    saved?: {
        id: string;
        orderId: string;
        provider: string;
        waybill: string;
        status: string;
        trackingUrl?: string | null;
        rawResponse?: any;
        createdAt?: Date;
        updatedAt?: Date;
    };
    error?: any;
};

export async function createDelhiveryStagingShipment(
    order: any
): Promise<DelhiveryResult> {
    const shipTo = order.shippingAddress || {};
    const customerName = asString(
        shipTo.fullName || order.user?.name || "Customer"
    );
    const phone = Array.isArray(shipTo.phone)
        ? shipTo.phone[0]
        : asString(shipTo.phone || "");
    const add =
        asString(shipTo.street || "") +
        (shipTo.landmark ? `, ${shipTo.landmark}` : "");
    const city = asString(shipTo.city || "");
    const state = asString(shipTo.state || "");
    const pin = asString(shipTo.pincode || shipTo.pin || "");
    const totalAmount = Number(order.totalAmount || 0);

    const DEFAULT_LENGTH = Number(process.env.DELHIVERY_DEFAULT_LENGTH || 10);
    const DEFAULT_WIDTH = Number(process.env.DELHIVERY_DEFAULT_WIDTH || 10);
    const DEFAULT_HEIGHT = Number(process.env.DELHIVERY_DEFAULT_HEIGHT || 10);
    const DEFAULT_WEIGHT = Number(
        process.env.DELHIVERY_DEFAULT_WEIGHT_GRAMS || 500
    );

    const shipmentPayload = {
        name: customerName,
        add: add || "Address not provided",
        pin: pin || "",
        city,
        state,
        country: "India",
        phone: phone || "",
        order: String(order.id),
        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
        return_pin: "",
        return_city: "",
        return_phone: "",
        return_add: "",
        return_state: "",
        return_country: "",
        products_desc:
            (order.items && JSON.stringify(order.items)) || "Products",
        hsn_code: "",
        cod_amount: order.paymentMethod === "COD" ? Number(totalAmount) : 0,
        order_date: new Date().toISOString(),
        total_amount: totalAmount,
        seller_add: process.env.DELHIVERY_SELLER_ADDRESS || "",
        seller_name: process.env.DELHIVERY_WAREHOUSE_NAME || "",
        seller_inv: "",
        quantity: 1,
        waybill: "",
        shipment_width: String(DEFAULT_WIDTH),
        shipment_height: String(DEFAULT_HEIGHT),
        shipment_length: String(DEFAULT_LENGTH),
        weight: String(DEFAULT_WEIGHT),
        shipping_mode: "Surface",
        address_type: "Home",
    };

    const payload = {
        shipments: [shipmentPayload],
        pickup_location: { name: PICKUP_LOCATION_NAME },
    };

    try {
        // ---- MOCK MODE (local dev) ----
        if (MOCK_MODE) {
            const mockWaybill = `DLH_TEST_${Date.now()}`;
            const mockResp = {
                success: true,
                packages: [{ waybill: mockWaybill }],
                response: { waybills: [mockWaybill] },
                mock: true,
            };

            console.log(
                "[Delhivery staging][MOCK] generated mock response:",
                mockWaybill
            );

            // upsert/create shipment in DB and mark created
            const existing = await prisma.shipment.findUnique({
                where: { orderId: String(order.id) },
            });
            const trackingUrl = `${process.env.DELHIVERY_WAYBILL_URL || "https://track.delhivery.com/waybill/api/fetch/json/"}?waybill=${mockWaybill}`;

            const saved = existing
                ? await prisma.shipment.update({
                      where: { id: existing.id },
                      data: {
                          provider: "DELHIVERY_TEST",
                          waybill: mockWaybill,
                          status: "created",
                          trackingUrl,
                          rawResponse: mockResp,
                      },
                  })
                : await prisma.shipment.create({
                      data: {
                          orderId: String(order.id),
                          provider: "DELHIVERY_TEST",
                          waybill: mockWaybill,
                          status: "created",
                          trackingUrl,
                          rawResponse: mockResp,
                      },
                  });

            // Update order -> shipped
            const updatedOrder = await prisma.order.update({
                where: { id: String(order.id) },
                data: {
                    status: "shipped",
                    trackingInfo: {
                        provider: saved.provider,
                        waybill: saved.waybill,
                        status: "created",
                        trackingUrl: saved.trackingUrl,
                        raw: saved.rawResponse,
                    },
                },
            });

            console.log(
                `[Delhivery staging][MOCK] Shipment saved (order=${order.id}) id=${saved.id} waybill=${mockWaybill}, order marked shipped`
            );
            return { ok: true, delhiveryResp: mockResp, saved };
        }

        // ---- REAL STAGING CALL ----
        const dataString =
            "format=json&data=" + encodeURIComponent(JSON.stringify(payload));
        const headers = {
            Authorization: `Token ${DELHIVERY_API_TOKEN}`,
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        };

        console.log(
            "[Delhivery staging] sending payload:",
            JSON.stringify(payload)
        );
        const res = await axios.post(DELHIVERY_API_URL, dataString, {
            headers,
            timeout: 20000,
        });
        const delhiveryResp = res.data;
        console.log(
            "[Delhivery staging] response:",
            JSON.stringify(delhiveryResp).slice(0, 2000)
        );

        // extract waybill robustly
        let waybill: string | null = null;
        if (
            delhiveryResp?.response?.waybills &&
            Array.isArray(delhiveryResp.response.waybills) &&
            delhiveryResp.response.waybills.length > 0
        ) {
            waybill = delhiveryResp.response.waybills[0];
        } else if (delhiveryResp?.waybill) {
            waybill = delhiveryResp.waybill;
        } else if (delhiveryResp?.shipment_waybill) {
            waybill = delhiveryResp.shipment_waybill;
        } else if (
            delhiveryResp?.packages &&
            Array.isArray(delhiveryResp.packages) &&
            delhiveryResp.packages[0]?.waybill
        ) {
            waybill = delhiveryResp.packages[0].waybill;
        }

        const existing = await prisma.shipment.findUnique({
            where: { orderId: String(order.id) },
        });
        const trackingUrl = waybill
            ? `${process.env.DELHIVERY_WAYBILL_URL}?waybill=${waybill}`
            : null;

        const savedStatus = waybill
            ? "created"
            : delhiveryResp?.success
              ? "created"
              : "error";

        const saved = existing
            ? await prisma.shipment.update({
                  where: { id: existing.id },
                  data: {
                      provider: "DELHIVERY_STAGING",
                      waybill: waybill || existing.waybill || "",
                      status: savedStatus,
                      trackingUrl,
                      rawResponse: delhiveryResp,
                  },
              })
            : await prisma.shipment.create({
                  data: {
                      orderId: String(order.id),
                      provider: "DELHIVERY_STAGING",
                      waybill: waybill || "",
                      status: savedStatus,
                      trackingUrl,
                      rawResponse: delhiveryResp,
                  },
              });

        // Update order: if waybill -> shipped; else if error -> error; else update trackingInfo
        const orderUpdateData: any = {
            trackingInfo: {
                provider: saved.provider,
                waybill: saved.waybill || "",
                status: savedStatus,
                trackingUrl: trackingUrl,
                raw: saved.rawResponse || delhiveryResp,
            },
        };

        if (waybill) {
            orderUpdateData.status = "shipped";
        } else if (!delhiveryResp?.success) {
            orderUpdateData.status = "error";
        }

        const updatedOrder = await prisma.order.update({
            where: { id: String(order.id) },
            data: orderUpdateData,
        });

        console.log(
            `[Delhivery staging] Shipment record saved (order=${order.id}) id=${saved.id} status=${saved.status}`
        );
        console.log(
            `[Delhivery staging] Order updated (order=${order.id}) status=${(updatedOrder as any).status}`
        );

        return { ok: true, delhiveryResp, saved };
    } catch (err: any) {
        console.error(
            "[Delhivery staging] ERROR:",
            err.response?.data ?? err.message ?? err
        );
        return {
            ok: false,
            error: err.response?.data ?? err.message ?? String(err),
        };
    }
}
