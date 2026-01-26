import { Order } from "../types";

export const paymentPending = (o: Order) => o.status === "payment_pending";

export const confirmedProcessing = (o: Order) =>
    (o.status === "confirmed" || o.status === "processing") &&
    !o.shipment?.waybill;

export const inTransit = (o: Order) => {
    if (!o.shipment) return false;

    if (o.shipment.status === "delivered") return false;

    if (o.status === "cancelled") return false;

    return true;
};
export const delivered = (o: Order) => {
    if (o.shipment?.status === "delivered") return true;

    if (o.status === "delivered") return true;

    return false;
};
export const cancelled = (o: Order) => {
    return o.status === "cancelled";
};
