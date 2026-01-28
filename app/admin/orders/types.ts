export interface Order {
    id: string;
    items: any[];
    totalAmount: number;
    status: string;
    createdAt?: string;
    shippingMode?: string;
    shippingAddress?: {
        fullName?: string;
        phone?: string | string[];
        city?: string;
        state?: string;
        pincode?: string;
        address?: string;
        country?: string;
        email?: string;
        zipCode?: string;
    };

    shipment?: {
        status?: string;
        waybill?: string;
        provider?: string;
    };

    trackingInfo?: any;

    paymentMethod?: string;
    paymentReference?: string;
    maskedPaymentId?: string;

    refundStatus?: string;
    refundId?: string;
    refundInitiatedAt?: string;

    user?: {
        name?: string;
        email?: string;
        phone?: string;
    };
}
export interface PickupInfo {
    pickupDate: string;
    pickupTime: string;
}
