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
import { useMemo, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { Order } from "../types";
import { formatDate, formatRupees } from "../utils/formatters";

/* =========================================================
   TYPES
   ========================================================= */
interface Props {
    orders: Order[];
    onView(order: Order): void;
}

/* =========================================================
   COMPONENT
   ========================================================= */
export function DeliveredTab({ orders, onView }: Props) {
    /* 🔍 SEARCH STATE */
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

            if (filterBy === "amount") {
                return String(order.totalAmount).includes(search);
            }

            return true;
        });
    }, [orders, search, filterBy]);

    return (
        <div className="rounded-lg border bg-green-50 p-4">
            <h3 className="text-2xl font-semibold mb-4">Delivered</h3>

            {/* 🔍 SEARCH BAR */}
            <OrdersSearchBar
                search={search}
                onSearchChange={setSearch}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
            />

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
                    {filteredOrders.map((order) => (
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
                                <Badge className="bg-indigo-500 capitalize">
                                    delivered
                                </Badge>
                            </TableCell>

                            <TableCell>{order.paymentMethod || "—"}</TableCell>

                            <TableCell>{formatDate(order.createdAt)}</TableCell>

                            <TableCell className="text-right">
                                <ActionButton
                                    variant="outline"
                                    onClick={() => onView(order)}
                                >
                                    View Details
                                </ActionButton>
                            </TableCell>
                        </TableRow>
                    ))}

                    {!filteredOrders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center text-muted-foreground py-6"
                            >
                                No delivered orders found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
