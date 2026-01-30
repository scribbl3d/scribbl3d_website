import { useState } from "react";
import { Discount } from "../types";

export function useDiscounts() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    return {
        discounts,
        addDiscount: (d: Discount) => setDiscounts((prev) => [...prev, d]),
    };
}
