"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { OrdersTable } from "../components/OrdersTable";
import { Order } from "../types";
import { exportPaymentPendingCSV } from "../utils/exportCsv";

interface Props {
    orders: Order[];
    onView(order: Order): void;
}

export function PaymentPendingTab({ orders, onView }: Props) {
    return (
        <OrdersTable
            title="Payment Pending"
            orders={orders}
            onView={onView}
            headerAction={
                <Button
                    variant="outline"
                    onClick={() => exportPaymentPendingCSV(orders)}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            }
            statusType="order"
        />
    );
}
