"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Order {
    id: string;
    userId?: string;
    items?: any;
    totalAmount: number;
    status: string;
    trackingInfo?: any; // stored in DB: object or serialized string
    shippingAddress?: {
        name?: string;
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        pincode?: string;
        phone?: string | string[];
        country?: string;
        fullName?: string;
        landmark?: string;
    };
    billingAddress?: any;
    paymentMethod?: string;
    transactionId?: string;
    user?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
    };
    createdAt?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState({
        trackingNumber: "",
        trackingLink: "",
        carrier: "",
    });
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string>("");
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [notifyCustomer, setNotifyCustomer] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        try {
            const res = await fetch("/api/admin/orders");
            if (!res.ok) throw new Error("Failed to fetch orders");
            const data = await res.json();
            // if your API returns { ok: true, orders: [...] } adapt accordingly
            const list = Array.isArray(data) ? data : (data.orders ?? []);
            setOrders(list);
        } catch (err) {
            console.error("Error fetching orders:", err);
            toast({
                title: "Error",
                description: "Failed to fetch orders",
                variant: "destructive",
            });
        }
    }
    async function generateLabel(waybill: string) {
        console.log("Sending waybill 👉", waybill);

        const res = await fetch(
            `/api/internal/generate-label?waybill=${encodeURIComponent(
                waybill
            )}`,
            {
                method: "GET",
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to generate label");
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `label-${waybill}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    trackingInfo:
                        newStatus === "shipped" ? trackingInfo : undefined,
                    notifyCustomer,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update order");
            }

            toast({ title: "Success", description: "Order status updated" });
            await fetchOrders();
            setTrackingInfo({
                trackingNumber: "",
                trackingLink: "",
                carrier: "",
            });
        } catch (err) {
            console.error("Error updating order:", err);
            toast({
                title: "Error",
                description: "Failed to update order status",
                variant: "destructive",
            });
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "payment_pending":
                return "bg-yellow-500";
            case "confirmed":
                return "bg-green-500";
            case "processing":
                return "bg-blue-500";
            case "shipped":
                return "bg-purple-500";
            case "delivered":
                return "bg-indigo-500";
            case "error":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const formatRupees = (amount: number) =>
        `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const d = new Date(dateString);
        return d.toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // safe parse for trackingInfo (may be string in DB)
    const parseTracking = (raw: any) => {
        if (!raw) return {};
        if (typeof raw === "string") {
            try {
                return JSON.parse(raw);
            } catch {
                return {};
            }
        }
        return raw;
    };

    const confirmedOrders = orders.filter(
        (o) =>
            o.status === "confirmed" ||
            o.status === "processing" ||
            o.status === "payment_pending"
    );
    const shippedOrders = orders.filter((o) => o.status === "shipped");
    const deliveredOrders = orders.filter((o) => o.status === "delivered");

    // render table with optional shipment column
    const renderOrdersTable = (
        ordersToShow: Order[],
        tableTitle: string,
        colorClass: string,
        includeShipmentColumn: boolean
    ) => (
        <div className={`mb-8 rounded-lg shadow border ${colorClass} p-4`}>
            <h3 className="text-2xl font-semibold mb-4">{tableTitle}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        {includeShipmentColumn && (
                            <TableHead>Shipment</TableHead>
                        )}
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ordersToShow.map((order) => {
                        const trackingObj = parseTracking(order.trackingInfo);
                        return (
                            <TableRow key={order.id}>
                                <TableCell>{order.id.slice(-6)}</TableCell>
                                <TableCell>
                                    {order.shippingAddress?.fullName ||
                                        order.shippingAddress?.name ||
                                        order.user?.name ||
                                        "Anonymous"}
                                </TableCell>
                                <TableCell>
                                    {formatRupees(order.totalAmount)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={getStatusColor(order.status)}
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {order.paymentMethod || "—"}
                                </TableCell>

                                {includeShipmentColumn && (
                                    <TableCell>
                                        {trackingObj &&
                                        (trackingObj.waybill ||
                                            trackingObj.trackingNumber) ? (
                                            <div>
                                                <div className="text-xs mt-1">
                                                    {trackingObj.waybill ||
                                                        trackingObj.trackingNumber}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                No shipment
                                            </div>
                                        )}
                                    </TableCell>
                                )}

                                <TableCell className="flex flex-col gap-2">
                                    <Dialog
                                        open={
                                            isDialogOpen &&
                                            selectedOrder?.id === order.id
                                        }
                                        onOpenChange={(open) => {
                                            setIsDialogOpen(open);
                                            if (!open) {
                                                setSelectedOrder(null);
                                                setTrackingInfo({
                                                    trackingNumber: "",
                                                    trackingLink: "",
                                                    carrier: "",
                                                });
                                            }
                                        }}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    // prefill trackingInfo in modal if present
                                                    const t = parseTracking(
                                                        order.trackingInfo
                                                    );
                                                    setTrackingInfo({
                                                        trackingNumber:
                                                            t.waybill ||
                                                            t.trackingNumber ||
                                                            "",
                                                        trackingLink:
                                                            t.trackingUrl ||
                                                            t.trackingLink ||
                                                            "",
                                                        carrier:
                                                            t.provider ||
                                                            t.carrier ||
                                                            "",
                                                    });
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Order Details
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Order #
                                                    {selectedOrder?.id.slice(
                                                        -6
                                                    )}
                                                </DialogDescription>
                                            </DialogHeader>

                                            {selectedOrder && (
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-2">
                                                                Shipping Address
                                                            </h4>
                                                            <p>
                                                                {selectedOrder
                                                                    .shippingAddress
                                                                    ?.fullName ||
                                                                    selectedOrder
                                                                        .shippingAddress
                                                                        ?.name}
                                                            </p>
                                                            <p>
                                                                {
                                                                    selectedOrder
                                                                        .shippingAddress
                                                                        ?.street
                                                                }
                                                            </p>
                                                            <p>
                                                                {
                                                                    selectedOrder
                                                                        .shippingAddress
                                                                        ?.city
                                                                }
                                                                ,{" "}
                                                                {
                                                                    selectedOrder
                                                                        .shippingAddress
                                                                        ?.state
                                                                }{" "}
                                                                {selectedOrder
                                                                    .shippingAddress
                                                                    ?.pincode ||
                                                                    selectedOrder
                                                                        .shippingAddress
                                                                        ?.zipCode}
                                                            </p>
                                                            <p>
                                                                {
                                                                    selectedOrder
                                                                        .shippingAddress
                                                                        ?.country
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-semibold mb-2">
                                                                Order Status
                                                            </h4>
                                                            <p>
                                                                {
                                                                    selectedOrder.status
                                                                }
                                                            </p>

                                                            <h4 className="font-semibold mb-2 mt-4">
                                                                Customer Email
                                                            </h4>
                                                            <p>
                                                                {selectedOrder
                                                                    .user
                                                                    ?.email ||
                                                                    "N/A"}
                                                            </p>

                                                            <h4 className="font-semibold mb-2 mt-4">
                                                                Mobile Number
                                                            </h4>
                                                            <p>
                                                                {selectedOrder
                                                                    .shippingAddress
                                                                    ?.phone ||
                                                                    selectedOrder
                                                                        .user
                                                                        ?.phone ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">
                                                            Order Created:
                                                        </h4>
                                                        <p>
                                                            {formatDate(
                                                                selectedOrder.createdAt
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">
                                                            Items:
                                                        </h4>
                                                        <ul className="list-disc pl-5">
                                                            {(Array.isArray(
                                                                selectedOrder.items
                                                            )
                                                                ? selectedOrder.items
                                                                : []
                                                            ).length > 0 ? (
                                                                (
                                                                    selectedOrder.items ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        item: any,
                                                                        i: number
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {
                                                                                item.name
                                                                            }{" "}
                                                                            -
                                                                            Quantity:{" "}
                                                                            {
                                                                                item.quantity
                                                                            }{" "}
                                                                            -{" "}
                                                                            {formatRupees(
                                                                                item.price
                                                                            )}
                                                                        </li>
                                                                    )
                                                                )
                                                            ) : (
                                                                <li>
                                                                    No items
                                                                    found in
                                                                    this order.
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>

                                                    {/* show tracking info if present */}
                                                    {(() => {
                                                        const t = parseTracking(
                                                            selectedOrder.trackingInfo
                                                        );
                                                        if (
                                                            t &&
                                                            (t.waybill ||
                                                                t.trackingNumber ||
                                                                t.trackingUrl ||
                                                                t.provider)
                                                        ) {
                                                            return (
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">
                                                                        Tracking
                                                                        Info:
                                                                    </h4>
                                                                    <p>
                                                                        <strong>
                                                                            Number:
                                                                        </strong>{" "}
                                                                        {t.waybill ||
                                                                            t.trackingNumber ||
                                                                            "N/A"}
                                                                    </p>
                                                                    <p>
                                                                        <strong>
                                                                            Provider:
                                                                        </strong>{" "}
                                                                        {t.provider ||
                                                                            t.carrier ||
                                                                            "N/A"}
                                                                    </p>
                                                                    {t.trackingUrl ? (
                                                                        <p>
                                                                            <strong>
                                                                                Link:
                                                                            </strong>{" "}
                                                                            <a
                                                                                href={
                                                                                    t.trackingUrl
                                                                                }
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-blue-600 underline"
                                                                            >
                                                                                Track
                                                                                Package
                                                                            </a>
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    <div>
                                                        <h4 className="font-semibold mb-2">
                                                            Total Amount:
                                                        </h4>
                                                        <p>
                                                            {formatRupees(
                                                                selectedOrder.totalAmount
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold mb-2">
                                                            Update Status
                                                        </h4>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setPendingOrder(
                                                                    selectedOrder
                                                                );
                                                                setShowStatusDialog(
                                                                    true
                                                                );
                                                                setPendingStatus(
                                                                    selectedOrder.status
                                                                );
                                                            }}
                                                        >
                                                            Change Status
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>

                                    {/* For shipped/delivered rows we show extra action buttons */}
                                    {order.status === "shipped" ||
                                    order.status === "delivered" ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    // track order: open tracking URL if available, else nothing
                                                    const t = parseTracking(
                                                        order.trackingInfo
                                                    );
                                                    if (t?.trackingUrl) {
                                                        window.open(
                                                            t.trackingUrl,
                                                            "_blank"
                                                        );
                                                    } else if (t?.waybill) {
                                                        // fallback to external delhivery url if you have env var
                                                        const base =
                                                            process.env
                                                                .NEXT_PUBLIC_DELHIVERY_WAYBILL_URL ||
                                                            "https://delhivery.com/track/package/";
                                                        window.open(
                                                            `${base}${t.waybill}`,
                                                            "_blank"
                                                        );
                                                    } else {
                                                        toast({
                                                            title: "No tracking available",
                                                        });
                                                    }
                                                }}
                                            >
                                                Track Order
                                            </Button>
                                            {order.status === "shipped" ||
                                            order.status === "delivered" ? (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            const t =
                                                                parseTracking(
                                                                    order.trackingInfo
                                                                );
                                                            if (!t?.waybill) {
                                                                toast({
                                                                    title: "Waybill not found",
                                                                    description:
                                                                        "Waybill ID missing for this order",
                                                                    variant:
                                                                        "destructive",
                                                                });
                                                                return;
                                                            }
                                                            generateLabel(
                                                                t.waybill
                                                            );
                                                        }}
                                                    >
                                                        Generate Label
                                                    </Button>
                                                </>
                                            ) : null}
                                        </>
                                    ) : (
                                        // confirmed / processing: show only Track Order & View Shipment as disabled (or not show)
                                        <></>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );

    // Status change confirmation dialog
    const statusDialog = (
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Order Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Status</Label>
                        <Select
                            value={pendingStatus}
                            onValueChange={setPendingStatus}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payment_pending">
                                    Payment Pending
                                </SelectItem>
                                <SelectItem value="confirmed">
                                    Confirmed
                                </SelectItem>
                                <SelectItem value="processing">
                                    Processing
                                </SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">
                                    Delivered
                                </SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {pendingStatus === "shipped" && (
                        <div className="space-y-2">
                            <Label htmlFor="trackingNumber">
                                Tracking Number
                            </Label>
                            <Input
                                id="trackingNumber"
                                value={trackingInfo.trackingNumber}
                                onChange={(e) =>
                                    setTrackingInfo({
                                        ...trackingInfo,
                                        trackingNumber: e.target.value,
                                    })
                                }
                                placeholder="Enter tracking number"
                            />
                            <Label htmlFor="trackingLink">Tracking Link</Label>
                            <Input
                                id="trackingLink"
                                value={trackingInfo.trackingLink}
                                onChange={(e) =>
                                    setTrackingInfo({
                                        ...trackingInfo,
                                        trackingLink: e.target.value,
                                    })
                                }
                                placeholder="Enter tracking URL"
                            />
                            <Label htmlFor="carrier">Carrier</Label>
                            <Input
                                id="carrier"
                                value={trackingInfo.carrier}
                                onChange={(e) =>
                                    setTrackingInfo({
                                        ...trackingInfo,
                                        carrier: e.target.value,
                                    })
                                }
                                placeholder="Enter carrier name"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="notifyCustomer"
                            checked={notifyCustomer}
                            onChange={() => setNotifyCustomer((v) => !v)}
                            className="accent-primary"
                        />
                        <Label htmlFor="notifyCustomer">
                            Notify customer about this status change
                        </Label>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isUpdating}
                            onClick={async () => {
                                if (!pendingOrder) return;
                                setIsUpdating(true);
                                try {
                                    if (pendingStatus === "shipped") {
                                        if (
                                            !trackingInfo.trackingNumber ||
                                            !trackingInfo.carrier
                                        ) {
                                            toast({
                                                title: "Tracking info required",
                                                description:
                                                    "Please provide tracking number and carrier.",
                                                variant: "destructive",
                                            });
                                            setIsUpdating(false);
                                            return;
                                        }
                                        await updateOrderStatus(
                                            pendingOrder.id,
                                            "shipped"
                                        );
                                    } else {
                                        await updateOrderStatus(
                                            pendingOrder.id,
                                            pendingStatus
                                        );
                                    }

                                    setShowStatusDialog(false);
                                    setIsDialogOpen(false);
                                    setPendingOrder(null);
                                    await fetchOrders();
                                } finally {
                                    setIsUpdating(false);
                                }
                            }}
                            className="bg-primary text-white"
                        >
                            {isUpdating ? "Updating..." : "Confirm & Update"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Manage Orders</h2>
            <div className="mb-6">
                <Link href="/admin">
                    <Button variant="ghost" className="p-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
            </div>

            {statusDialog}

            {renderOrdersTable(
                confirmedOrders,
                "Confirmed & Processing Orders",
                "bg-blue-50",
                false
            )}

            {renderOrdersTable(
                shippedOrders,
                "Shipped Orders",
                "bg-purple-50",
                true
            )}

            {renderOrdersTable(
                deliveredOrders,
                "Delivered Orders",
                "bg-green-50",
                true
            )}
        </div>
    );
}
