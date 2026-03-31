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

    // Single shipment (backward compatibility / master shipment)
    shipment?: {
        status?: string;
        waybill?: string;
        provider?: string;
        shipmentType?: string; // "SPS" | "MPS"
        isMaster?: boolean;
        packageCount?: number;
    };
    billingAddress?: {
        wantsGstInvoice?: boolean;
        gstin?: string;
        gstCompanyName?: string;
        gstAddress?: string;
        [key: string]: any; // allows other fields from shippingDetails
    };

    // Multiple shipments (for MPS)
    shipments?: Array<{
        status?: string;
        waybill?: string;
        provider?: string;
        shipmentType?: string;
        isMaster?: boolean;
        masterWaybill?: string;
    }>;

    trackingInfo?: {
        waybill?: string;
        trackingUrl?: string;
        provider?: string;
        shipmentType?: string; // "SPS" | "MPS"
        masterWaybill?: string;
        childWaybills?: string[];
        packageCount?: number;
    };

    paymentMethod?: string;
    paymentReference?: string;
    maskedPaymentId?: string;
    transactionId?: string;

    refundStatus?: string;
    refundId?: string;
    refundInitiatedAt?: string;
    invoice?: {
        id: string;
        creditNotes?: {
            id: string;
            creditNoteNumber: string;
        }[];
    };

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
