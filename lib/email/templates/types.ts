// Shared types used across email templates

export interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    subtotal: number;
    discountAmount?: number;
    discountCode?: string;
    tax?: number;
    shippingPrice?: number;
    totalAmount: number;
    shippingAddress: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };
    paymentMethod?: string;
}

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image?: string;
    variant?: string; // e.g. "Blue / 500g"
}

export interface ShipmentEmailData extends OrderEmailData {
    waybill: string;
    trackingUrl: string;
    provider: string;
    estimatedDelivery?: string;
}

export interface CancelEmailData extends OrderEmailData {
    cancelledBy: "customer" | "admin";
    cancellationReason?: string;
    refundStatus?: string;
    refundAmount?: number;
}
