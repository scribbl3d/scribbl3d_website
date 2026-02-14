"use client";

import type { Discount } from "@/app/admin/discounts/types";
import { calculateDiscount } from "@/app/cart/utils/calculateDiscount";
import { useSession } from "next-auth/react";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

/* =========================
   TYPES
========================= */

export type CartItem = {
    id: string;
    sourceId?: string; // Original product/printer/resin/prebuilt ID
    itemType: "product" | "prebuilt" | "printer" | "resin" | "unknown";
    name: string;
    price: number;
    quantity: number;
    images: string[];
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    prebuiltColour?: string | null;
    prebuiltSize?: string | null;
    customization?: string | null;
    weight?: string | null;

    machineDimensionLength?: number | null; // mm
    machineDimensionWidth?: number | null; // mm
    machineDimensionHeight?: number | null; // mm
};

export type AddToCartPayload = {
    productId?: string;
    prebuiltProductId?: string;
    printerId?: string;
    resinId?: string;
    resinColourId?: string;
    resinWeightId?: string;
    prebuiltColour?: string;
    prebuiltSize?: string;
    quantity?: number;
};

type CartContextType = {
    cart: CartItem[];

    /* 🔒 PRICING */
    discountAmount: number;
    appliedDiscountCode?: string;

    /* ACTIONS */
    applyDiscountCode: (code: string) => Promise<void>;
    clearDiscount: () => void;

    addToCart: (payload: AddToCartPayload) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    updateCustomization: (id: string, customization: string) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
};

/* =========================
   CONTEXT
========================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within CartProvider");
    }
    return ctx;
};

/* =========================
   PROVIDER
========================= */

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedDiscountCode, setAppliedDiscountCode] = useState<
        string | undefined
    >(undefined);

    const { data: session } = useSession();

    /* =========================
       FETCH CART
    ========================= */

    const fetchCart = useCallback(async () => {
        if (!session) return;

        try {
            const res = await fetch("/api/cart");
            if (!res.ok) return;

            const data = await res.json();
            setCart(data.items ?? []);
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            setCart([]);
        }
    }, [session]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /* =========================
       APPLY DISCOUNT
    ========================= */

    const applyDiscountCode = async (code: string) => {
        const res = await fetch(
            `/api/discounts/apply?code=${encodeURIComponent(code)}`,
        );

        if (!res.ok) {
            throw new Error("Invalid discount code");
        }

        const discount: Discount = await res.json();

        // For scoped discounts (item_type), only calculate on matching items
        // discount.itemTypes is an array of { itemType: "printer" | "product" | ... }
        let applicableSubtotal: number;

        if (discount.scope === "item_type" && discount.itemTypes?.length > 0) {
            const allowedTypes = discount.itemTypes.map(
                (t: { itemType: string }) => t.itemType,
            );
            applicableSubtotal = cart
                .filter((item) => allowedTypes.includes(item.itemType))
                .reduce((sum, item) => sum + item.price * item.quantity, 0);
        } else {
            applicableSubtotal = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            );
        }

        const amount = calculateDiscount(discount, applicableSubtotal);

        if (amount === 0) {
            throw new Error("This coupon is not applicable to your order");
        }

        setDiscountAmount(amount);
        setAppliedDiscountCode(discount.code);
    };

    const clearDiscount = () => {
        setDiscountAmount(0);
        setAppliedDiscountCode(undefined);
    };

    /* =========================
       RESET DISCOUNT ON CART CHANGE
    ========================= */

    useEffect(() => {
        if (!cart.length) {
            clearDiscount();
        }
    }, [cart]);

    /* =========================
       ADD TO CART
    ========================= */

    const addToCart = async (payload: AddToCartPayload) => {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...payload,
                quantity: payload.quantity ?? 1,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Add to cart failed");
        }

        await fetchCart();
    };

    /* =========================
       REMOVE ITEM
    ========================= */

    const removeFromCart = async (id: string) => {
        const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
        if (res.ok) {
            setCart((prev) => prev.filter((i) => i.id !== id));
        }
    };

    /* =========================
       UPDATE QTY
    ========================= */

    const updateQuantity = async (id: string, quantity: number) => {
        const res = await fetch(`/api/cart/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
        });

        if (res.ok) {
            setCart((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
            );
        }
    };

    /* =========================
       UPDATE CUSTOMIZATION
    ========================= */

    const updateCustomization = async (id: string, customization: string) => {
        const res = await fetch(`/api/cart/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customization }),
        });

        if (res.ok) {
            setCart((prev) =>
                prev.map((i) => (i.id === id ? { ...i, customization } : i)),
            );
        }
    };

    /* =========================
       CLEAR CART
    ========================= */

    const clearCart = async () => {
        const res = await fetch("/api/cart", { method: "DELETE" });
        if (res.ok) {
            setCart([]);
            clearDiscount();
        }
    };

    /* =========================
       PROVIDER
    ========================= */

    return (
        <CartContext.Provider
            value={{
                cart,
                discountAmount,
                appliedDiscountCode,
                applyDiscountCode,
                clearDiscount,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateCustomization,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
