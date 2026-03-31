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
import { Order } from "../types";
import { formatDate, formatRupees } from "../utils/formatters";

interface Props {
    title: string;
    orders: Order[];
    onView(order: Order): void;
    headerAction?: React.ReactNode;
    statusType?: "order" | "shipment";

    /* ✅ NEW */
    rowActions?: (order: Order) => React.ReactNode;
}

export function OrdersTable({
    title,
    orders,
    onView,
    headerAction,
    statusType = "order",
    rowActions,
}: Props) {
    return (
        <div className="rounded-lg border bg-yellow-50 p-4">
            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <h3 className="text-2xl font-semibold">{title}</h3>
                {headerAction}
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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.map((order) => {
                        const status =
                            statusType === "shipment"
                                ? order.shipment?.status
                                : order.status;

                        return (
                            <TableRow key={order.id}>
                                {/* ORDER ID */}
                                <TableCell className="font-mono">
                                    {order.id.slice(-5)}
                                </TableCell>

                                {/* CUSTOMER */}
                                <TableCell>
                                    {order.shippingAddress?.fullName ||
                                        order.user?.name ||
                                        "Anonymous"}
                                </TableCell>

                                {/* AMOUNT */}
                                <TableCell>
                                    {formatRupees(order.totalAmount)}
                                </TableCell>

                                {/* STATUS */}
                                <TableCell>
                                    <Badge className="bg-yellow-500 capitalize">
                                        {status?.replace(/_/g, " ") ||
                                            "unknown"}
                                    </Badge>
                                </TableCell>

                                {/* PAYMENT */}
                                <TableCell>
                                    {order.paymentMethod || "—"}
                                </TableCell>

                                {/* DATE */}
                                <TableCell>
                                    {formatDate(order.createdAt)}
                                </TableCell>

                                {/* ACTIONS */}
                                <TableCell className="text-right">
                                    <div className="flex flex-col gap-2 items-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onView(order)}
                                        >
                                            View Details
                                        </Button>

                                        {/* ✅ EXTRA ACTIONS (Delete, Refund, etc.) */}
                                        {rowActions && rowActions(order)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {!orders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center text-muted-foreground py-6"
                            >
                                No orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
