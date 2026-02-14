import type { LucideIcon } from "lucide-react";

export interface ShippingDetails {
    email: string;
    phone: string;
    fullName: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    newsletter: boolean;
    saveInfo: boolean;

    // GSTIN Billing
    wantsGstInvoice: boolean;
    gstin?: string;
    gstCompanyName?: string;
    gstAddress?: string;
}

export interface ShippingOption {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
    icon: LucideIcon;
}

export interface CheckoutState {
    step: number;
    shippingDetails: ShippingDetails | null;
    selectedShipping: ShippingOption | null;
    pricing: {
        subtotal: number;
        discountAmount: number;
        appliedDiscountCode?: string;
        tax: number;
    } | null;
}

// New types for additional functionality

export interface ContentItem {
    icon?: LucideIcon;
    text: string;
}

export interface Section {
    title: string;
    icon: LucideIcon;
    content: ContentItem[];
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    images?: string[];
    color?: string;
    size?: string;
    customization?: boolean;
}

export interface Order {
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}
