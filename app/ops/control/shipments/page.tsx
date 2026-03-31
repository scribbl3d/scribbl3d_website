// app/admin/shipments/page.tsx
"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminShipmentsPage() {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const highlightOrderId = searchParams?.get("orderId") || null;

    async function load() {
        setLoading(true);
        try {
            const res = await axios.get("/api/admin/shipments");
            setShipments(res.data.shipments || []);
        } catch (e) {
            console.error("load shipments error", e);
            alert("Failed to load shipments");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!highlightOrderId) return;
        // Wait for list render, then scroll
        const timer = setTimeout(() => {
            const el = document.querySelector(
                `[data-order="${highlightOrderId}"]`
            );
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                // add a brief highlight class
                (el as HTMLElement).classList.add("ring-4", "ring-indigo-200");
                setTimeout(
                    () =>
                        (el as HTMLElement).classList.remove(
                            "ring-4",
                            "ring-indigo-200"
                        ),
                    2500
                );
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [highlightOrderId, shipments]);

    async function retry(orderId: string) {
        try {
            await axios.post(`/api/admin/shipments/order/${orderId}/retry`);
            alert("Retry/Create triggered");
            load();
        } catch (e: any) {
            alert("Retry failed: " + (e?.response?.data?.error || e.message));
        }
    }

    async function markDelivered(shipmentId: string) {
        try {
            await axios.post(
                `/api/admin/shipments/shipment/${shipmentId}/mark-delivered`
            );
            alert("Marked delivered");
            load();
        } catch (e: any) {
            alert("Failed: " + (e?.response?.data?.error || e.message));
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Shipments</h1>

            {loading && <div>Loading…</div>}
            <div className="overflow-auto bg-white rounded-lg shadow">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Order ID</th>
                            <th className="p-3 text-left">Waybill</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">
                                RMK (Provider Error)
                            </th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map((s) => (
                            <tr
                                key={s.id}
                                className="border-t"
                                data-order={s.orderId}
                            >
                                <td className="p-3">{s.orderId}</td>
                                <td className="p-3">{s.waybill || "—"}</td>
                                <td className="p-3">{s.status}</td>
                                <td className="p-3 max-w-lg break-words">
                                    {s.rawResponse?.rmk ? (
                                        <pre className="text-red-600 whitespace-pre-wrap text-sm">
                                            {s.rawResponse.rmk}
                                        </pre>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                                <td className="p-3 space-x-2">
                                    <button
                                        onClick={() => retry(s.orderId)}
                                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                                    >
                                        Retry
                                    </button>
                                    <button
                                        onClick={() => markDelivered(s.id)}
                                        className="px-3 py-1 bg-green-600 text-white rounded"
                                    >
                                        Mark Delivered
                                    </button>
                                    <a
                                        href={`/order/${s.orderId}/tracking`}
                                        className="px-3 py-1 bg-blue-600 text-white rounded"
                                    >
                                        View Tracking
                                    </a>
                                </td>
                            </tr>
                        ))}

                        {!loading && shipments.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-6 text-center text-gray-500"
                                >
                                    No shipments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
