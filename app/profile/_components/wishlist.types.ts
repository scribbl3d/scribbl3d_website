export type WishlistGridItem = {
    id: string;
    itemType: "printer" | "resin" | "prebuilt" | "product";
    title: string;
    image: string | null;
    badge: string | null;
    price: number;
    originalPrice: number | null;
    requiresOptions: boolean;
    slug: string | null;
    cartPayload: Record<string, string>;

    /* 🧪 RESIN ONLY */
    resinColours?: {
        id: string;
        name: string;
        hex: string | null;
        image: string | null;
    }[];

    resinWeights?: {
        id: string;
        label: string;
        price: number;
        originalPrice: number;
    }[];

    availableVariants?: {
        id: string;
        colorName: string | null;
        colorHex: string | null;
        sizeName: string | null;
        price: number;
        originalPrice: number;
        isActive: boolean;
    }[];
};
