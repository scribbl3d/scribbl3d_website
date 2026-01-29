"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { OrdersTable } from "../components/OrdersTable";
import { TablePagination } from "../components/TablePagination";

import { Order } from "../types";
import { exportPaymentPendingCSV } from "../utils/exportCsv";

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
export function PaymentPendingTab({ orders, onView }: Props) {
    /* ---------- SEARCH ---------- */
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<"customer" | "amount">("customer");

    /* ---------- PAGINATION ---------- */
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    /* ---------- FILTER ---------- */
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
        <div className="space-y-4">
            {/* ================= SEARCH ================= */}
            <OrdersSearchBar
                search={search}
                onSearchChange={setSearch}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
            />

            {/* ================= TABLE ================= */}
            <OrdersTable
                title="Payment Pending"
                orders={paginatedOrders}
                onView={onView}
                statusType="order"
                headerAction={
                    <Button
                        variant="outline"
                        onClick={() => exportPaymentPendingCSV(filteredOrders)}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                }
            />

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
