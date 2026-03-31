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
    onDownloadInvoice(order: Order): Promise<void>; // ← new
}

/* =========================================================
   COMPONENT
   ========================================================= */
export function DeliveredTab({ orders, onView, onDownloadInvoice }: Props) {
    /* ---------- SEARCH ---------- */
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<
        "customer" | "amount" | "transaction" | "orderId"
    >("customer");

    /* ---------- PAGINATION ---------- */
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    /* ---------- PER-ROW LOADING STATE ---------- */
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

    /* ---------- RESET PAGE ---------- */
    useEffect(() => {
        setPage(1);
    }, [search, filterBy, orders]);

    /* ---------- PAGINATED DATA ---------- */
    const paginatedOrders = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, page]);

    /* ---------- DOWNLOAD HANDLER ---------- */
    async function handleInvoiceClick(order: Order) {
        if (downloadingId) return;
        setDownloadingId(order.id);
        try {
            await onDownloadInvoice(order);
        } finally {
            setDownloadingId(null);
        }
    }

    return (
        <div className="rounded-lg border bg-green-50 p-4">
            <h3 className="text-2xl font-semibold mb-4">Delivered</h3>

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
                                <Badge className="bg-indigo-500 capitalize">
                                    delivered
                                </Badge>
                            </TableCell>

                            <TableCell>{order.paymentMethod || "—"}</TableCell>

                            <TableCell>{formatDate(order.createdAt)}</TableCell>

                            <TableCell className="text-right">
                                <div className="flex flex-col gap-2 items-end">
                                    <ActionButton
                                        variant="outline"
                                        onClick={() => onView(order)}
                                    >
                                        View Details
                                    </ActionButton>

                                    {/* ── TAX INVOICE ── */}
                                    <ActionButton
                                        variant="outline"
                                        disabled={downloadingId === order.id}
                                        onClick={() =>
                                            handleInvoiceClick(order)
                                        }
                                    >
                                        {downloadingId === order.id
                                            ? "Generating…"
                                            : "Tax Invoice"}
                                    </ActionButton>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {!paginatedOrders.length && (
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
