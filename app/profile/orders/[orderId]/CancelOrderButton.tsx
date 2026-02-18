"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CancelOrderButtonProps {
    orderId: string;
    hasShipment: boolean;
}

export function CancelOrderButton({
    orderId,
    hasShipment,
}: CancelOrderButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleCancel = async () => {
        setCancelling(true);
        setError(null);
        try {
            // Step 1: Cancel Delhivery shipment if it exists
            if (hasShipment) {
                const shipmentRes = await fetch(
                    `/api/internal/cancel-shipment`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId }),
                    },
                );
                if (!shipmentRes.ok) {
                    const data = await shipmentRes.json();
                    throw new Error(data.error || "Failed to cancel shipment");
                }
            }

            // Step 2: Initiate refund via existing admin cancel API
            const refundRes = await fetch(
                `/api/admin/orders/${orderId}/cancel`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cancelledBy: "customer" }),
                },
            );
            const refundData = await refundRes.json();
            if (!refundRes.ok) {
                throw new Error(refundData.error || "Failed to cancel order");
            }

            setShowModal(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-red-50/50 hover:bg-red-50 transition-colors"
            >
                Cancel Order
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !cancelling && setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Cancel Order?
                        </h3>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to cancel this order?
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                            This action cannot be undone.
                        </p>

                        {/* Info note */}
                        <div className="bg-gray-50 rounded-lg px-4 py-3 mt-4">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                If payment has already been made, the refund
                                will be processed as per policy.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-red-600 mt-3">{error}</p>
                        )}

                        {/* Actions */}
                        <div className="mt-5 space-y-2.5">
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Yes, Cancel Order"
                                )}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={cancelling}
                                className="w-full text-sm font-semibold text-gray-700 hover:text-gray-900 py-2"
                            >
                                Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
