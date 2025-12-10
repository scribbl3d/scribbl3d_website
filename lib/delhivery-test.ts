import { prisma } from "@/lib/prisma";

export async function createFakeDelhiveryShipment(orderId: string) {
    // ✅ block duplicate shipments
    const existing = await prisma.shipment.findUnique({
        where: { orderId },
    });

    if (existing) {
        console.log("⚠️ Shipment already exists:", existing.waybill);
        return existing;
    }

    const fakeWaybill = "DLH_TEST_" + Date.now();
    const fakeTrackingUrl = `https://delhivery.com/track/package/${fakeWaybill}`;
    const shipment = await prisma.shipment.create({
        data: {
            orderId,
            provider: "DELHIVERY_TEST",
            waybill: fakeWaybill,
            status: "shipped",
            trackingUrl: fakeTrackingUrl,
            rawResponse: {
                mock: true,
                generatedAt: new Date().toISOString(),
            },
        },
    });

    // ✅ STORE TRACKING INFO INSIDE ORDER (you already have this field)
    await prisma.order.update({
        where: { id: orderId },
        data: {
            trackingInfo: {
                provider: "DELHIVERY_TEST",
                waybill: fakeWaybill,
                trackingUrl: fakeTrackingUrl,
                status: "shipped",
            },
        },
    });

    console.log("✅ Fake Delhivery Shipment Created:", shipment.waybill);

    return shipment;
}
