"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Download, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { toast } from "@/components/ui/use-toast";
import { OrdersSearchBar } from "../components/OrdersSearchBar";
import { OrdersTable } from "../components/OrdersTable";
import { Order } from "../types";
import { exportPaymentFailedCSV } from "../utils/exportCsv";

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
export function PaymentFailedTab({ orders, onView }: Props) {
    /* 🔍 SEARCH */
    const [search, setSearch] = useState("");
    const [filterBy, setFilterBy] = useState<
        "customer" | "amount" | "transaction" | "orderId"
    >("customer");

    const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
    const [deleting, setDeleting] = useState(false);

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

    async function handleDelete() {
        if (!deleteOrder) return;

        try {
            setDeleting(true);

            const res = await fetch(`/api/admin/orders/${deleteOrder.id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast({
                title: "Order deleted",
                description: "Payment failed order removed successfully",
            });

            setDeleteOrder(null);
            location.reload();
        } catch (err: any) {
            toast({
                title: "Delete failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setDeleting(false);
        }
    }

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
                title="Payment Failed"
                orders={filteredOrders}
                onView={onView}
                headerAction={
                    <Button
                        variant="outline"
                        onClick={() => exportPaymentFailedCSV(filteredOrders)}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                }
                statusType="order"
                rowActions={(order) => (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-[95px] flex items-center justify-center gap-2"
                        onClick={() => setDeleteOrder(order)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                )}
            />

            {/* ❌ DELETE CONFIRMATION */}
            <Dialog
                open={!!deleteOrder}
                onOpenChange={() => setDeleteOrder(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this payment failed
                            order. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOrder(null)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? "Deleting..." : "Delete Order"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
