"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderTrackingPage() {
    // useParams can return Record<string, string | string[] | null> | null
    const params = useParams() as Record<
        string,
        string | string[] | null
    > | null;

    // normalize to a single string (safe)
    const orderId =
        params && params.orderId
            ? Array.isArray(params.orderId)
                ? params.orderId[0]
                : params.orderId
            : null;

    const [shipment, setShipment] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError("Order ID missing from route");
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        axios
            .get(`/api/order/${encodeURIComponent(orderId)}/tracking`)
            .then((res) => {
                if (cancelled) return;
                if (res.data?.success) {
                    setShipment(res.data.shipment);
                } else {
                    setError(res.data?.message || "No shipment found");
                }
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("tracking fetch error", err);
                setError("Failed to fetch tracking");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (loading) return <div className="p-6">Loading tracking…</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
    if (!shipment)
        return (
            <div className="p-6">
                No tracking data available for this order.
            </div>
        );

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">📦 Order Tracking</h1>

            <div className="border rounded p-4 mb-6">
                <p>
                    <strong>Provider:</strong> {shipment.provider}
                </p>
                <p>
                    <strong>Waybill:</strong> {shipment.waybill}
                </p>
                <p>
                    <strong>Status:</strong> {shipment.status}
                </p>
                {shipment.trackingUrl && (
                    <a
                        className="text-blue-600 underline"
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Track on Delhivery →
                    </a>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                    onClick={async () => {
                        await fetch("/api/dev/fake-delivery", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                shipmentId: shipment.id,
                                status: "out_for_delivery",
                            }),
                        });
                        location.reload();
                    }}
                >
                    Mark Out For Delivery (FAKE)
                </button>

                <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={async () => {
                        await fetch("/api/dev/fake-delivery", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                shipmentId: shipment.id,
                                status: "delivered",
                            }),
                        });
                        location.reload();
                    }}
                >
                    Mark Delivered (FAKE)
                </button>
            </div>
        </div>
    );
}
