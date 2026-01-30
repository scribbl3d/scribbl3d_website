"use client";

import { useEffect, useMemo, useState } from "react";

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
import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { TablePagination } from "../components/TablePagination";

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
   HELPERS
   ========================================================= */
function getRefundStatusColor(status?: string) {
    switch (status) {
        case "success":
            return "bg-green-500";
        case "initiated":
            return "bg-yellow-500";
        case "failed":
            return "bg-red-500";
        default:
            return "bg-gray-400";
    }
}

/* =========================================================
   COMPONENT
   ========================================================= */
export function CancelledTab({ orders, onView }: Props) {
    /* ---------- SEARCH ---------- */
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<
        "customer" | "amount" | "transaction"
    >("customer");

    /* ---------- PAGINATION ---------- */
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    /* ---------- FILTER ---------- */
    const filteredOrders = useMemo(() => {
        if (!search) return orders;

        const q = search.toLowerCase();

        return orders.filter((order) => {
            if (filterBy === "customer") {
                const name =
                    order.shippingAddress?.fullName || order.user?.name || "";
                return name.toLowerCase().includes(q);
            }

            if (filterBy === "amount") {
                return String(order.totalAmount).includes(q);
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

    /* ---------- RESET PAGE ---------- */
    useEffect(() => {
        setPage(1);
    }, [search, filterBy, orders]);

    /* ---------- PAGINATED DATA ---------- */
    const paginatedOrders = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, page]);

    return (
        <div className="rounded-xl border bg-background p-6 shadow-sm">
            <h3 className="text-2xl font-semibold mb-4">Cancelled Orders</h3>

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
                        <TableHead>Refund Status</TableHead>
                        <TableHead>Refund ID</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Refund Initiated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paginatedOrders.map((order) => (
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
                                    {order.refundStatus || "unknown"}
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
                                <ActionButton
                                    variant="outline"
                                    onClick={() => onView(order)}
                                >
                                    View Details
                                </ActionButton>
                            </TableCell>
                        </TableRow>
                    ))}

                    {!paginatedOrders.length && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground py-8"
                            >
                                No cancelled orders found.
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
