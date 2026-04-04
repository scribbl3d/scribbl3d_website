"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Order } from "../types";
import { formatDate, formatRupees } from "../utils/formatters";
import { parseTracking } from "../utils/tracking";

interface Props {
    order: Order | null;
    open: boolean;
    onClose(): void;
}

export function ViewOrderDialog({ order, open, onClose }: Props) {
    if (!order) return null;

    const tracking = parseTracking(order.trackingInfo);

    const billing = order.billingAddress as Record<string, any> | null;
    const hasGstin = billing?.wantsGstInvoice && billing?.gstin;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Order #{order.id.slice(-6)}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 text-sm">
                    {/* ===================== TOP GRID ===================== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CUSTOMER */}
                        <section>
                            <h4 className="font-semibold mb-2">Customer</h4>
                            <p>
                                {order.shippingAddress?.fullName ||
                                    order.user?.name}
                            </p>
                            <p>
                                {order.shippingAddress?.email ||
                                    order.user?.email}
                            </p>
                            <p>
                                {order.shippingAddress?.phone ||
                                    order.user?.phone}
                            </p>
                        </section>

                        {/* ORDER STATUS */}
                        <section>
                            <h4 className="font-semibold mb-2">Order Status</h4>
                            <Badge variant="outline" className="capitalize">
                                {order.status}
                            </Badge>

                            <h4 className="font-semibold mt-4 mb-2">
                                Order Created
                            </h4>
                            <p>{formatDate(order.createdAt)}</p>
                        </section>
                    </div>

                    {/* ===================== ADDRESS ===================== */}
                    <section>
                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                        <p>{order.shippingAddress?.address}</p>
                        <p>
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state}{" "}
                            {order.shippingAddress?.pincode}
                        </p>
                        <p>{order.shippingAddress?.country}</p>
                    </section>

                    {/* ===================== GST ===================== */}
                    {hasGstin && (
                        <section>
                            <h4 className="font-semibold mb-2">
                                GST Billing Details
                            </h4>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 uppercase">
                                            GSTIN
                                        </p>
                                        <p className="font-mono font-semibold text-blue-900">
                                            {billing.gstin}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-blue-600 uppercase">
                                            Company
                                        </p>
                                        <p className="font-medium">
                                            {billing.gstCompanyName || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-blue-600 uppercase">
                                        Address
                                    </p>
                                    <p>{billing.gstAddress || "N/A"}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ===================== PAYMENT ===================== */}
                    {(order.paymentMethod ||
                        order.paymentReference ||
                        order.maskedPaymentId) && (
                        <section>
                            <h4 className="font-semibold mb-2">
                                Payment Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <strong>Payment Mode:</strong>
                                    <p className="capitalize">
                                        {order.paymentMethod?.replace(
                                            "_",
                                            " ",
                                        ) || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <strong>Transaction ID:</strong>
                                    <p>{order.transactionId || "N/A"}</p>
                                </div>

                                <div>
                                    <strong>Reference:</strong>
                                    <p>{order.paymentReference || "N/A"}</p>
                                </div>

                                <div>
                                    <strong>Masked ID:</strong>
                                    <p>{order.maskedPaymentId || "N/A"}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ===================== ITEMS ===================== */}
                    <section>
                        <h4 className="font-semibold mb-2">Items</h4>

                        <ul className="space-y-3">
                            {(order.items || []).map(
                                (item: any, idx: number) => (
                                    <li
                                        key={idx}
                                        className="flex justify-between border p-3 rounded-md"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.name}
                                            </p>

                                            {(item.size || item.color) && (
                                                <p className="text-muted-foreground">
                                                    {item.size &&
                                                        `Size: ${item.size}`}
                                                    {item.size &&
                                                        item.color &&
                                                        " • "}
                                                    {item.color &&
                                                        `Color: ${item.color}`}
                                                </p>
                                            )}

                                            <p>Qty: {item.quantity}</p>
                                        </div>

                                        <div className="font-semibold">
                                            {formatRupees(
                                                item.price * item.quantity,
                                            )}
                                        </div>
                                    </li>
                                ),
                            )}
                        </ul>
                    </section>

                    {/* ===================== TRACKING ===================== */}
                    {(tracking?.waybill ||
                        tracking?.trackingNumber ||
                        tracking?.trackingUrl) && (
                        <section>
                            <h4 className="font-semibold mb-2">
                                Tracking Info
                            </h4>

                            <p>
                                <strong>Number:</strong>{" "}
                                {tracking.waybill || tracking.trackingNumber}
                            </p>

                            <p>
                                <strong>Carrier:</strong>{" "}
                                {tracking.provider || "N/A"}
                            </p>

                            {tracking.trackingUrl && (
                                <a
                                    href={tracking.trackingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Track Package
                                </a>
                            )}
                        </section>
                    )}

                    {/* ===================== TOTAL ===================== */}
                    <section>
                        <h4 className="font-semibold mb-2">Total Amount</h4>
                        <p className="text-lg font-bold">
                            {formatRupees(order.totalAmount)}
                        </p>
                    </section>

                    {/* ===================== FOOTER ===================== */}
                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
