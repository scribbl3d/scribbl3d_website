"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ActionButton } from "../components/ActionButton";
import { Order } from "../types";
import { formatDate, formatRupees } from "../utils/formatters";

/* =========================================================
   TYPES
   ========================================================= */
interface Props {
    orders: Order[];

    onView(order: Order): void;
    onTrack(order: Order): void;
    onGenerateLabel(order: Order): void;

    onRequestPickup(): void;
    pickupInfo?: {
        pickupDate: string;
        pickupTime: string;
    } | null;
}

/* =========================================================
   HELPERS
   ========================================================= */
function getShipmentStatusColor(status?: string) {
    switch (status) {
        case "manifested":
            return "bg-yellow-500";
        case "not picked":
            return "bg-orange-500";
        case "time pass":
            return "bg-red-500";
        case "picked_up":
        case "in_transit":
            return "bg-blue-500";
        case "delivered":
            return "bg-green-500";
        case "error":
            return "bg-red-600";
        default:
            return "bg-gray-400";
    }
}

function formatPickupDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/* =========================================================
   COMPONENT
   ========================================================= */
export function InTransitTab({
    orders,
    onView,
    onTrack,
    onGenerateLabel,
    onRequestPickup,
    pickupInfo,
}: Props) {
    return (
        <div className="rounded-lg border bg-purple-50 p-4">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">In Transit</h3>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={onRequestPickup}
                        disabled={!!pickupInfo}
                    >
                        Request Pickup
                    </Button>

                    {pickupInfo ? (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            ⏰
                            <span>
                                Scheduled on{" "}
                                <b>{formatPickupDate(pickupInfo.pickupDate)}</b>{" "}
                                at <b>{pickupInfo.pickupTime}</b>
                            </span>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No pickup scheduled
                        </div>
                    )}
                </div>
            </div>

            {/* ================= TABLE ================= */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Shipment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.map((order) => {
                        const shipmentStatus = order.shipment?.status;
                        const waybill =
                            order.shipment?.waybill ||
                            order.trackingInfo?.waybill ||
                            order.trackingInfo?.trackingNumber;

                        return (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">
                                    {order.id.slice(-5)}
                                </TableCell>

                                <TableCell>
                                    {order.shippingAddress?.fullName ||
                                        order.user?.name ||
                                        "Anonymous"}
                                </TableCell>

                                <TableCell>
                                    {formatRupees(order.totalAmount)}
                                </TableCell>

                                {/* ✅ CORRECT STATUS */}
                                <TableCell>
                                    <Badge
                                        className={`${getShipmentStatusColor(
                                            shipmentStatus,
                                        )} capitalize`}
                                    >
                                        {shipmentStatus || "unknown"}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {order.paymentMethod || "—"}
                                </TableCell>

                                <TableCell>
                                    {formatDate(order.createdAt)}
                                </TableCell>

                                <TableCell className="font-mono text-sm">
                                    {waybill || "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col gap-2 items-end">
                                        <ActionButton
                                            variant="outline"
                                            onClick={() => onView(order)}
                                        >
                                            View Details
                                        </ActionButton>

                                        <ActionButton
                                            variant="outline"
                                            onClick={() => onTrack(order)}
                                        >
                                            Track Order
                                        </ActionButton>

                                        <ActionButton
                                            variant="outline"
                                            onClick={() =>
                                                onGenerateLabel(order)
                                            }
                                        >
                                            Generate Label
                                        </ActionButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {!orders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground py-6"
                            >
                                No in-transit shipments found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
