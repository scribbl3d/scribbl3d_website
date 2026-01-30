export type DiscountScope = "cart" | "item_type";
export type DiscountValueType = "percentage" | "flat";

export type Discount = {
    id: string;
    name: string;
    code: string;

    scope: DiscountScope;
    applicableItemType?: "product" | "prebuilt" | "printer" | "resin";

    valueType: DiscountValueType;
    value: number;

    minCartValue?: number;
    isActive: boolean;
};
