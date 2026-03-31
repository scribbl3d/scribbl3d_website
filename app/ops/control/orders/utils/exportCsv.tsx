import { Order } from "../types";
import { formatDate } from "./formatters";

function downloadCSV(rows: any[], filename: string) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const csv = [
        headers.join(","),
        ...rows.map((row) =>
            headers
                .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
                .join(","),
        ),
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportPaymentPendingCSV(orders: Order[]) {
    const rows: any[] = [];

    orders.forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : [];

        items.forEach((item) => {
            rows.push({
                order_id: order.id,
                order_date: formatDate(order.createdAt),
                order_status: order.status,
                order_total: order.totalAmount,

                customer_name: order.shippingAddress?.fullName || "",
                customer_email:
                    order.shippingAddress?.email || order.user?.email || "",
                customer_phone: order.shippingAddress?.phone || "",

                payment_method: order.paymentMethod || "",
                payment_reference: order.paymentReference || "",

                address: order.shippingAddress?.address || "",
                city: order.shippingAddress?.city || "",
                state: order.shippingAddress?.state || "",
                pincode: order.shippingAddress?.pincode || "",

                item_name: item.name || "",
                item_size: item.size || "",
                item_color: item.color || "",
                item_quantity: item.quantity || 0,
                item_price: item.price || 0,
                item_total: (item.price || 0) * (item.quantity || 0),
            });
        });
    });

    downloadCSV(rows, "payment_pending_orders.csv");
}
