// app/api/internal/cancel-shipment/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

const DELHIVERY_TOKEN = process.env.DELHIVERY_TOKEN!;
const DELHIVERY_BASE_URL = "https://track.delhivery.com";

export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch (err) {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const { orderId } = body;

    if (!orderId) {
        return NextResponse.json(
            { error: "orderId is required" },
            { status: 400 },
        );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {

        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { shipments: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        if (order.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        const shipments = order.shipments || [];
        const results: any[] = [];

        for (const shipment of shipments) {
            if (!shipment.waybill) {
                continue;
            }

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

                await db.shipment.update({
                    where: { id: shipment.id },
                    data: { status: "cancelled" },
                });

                results.push({
                    waybill: shipment.waybill,
                    success: true,
                    data: response.data,
                });
            } catch (err: any) {
                results.push({
                    waybill: shipment.waybill,
                    success: false,
                    error: err.response?.data || err.message,
                });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Shipment cancellation failed" },
            { status: 500 },
        );
    }
}
