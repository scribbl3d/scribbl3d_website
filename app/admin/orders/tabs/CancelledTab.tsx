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
export function CancelledTab({ orders, onView, onDownloadInvoice }: Props) {
    /* ---------- SEARCH ---------- */
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<"customer" | "amount" | "transaction" | "orderId">("customer");

    /* ---------- PAGINATION ---------- */
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    /* ---------- PER-ROW LOADING STATES ---------- */
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [downloadingCNId, setDownloadingCNId] = useState<string | null>(null);
    const [downloadingInvId, setDownloadingInvId] = useState<string | null>(
        null,
    );

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
            if (filterBy === "amount")
                return String(order.totalAmount).includes(q);
            if (filterBy === "orderId")
                return order.id.toLowerCase().includes(q);
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

    /* ---------- GENERATE CREDIT NOTE ---------- */
    async function handleGenerateCreditNote(order: Order) {
        if (generatingId || downloadingCNId) return;
        setGeneratingId(order.id);
        try {
            const res = await fetch("/api/admin/credit-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    amount: order.totalAmount,
                    reason: "Order cancelled",
                }),
            });
            if (!res.ok) throw new Error("Failed to generate credit note");
            const creditNote = await res.json();
            await downloadCreditNotePdf(creditNote.id, order.id);
        } catch (err) {
            console.error(err);
            alert("Failed to generate credit note");
        } finally {
            setGeneratingId(null);
        }
    }

    /* ---------- DOWNLOAD EXISTING CREDIT NOTE ---------- */
    async function handleDownloadCreditNote(order: Order) {
        if (generatingId || downloadingCNId) return;
        const creditNoteId = order.invoice?.creditNotes?.[0]?.id;
        if (!creditNoteId) return;
        setDownloadingCNId(order.id);
        try {
            await downloadCreditNotePdf(creditNoteId, order.id);
        } catch (err) {
            console.error(err);
            alert("Failed to download credit note");
        } finally {
            setDownloadingCNId(null);
        }
    }

    /* ---------- SHARED PDF DOWNLOAD ---------- */
    async function downloadCreditNotePdf(
        creditNoteId: string,
        orderId: string,
    ) {
        const res = await fetch(`/api/admin/credit-notes/${creditNoteId}`);
        if (!res.ok) throw new Error("Failed to fetch credit note PDF");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const disposition = res.headers.get("Content-Disposition");
        const match = disposition?.match(/filename="(.+)"/);
        a.download = match?.[1] || `CreditNote_${orderId}.pdf`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ---------- DOWNLOAD INVOICE ---------- */
    async function handleInvoiceClick(order: Order) {
        if (downloadingInvId) return;
        setDownloadingInvId(order.id);
        try {
            await onDownloadInvoice(order);
        } finally {
            setDownloadingInvId(null);
        }
    }

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
                    {paginatedOrders.map((order) => {
                        const hasCreditNote =
                            !!order.invoice?.creditNotes?.length;
                        const isGenerating = generatingId === order.id;
                        const isDLCN = downloadingCNId === order.id;
                        const isDLInv = downloadingInvId === order.id;
                        const anyBusy = !!(
                            generatingId ||
                            downloadingCNId ||
                            downloadingInvId
                        );

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
                                        className={`${getRefundStatusColor(order.refundStatus)} capitalize`}
                                    >
                                        {order.refundStatus || "unknown"}
                                    </Badge>
                                </TableCell>

                                <TableCell className="font-mono text-sm">
                                    {order.refundId || "—"}
                                </TableCell>

                                <TableCell>
                                    {order.paymentMethod || "—"}
                                </TableCell>

                                <TableCell>
                                    {formatDate(order.refundInitiatedAt)}
                                </TableCell>

                                {/* ── ACTIONS ── */}
                                <TableCell className="text-right">
                                    <div className="flex flex-col gap-2 items-end min-w-[160px]">
                                        {/* View Details */}
                                        <ActionButton
                                            variant="outline"
                                            className="w-full justify-center"
                                            onClick={() => onView(order)}
                                        >
                                            View Details
                                        </ActionButton>

                                        {/* Tax Invoice */}
                                        <ActionButton
                                            variant="outline"
                                            className="w-full justify-center"
                                            disabled={isDLInv || anyBusy}
                                            onClick={() =>
                                                handleInvoiceClick(order)
                                            }
                                        >
                                            {isDLInv
                                                ? "Generating…"
                                                : "Tax Invoice"}
                                        </ActionButton>

                                        {/* Credit Note — only when refund exists */}
                                        {order.refundStatus &&
                                            (hasCreditNote ? (
                                                <ActionButton
                                                    variant="secondary"
                                                    className="w-full justify-center"
                                                    disabled={isDLCN || anyBusy}
                                                    onClick={() =>
                                                        handleDownloadCreditNote(
                                                            order,
                                                        )
                                                    }
                                                >
                                                    {isDLCN
                                                        ? "Downloading…"
                                                        : "Download Credit Note"}
                                                </ActionButton>
                                            ) : (
                                                <ActionButton
                                                    variant="secondary"
                                                    className="w-full justify-center"
                                                    disabled={
                                                        isGenerating || anyBusy
                                                    }
                                                    onClick={() =>
                                                        handleGenerateCreditNote(
                                                            order,
                                                        )
                                                    }
                                                >
                                                    {isGenerating
                                                        ? "Generating…"
                                                        : "Generate Credit Note"}
                                                </ActionButton>
                                            ))}
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
