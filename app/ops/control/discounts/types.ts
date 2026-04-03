export type DiscountItemType = {
    id: string;
    discountId: string;
    itemType: "product" | "prebuilt" | "printer" | "resin";
};

export type Discount = {
    id: string;
    name: string;
    code: string;
    scope: "cart" | "item_type";
    valueType: "percentage" | "flat";
    value: number;
    minOrderValue: number | null;
    maxDiscount: number | null;
    expiresAt: string | null;
    isHidden: boolean;
    isActive: boolean;
    firstOrderOnly: boolean;
    maxUsesPerUser: number | null;
    itemTypes: DiscountItemType[];
    createdAt: string;
    updatedAt: string;
};
