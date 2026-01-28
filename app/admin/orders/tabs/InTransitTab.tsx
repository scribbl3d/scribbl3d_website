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
import { useMemo, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { Order } from "../types";
import { formatDate, formatRupees } from "../utils/formatters";

/* =========================================================
   TYPES
   ========================================================= */
interface PickupInfo {
    pickupDate: string;
    pickupTime: string;
}

interface Props {
    orders: Order[];
    onView(order: Order): void;
    onTrack(order: Order): void;
    onGenerateLabel(order: Order): void;
    onRequestPickup(): void;
    pickupInfo?: PickupInfo[] | null;
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
        case "picked_up":
        case "in transit":
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
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
function getNextValidPickup(
    pickups?:
        | { pickupDate: string; pickupTime: string }[]
        | { pickupDate: string; pickupTime: string }
        | null,
) {
    if (!pickups) return null;

    const pickupArray = Array.isArray(pickups) ? pickups : [pickups];

    const now = new Date();

    const validPickups = pickupArray
        .map((p) => ({
            ...p,
            dateTime: new Date(`${p.pickupDate}T${p.pickupTime}:00`),
        }))
        .filter((p) => !isNaN(p.dateTime.getTime()) && p.dateTime > now)
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    return validPickups.length ? validPickups[0] : null;
}

export function InTransitTab({
    orders,
    onView,
    onTrack,
    onGenerateLabel,
    onRequestPickup,
    pickupInfo,
}: Props) {
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<"customer" | "amount">("customer");

    const filteredOrders = useMemo(() => {
        if (!search) return orders;

        return orders.filter((order) => {
            if (filterBy === "customer") {
                const name =
                    order.shippingAddress?.fullName || order.user?.name || "";
                return name.toLowerCase().includes(search.toLowerCase());
            }

            return String(order.totalAmount).includes(search);
        });
    }, [orders, search, filterBy]);

    const nextPickup = useMemo(
        () => getNextValidPickup(pickupInfo),
        [pickupInfo],
    );

    return (
        <div className="rounded-lg border bg-purple-50 p-4">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">In Transit</h3>

                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onRequestPickup}>
                        Request Pickup
                    </Button>

                    {nextPickup ? (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            ⏰
                            <span>
                                Scheduled on{" "}
                                <b>{formatPickupDate(nextPickup.pickupDate)}</b>{" "}
                                at <b>{nextPickup.pickupTime}</b>
                            </span>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No Pickup Scheduled
                        </div>
                    )}
                </div>
            </div>

            {/* 🔍 SEARCH */}
            <OrdersSearchBar
                search={search}
                onSearchChange={setSearch}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
            />

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
                    {filteredOrders.map((order) => {
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

                    {!filteredOrders.length && (
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
