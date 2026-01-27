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
    onCreateShipment(order: Order): void;
    onCancel(order: Order): void;
}

export function ConfirmedProcessingTab({
    orders,
    onView,
    onCreateShipment,
    onCancel,
}: Props) {
    return (
        <div className="rounded-xl border bg-background p-6 shadow-sm">
            {/* HEADER */}
            <h3 className="text-2xl font-semibold mb-5">
                Confirmed & Processing
            </h3>

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
                    {orders.map((order) => (
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
                                <Badge
                                    variant="secondary"
                                    className={
                                        order.status === "confirmed"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "processing"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-muted text-foreground"
                                    }
                                >
                                    {order.status}
                                </Badge>
                            </TableCell>

                            {/* PAYMENT */}
                            <TableCell>{order.paymentMethod || "—"}</TableCell>

                            {/* DATE */}
                            <TableCell>{formatDate(order.createdAt)}</TableCell>

                            {/* ACTIONS */}
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
                                        onClick={() => onCreateShipment(order)}
                                    >
                                        Create Shipment
                                    </ActionButton>

                                    <ActionButton
                                        variant="destructive"
                                        onClick={() => onCancel(order)}
                                    >
                                        Cancel Order
                                    </ActionButton>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {!orders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center text-muted-foreground py-8"
                            >
                                No confirmed or processing orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
