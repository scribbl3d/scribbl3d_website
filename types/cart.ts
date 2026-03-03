import { LucideIcon } from "lucide-react";

export type CartItem = {
    id: string;
    sourceId?: string;
    itemType: "product" | "prebuilt" | "printer" | "resin" | "unknown";
    name: string;
    price: number;
    quantity: number;
    images: string[];
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    customization?: string | null;
    weight?: string | null;
    machineDimensionLength?: number | null;
    machineDimensionWidth?: number | null;
    machineDimensionHeight?: number | null;
};

export interface ShippingOption {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
    icon: LucideIcon;
}

export interface Cart {
    items: CartItem[];
}
