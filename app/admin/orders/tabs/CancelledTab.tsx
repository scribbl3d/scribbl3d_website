"use client";

import { Badge } from "@/components/ui/badge";
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

interface Props {
    orders: Order[];
    onView(order: Order): void;
}

function getRefundStatusColor(status?: string) {
    switch (status) {
        case "success":
            return "bg-orange-500";
        case "pending":
            return "bg-yellow-500";
        case "failed":
            return "bg-red-500";
        default:
            return "bg-gray-400";
    }
}

export function CancelledTab({ orders, onView }: Props) {
    return (
        <div className="rounded-lg border bg-red-50 p-4">
            <h3 className="text-2xl font-semibold mb-4">Cancelled Orders</h3>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Refund Status</TableHead>
                        <TableHead>Refund ID</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Refund Initiated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {orders.map((order) => (
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
                                    className={`${getRefundStatusColor(
                                        order.refundStatus,
                                    )} capitalize`}
                                >
                                    {order.refundStatus}
                                </Badge>
                            </TableCell>

                            <TableCell className="font-mono text-sm">
                                {order.refundId || "—"}
                            </TableCell>

                            <TableCell>{order.paymentMethod || "—"}</TableCell>

                            <TableCell>
                                {formatDate(order.refundInitiatedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end">
                                    <ActionButton
                                        variant="outline"
                                        onClick={() => onView(order)}
                                    >
                                        View Details
                                    </ActionButton>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {!orders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground py-6"
                            >
                                No cancelled orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
