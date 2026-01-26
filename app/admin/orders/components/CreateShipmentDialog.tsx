"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Order } from "../types";
import { formatRupees } from "../utils/formatters";

interface Props {
    order: Order | null;
    open: boolean;
    onClose(): void;
    onCreated(): void;
}

export function CreateShipmentDialog({
    order,
    open,
    onClose,
    onCreated,
}: Props) {
    const [shipmentData, setShipmentData] = useState({
        length: "",
        breadth: "",
        height: "",
        weight: "",
        quantity: "",
    });

    const [isCalculating, setIsCalculating] = useState(false);
    const [shippingCharge, setShippingCharge] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    async function calculateShipping() {
        if (!order) return; // 🔒 re-narrow

        const currentOrder = order;

        try {
            setIsCalculating(true);
            setShippingCharge(null);

            const res = await fetch("/api/internal/calculate-shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shippingMode: currentOrder.shippingMode,
                    weight: Number(shipmentData.weight),
                    length: Number(shipmentData.length),
                    breadth: Number(shipmentData.breadth),
                    height: Number(shipmentData.height),
                    originPincode: "110042", // warehouse pin
                    destinationPincode:
                        currentOrder.shippingAddress?.pincode ??
                        currentOrder.shippingAddress?.zipCode ??
                        "",
                    paymentType: "Pre-paid",
                }),
            });

            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            setShippingCharge(data.charge);
        } catch (err: any) {
            toast({
                title: "Failed to calculate shipping",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsCalculating(false);
        }
    }

    async function createShipment() {
        if (!order) return; // 🔒 re-narrow

        const currentOrder = order;

        try {
            setIsCreating(true);

            const res = await fetch("/api/internal/create-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: currentOrder.id,
                    shipping_mode: currentOrder.shippingMode,
                    ...shipmentData,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast({
                title: "Shipment created",
                description: "Syncing shipment status…",
            });

            await fetch("/api/internal/sync-shipments", { method: "POST" });
            onCreated();
            onClose();
        } catch (err: any) {
            toast({
                title: "Shipment creation failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    }

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Create Shipment</DialogTitle>
                    <DialogDescription>
                        Verify order details and enter shipment dimensions.
                    </DialogDescription>
                </DialogHeader>

                {/* ORDER SUMMARY */}
                <div className="rounded-md border p-3 text-sm space-y-1">
                    <p>
                        <b>Order ID:</b> {order.id}
                    </p>
                    <p>
                        <b>Total Amount:</b> {formatRupees(order.totalAmount)}
                    </p>
                    <p>
                        <b>Total Items:</b> {order.items?.length || 0}
                    </p>
                    <p>
                        <b>Shipping Mode:</b>{" "}
                        <span className="capitalize">{order.shippingMode}</span>
                    </p>
                </div>

                {/* ORDER ITEMS */}
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Order Items</p>
                    <div className="rounded-md border divide-y text-sm">
                        {(order.items || []).map((item: any, idx: number) => (
                            <div
                                key={idx}
                                className="flex justify-between px-3 py-2"
                            >
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">
                                        Color: {item.color || "—"} • Size:{" "}
                                        {item.size || "—"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p>Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DIMENSIONS */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                        ["length", "Length (cm)"],
                        ["breadth", "Breadth (cm)"],
                        ["height", "Height (cm)"],
                        ["weight", "Weight (g)"],
                    ].map(([key, label]) => (
                        <div key={key}>
                            <Label>{label}</Label>
                            <Input
                                type="number"
                                value={(shipmentData as any)[key]}
                                onChange={(e) =>
                                    setShipmentData((p) => ({
                                        ...p,
                                        [key]: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    ))}

                    <div className="col-span-2">
                        <Label>Shipment Quantity</Label>
                        <Input
                            type="number"
                            value={shipmentData.quantity}
                            onChange={(e) =>
                                setShipmentData((p) => ({
                                    ...p,
                                    quantity: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                {/* SHIPPING COST */}
                {shippingCharge && (
                    <div className="mt-4 rounded-md border p-4 bg-muted text-sm space-y-1">
                        <p className="font-medium text-base">
                            Estimated Shipping Cost
                        </p>

                        <div className="flex justify-between">
                            <span>Zone</span>
                            <span>{shippingCharge.zone}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Chargeable Weight</span>
                            <span>{shippingCharge.charged_weight} g</span>
                        </div>

                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{shippingCharge.total_amount}</span>
                        </div>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="outline"
                        disabled={isCalculating}
                        onClick={calculateShipping}
                    >
                        {isCalculating
                            ? "Calculating…"
                            : "Calculate Shipping Cost"}
                    </Button>

                    <Button disabled={isCreating} onClick={createShipment}>
                        {isCreating ? "Creating…" : "Confirm & Create"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
