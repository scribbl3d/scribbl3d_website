"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { OrdersTable } from "../components/OrdersTable";
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
        <div className="space-y-4">
            {/* 🔍 SEARCH BAR */}
            <OrdersSearchBar
                search={search}
                onSearchChange={setSearch}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
            />

            <OrdersTable
                title="Payment Pending"
                orders={filteredOrders}
                onView={onView}
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
                statusType="order"
            />
        </div>
    );
}
