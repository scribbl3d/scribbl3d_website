// app/api/internal/cancel-shipment/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

const DELHIVERY_TOKEN = process.env.DELHIVERY_API_TOKEN!;
const DELHIVERY_BASE_URL = "https://track.delhivery.com";

export async function POST(req: NextRequest) {
    console.log("🚀 [CANCEL-SHIPMENT] Request received");

    let body: any;
    try {
        body = await req.json();
        console.log("📦 Request body:", body);
    } catch (err) {
        console.error("❌ Failed to parse JSON body", err);
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const { orderId } = body;

    if (!orderId) {
        console.warn("⚠️ orderId missing in request");
        return NextResponse.json(
            { error: "orderId is required" },
            { status: 400 },
        );
    }

    console.log("🔍 Fetching session...");
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        console.warn("⛔ Unauthorized request – no session");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Authenticated user:", {
        userId: session.user.id,
        email: session.user.email,
    });

    try {
        console.log("🗄️ Fetching order from DB:", orderId);

        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { shipments: true },
        });

        if (!order) {
            console.warn("❌ Order not found:", orderId);
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        if (order.userId !== session.user.id) {
            console.warn("⛔ Order does not belong to user", {
                orderUserId: order.userId,
                sessionUserId: session.user.id,
            });

            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        console.log("📦 Order found:", {
            orderId: order.id,
            shipmentCount: order.shipments?.length ?? 0,
        });

        const shipments = order.shipments || [];
        const results: any[] = [];

        for (const shipment of shipments) {
            console.log("➡️ Processing shipment:", shipment.id);

            if (!shipment.waybill) {
                console.warn(
                    "⚠️ Shipment missing waybill, skipping:",
                    shipment.id,
                );
                continue;
            }

            console.log("📮 Cancelling Delhivery waybill:", shipment.waybill);

            try {
                const response = await axios.post(
                    `${DELHIVERY_BASE_URL}/api/p/edit`,
                    {
                        waybill: shipment.waybill,
                        cancellation: "true",
                    },
                    {
                        headers: {
                            Authorization: `Token ${DELHIVERY_TOKEN}`,
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        timeout: 15000,
                    },
                );

                console.log("✅ Delhivery cancellation success:", {
                    waybill: shipment.waybill,
                    response: response.data,
                });

                await db.shipment.update({
                    where: { id: shipment.id },
                    data: { status: "cancelled" },
                });

                console.log(
                    "🗄️ Shipment status updated to cancelled:",
                    shipment.id,
                );

                results.push({
                    waybill: shipment.waybill,
                    success: true,
                    data: response.data,
                });
            } catch (err: any) {
                console.error("❌ Delhivery cancellation failed:", {
                    waybill: shipment.waybill,
                    error: err.response?.data || err.message,
                });

                results.push({
                    waybill: shipment.waybill,
                    success: false,
                    error: err.response?.data || err.message,
                });
            }
        }

        console.log("🏁 Cancellation process completed", {
            orderId,
            resultsCount: results.length,
        });

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        console.error("🔥 Unexpected error in cancel-shipment API", err);

        return NextResponse.json(
            { error: err.message || "Shipment cancellation failed" },
            { status: 500 },
        );
    }
}
