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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Package, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Order } from "../types";
import { formatRupees } from "../utils/formatters";

interface Props {
    order: Order | null;
    open: boolean;
    onClose(): void;
    onCreated(): void;
}

interface PackageData {
    id: string;
    length: string;
    breadth: string;
    height: string;
    weight: string;
    quantity: string;
    productsDesc: string;
}

type ShipmentType = "SPS" | "MPS";

const createEmptyPackage = (): PackageData => ({
    id: crypto.randomUUID(),
    length: "",
    breadth: "",
    height: "",
    weight: "",
    quantity: "",
    productsDesc: "",
});

export function CreateShipmentDialog({
    order,
    open,
    onClose,
    onCreated,
}: Props) {
    const [shipmentType, setShipmentType] = useState<ShipmentType>("SPS");
    const [packages, setPackages] = useState<PackageData[]>([
        createEmptyPackage(),
    ]);

    const [isCalculating, setIsCalculating] = useState(false);
    const [shippingCharges, setShippingCharges] = useState<any[] | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Reset state when dialog opens/closes or shipment type changes
    const handleShipmentTypeChange = (type: ShipmentType) => {
        setShipmentType(type);
        setPackages([createEmptyPackage()]);
        setShippingCharges(null);
    };

    const addPackage = () => {
        if (packages.length >= 10) {
            toast({
                title: "Maximum packages reached",
                description: "You can add up to 10 packages per shipment.",
                variant: "destructive",
            });
            return;
        }
        setPackages([...packages, createEmptyPackage()]);
    };

    const removePackage = (id: string) => {
        if (packages.length <= 1) return;
        setPackages(packages.filter((p) => p.id !== id));
    };

    const updatePackage = (
        id: string,
        field: keyof PackageData,
        value: string,
    ) => {
        setPackages(
            packages.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
        );
    };

    async function calculateShipping() {
        if (!order) return;

        const currentOrder = order;

        // Validate all packages have required fields
        const invalidPackage = packages.find(
            (p) => !p.length || !p.breadth || !p.height || !p.weight,
        );
        if (invalidPackage) {
            toast({
                title: "Incomplete package dimensions",
                description:
                    "Please fill all dimension fields for each package.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsCalculating(true);
            setShippingCharges(null);

            // Calculate shipping for each package
            const charges = await Promise.all(
                packages.map(async (pkg) => {
                    const res = await fetch(
                        "/api/internal/calculate-shipping",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                shippingMode: currentOrder.shippingMode,
                                weight: Number(pkg.weight),
                                length: Number(pkg.length),
                                breadth: Number(pkg.breadth),
                                height: Number(pkg.height),
                                originPincode: "110042",
                                destinationPincode:
                                    currentOrder.shippingAddress?.pincode ??
                                    currentOrder.shippingAddress?.zipCode ??
                                    "",
                                paymentType: "Pre-paid",
                            }),
                        },
                    );

                    const data = await res.json();
                    if (!data.ok) throw new Error(data.error);

                    return { packageId: pkg.id, charge: data.charge };
                }),
            );

            setShippingCharges(charges);
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
        if (!order) return;

        const currentOrder = order;

        // Validate all packages
        const invalidPackage = packages.find(
            (p) =>
                !p.length ||
                !p.breadth ||
                !p.height ||
                !p.weight ||
                !p.quantity,
        );
        if (invalidPackage) {
            toast({
                title: "Incomplete package data",
                description: "Please fill all fields for each package.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsCreating(true);

            const res = await fetch("/api/internal/create-shipment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: currentOrder.id,
                    shipping_mode: currentOrder.shippingMode,
                    shipment_type: shipmentType,
                    packages: packages.map((pkg) => ({
                        length: pkg.length,
                        breadth: pkg.breadth,
                        height: pkg.height,
                        weight: pkg.weight,
                        quantity: pkg.quantity,
                        products_desc: pkg.productsDesc || undefined,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast({
                title: "Shipment created",
                description:
                    shipmentType === "MPS"
                        ? `${packages.length} packages created with master waybill: ${data.masterWaybill}`
                        : "Syncing shipment status…",
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

    const handleDialogClose = () => {
        // Reset state on close
        setShipmentType("SPS");
        setPackages([createEmptyPackage()]);
        setShippingCharges(null);
        onClose();
    };

    if (!order) return null;

    const totalShippingCost = shippingCharges?.reduce(
        (sum, c) => sum + (c.charge?.total_amount || 0),
        0,
    );

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
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

                {/* SHIPMENT TYPE SELECTOR */}
                <div className="mt-4 space-y-2">
                    <Label>Shipment Type</Label>
                    <Select
                        value={shipmentType}
                        onValueChange={(v) =>
                            handleShipmentTypeChange(v as ShipmentType)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SPS">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>Single Package Shipment (SPS)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="MPS">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>Multi-Package Shipment (MPS)</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        {shipmentType === "SPS"
                            ? "All items packed in a single box with one waybill."
                            : "Order split across multiple boxes, each with its own waybill. One master waybill tracks the entire shipment."}
                    </p>
                </div>

                {/* PACKAGES */}
                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            {shipmentType === "MPS"
                                ? `Packages (${packages.length})`
                                : "Package Dimensions"}
                        </p>
                        {shipmentType === "MPS" && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPackage}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Package
                            </Button>
                        )}
                    </div>

                    {packages.map((pkg, index) => (
                        <div
                            key={pkg.id}
                            className="rounded-md border p-4 space-y-3"
                        >
                            {shipmentType === "MPS" && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        Package {index + 1}
                                    </p>
                                    {packages.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removePackage(pkg.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label>Length (cm)</Label>
                                    <Input
                                        type="number"
                                        value={pkg.length}
                                        onChange={(e) =>
                                            updatePackage(
                                                pkg.id,
                                                "length",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 20"
                                    />
                                </div>
                                <div>
                                    <Label>Breadth (cm)</Label>
                                    <Input
                                        type="number"
                                        value={pkg.breadth}
                                        onChange={(e) =>
                                            updatePackage(
                                                pkg.id,
                                                "breadth",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 15"
                                    />
                                </div>
                                <div>
                                    <Label>Height (cm)</Label>
                                    <Input
                                        type="number"
                                        value={pkg.height}
                                        onChange={(e) =>
                                            updatePackage(
                                                pkg.id,
                                                "height",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 10"
                                    />
                                </div>
                                <div>
                                    <Label>Weight (g)</Label>
                                    <Input
                                        type="number"
                                        value={pkg.weight}
                                        onChange={(e) =>
                                            updatePackage(
                                                pkg.id,
                                                "weight",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 500"
                                    />
                                </div>
                                <div>
                                    <Label>Items in Box</Label>
                                    <Input
                                        type="number"
                                        value={pkg.quantity}
                                        onChange={(e) =>
                                            updatePackage(
                                                pkg.id,
                                                "quantity",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 2"
                                    />
                                </div>
                                {shipmentType === "MPS" && (
                                    <div>
                                        <Label>Products Description</Label>
                                        <Input
                                            type="text"
                                            value={pkg.productsDesc}
                                            onChange={(e) =>
                                                updatePackage(
                                                    pkg.id,
                                                    "productsDesc",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., T-shirt, Shoes"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Per-package shipping cost */}
                            {shippingCharges && (
                                <div className="text-sm text-muted-foreground">
                                    {(() => {
                                        const charge = shippingCharges.find(
                                            (c) => c.packageId === pkg.id,
                                        );
                                        return charge?.charge ? (
                                            <span>
                                                Est. shipping: ₹
                                                {charge.charge.total_amount} (
                                                {charge.charge.charged_weight}g,{" "}
                                                {charge.charge.zone})
                                            </span>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* TOTAL SHIPPING COST */}
                {shippingCharges && shippingCharges.length > 0 && (
                    <div className="mt-4 rounded-md border p-4 bg-muted text-sm space-y-2">
                        <p className="font-medium text-base">
                            Estimated Total Shipping Cost
                        </p>
                        {shipmentType === "MPS" && (
                            <p className="text-muted-foreground">
                                {packages.length} packages
                            </p>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{totalShippingCost}</span>
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
