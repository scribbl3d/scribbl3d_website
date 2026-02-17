"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { getNextValidPickup } from "@/lib/pickup/getNextValidPickup";
import { ActionButton } from "../components/ActionButton";
import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { TablePagination } from "../components/TablePagination";

import { ChevronDown, Package } from "lucide-react";
import { Order, PickupInfo } from "../types";
import { formatDate, formatRupees } from "../utils/formatters";

/* =========================================================
   TYPES
   ========================================================= */
interface Props {
    orders: Order[];
    onView(order: Order): void;
    onTrack(order: Order): void;
    onGenerateLabel(order: Order, waybill?: string): void;
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

/**
 * Check if order has MPS (multiple packages)
 */
function isMPSOrder(order: Order): boolean {
    return (
        order.shipment?.shipmentType === "MPS" ||
        (order.shipments && order.shipments.length > 1) ||
        order.trackingInfo?.shipmentType === "MPS"
    );
}

/**
 * Get package count for order
 */
function getPackageCount(order: Order): number {
    if (order.shipments && order.shipments.length > 0) {
        return order.shipments.length;
    }
    if (order.shipment?.packageCount) {
        return order.shipment.packageCount;
    }
    if (order.trackingInfo?.packageCount) {
        return order.trackingInfo.packageCount;
    }
    return 1;
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
    /* ---------- SEARCH ---------- */
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<
        "customer" | "amount" | "transaction" | "orderId"
    >("customer");

    /* ---------- PAGINATION ---------- */
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    /* ---------- FILTER ---------- */
    const filteredOrders = useMemo(() => {
        if (!search) return orders;

        const q = search.toLowerCase().trim();

        return orders.filter((order) => {
            if (filterBy === "customer") {
                const name =
                    order.shippingAddress?.fullName || order.user?.name || "";
                return name.toLowerCase().includes(q);
            }

            if (filterBy === "amount") {
                return String(order.totalAmount).includes(q);
            }

            if (filterBy === "orderId") {
                return order.id.toLowerCase().includes(q);
            }

            if (filterBy === "transaction") {
                return (
                    order.transactionId &&
                    order.transactionId.toLowerCase().includes(q)
                );
            }

            return true;
        });
    }, [orders, search, filterBy]);

    /* ---------- RESET PAGE ON FILTER CHANGE ---------- */
    useEffect(() => {
        setPage(1);
    }, [search, filterBy, orders]);

    /* ---------- PAGINATED DATA ---------- */
    const paginatedOrders = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, page]);

    /* ---------- PICKUP LOGIC ---------- */
    const nextPickup = useMemo(
        () => getNextValidPickup(pickupInfo),
        [pickupInfo],
    );

    return (
        <div className="rounded-xl border bg-background p-6 shadow-sm">
            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-2xl font-semibold">In Transit</h3>

                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={onRequestPickup}>
                        Request Pickup
                    </Button>

                    {nextPickup ? (
                        <div className="text-sm text-muted-foreground">
                            ⏰ Scheduled on{" "}
                            <b>{formatPickupDate(nextPickup.pickupDate)}</b> at{" "}
                            <b>{nextPickup.pickupTime}</b>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            No upcoming pickup scheduled
                        </div>
                    )}
                </div>
            </div>

            {/* ================= SEARCH ================= */}
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
                    {paginatedOrders.map((order) => {
                        const masterShipment =
                            order.shipment ||
                            order.shipments?.find((s) => s.isMaster);
                        const shipmentStatus = masterShipment?.status;
                        const waybill =
                            masterShipment?.waybill ||
                            order.trackingInfo?.waybill;

                        const isMPS = isMPSOrder(order);
                        const packageCount = getPackageCount(order);

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
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`${getShipmentStatusColor(
                                                shipmentStatus,
                                            )} capitalize`}
                                        >
                                            {shipmentStatus || "unknown"}
                                        </Badge>
                                        {isMPS && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                <Package className="w-3 h-3 mr-1" />
                                                {packageCount} pkgs
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {order.paymentMethod || "—"}
                                </TableCell>

                                <TableCell>
                                    {formatDate(order.createdAt)}
                                </TableCell>

                                <TableCell className="font-mono text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span>{waybill || "—"}</span>
                                        {isMPS && (
                                            <span className="text-xs text-muted-foreground">
                                                +{packageCount - 1} more
                                            </span>
                                        )}
                                    </div>
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

                                        {/* Label generation - different UI for MPS vs SPS */}
                                        {isMPS ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Generate Labels
                                                        <ChevronDown className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onGenerateLabel(
                                                                order,
                                                            )
                                                        }
                                                    >
                                                        <Package className="w-4 h-4 mr-2" />
                                                        All Labels (
                                                        {packageCount})
                                                    </DropdownMenuItem>

                                                    {/* Individual package labels */}
                                                    {order.shipments?.map(
                                                        (shipment, idx) => (
                                                            <DropdownMenuItem
                                                                key={
                                                                    shipment.waybill ||
                                                                    idx
                                                                }
                                                                onClick={() =>
                                                                    shipment.waybill &&
                                                                    onGenerateLabel(
                                                                        order,
                                                                        shipment.waybill,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !shipment.waybill
                                                                }
                                                            >
                                                                {shipment.isMaster
                                                                    ? "📦 Master: "
                                                                    : "📦 Package: "}
                                                                {shipment.waybill?.slice(
                                                                    -6,
                                                                ) || "—"}
                                                            </DropdownMenuItem>
                                                        ),
                                                    )}

                                                    {/* Fallback if shipments not loaded but we know it's MPS */}
                                                    {(!order.shipments ||
                                                        order.shipments
                                                            .length === 0) && (
                                                        <>
                                                            {waybill && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        onGenerateLabel(
                                                                            order,
                                                                            waybill,
                                                                        )
                                                                    }
                                                                >
                                                                    📦 Master:{" "}
                                                                    {waybill.slice(
                                                                        -6,
                                                                    )}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.trackingInfo?.childWaybills?.map(
                                                                (
                                                                    cw: string,
                                                                ) => (
                                                                    <DropdownMenuItem
                                                                        key={cw}
                                                                        onClick={() =>
                                                                            onGenerateLabel(
                                                                                order,
                                                                                cw,
                                                                            )
                                                                        }
                                                                    >
                                                                        📦
                                                                        Package:{" "}
                                                                        {cw.slice(
                                                                            -6,
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                ),
                                                            )}
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <ActionButton
                                                variant="outline"
                                                onClick={() =>
                                                    onGenerateLabel(order)
                                                }
                                            >
                                                Generate Label
                                            </ActionButton>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {!paginatedOrders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground py-8"
                            >
                                No in-transit shipments found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* ================= PAGINATION ================= */}
            <TablePagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filteredOrders.length}
                onPageChange={setPage}
            />
        </div>
    );
}
