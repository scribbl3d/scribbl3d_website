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
}

export function OrdersTable({
    title,
    orders,
    onView,
    headerAction,
    statusType = "order",
}: Props) {
    return (
        <div className="rounded-lg border bg-yellow-50 p-4">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold">{title}</h3>
                {headerAction}
            </div>

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
                                    <Badge className="bg-yellow-500 capitalize">
                                        {status?.replace(/_/g, " ") ||
                                            "unknown"}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {order.paymentMethod || "—"}
                                </TableCell>

                                <TableCell>
                                    {formatDate(order.createdAt)}
                                </TableCell>

                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        onClick={() => onView(order)}
                                    >
                                        View Details
                                    </Button>
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
