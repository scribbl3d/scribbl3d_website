"use client";

import { useSession } from "next-auth/react";
import type React from "react";
import {
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
    itemType: "product" | "prebuilt" | "printer" | "unknown";
    name: string;
    price: number;
    quantity: number;
    images: string[];
    size?: string | null;
    color?: string | null;
    customization?: string | null;
};

type AddToCartPayload = {
    productId?: string;
    prebuiltProductId?: string;
    printerId?: string;
    productSizeId?: string | null;
    productColorId?: string | null;
    quantity?: number;
};

type CartContextType = {
    cart: CartItem[];
    addToCart: (payload: AddToCartPayload) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    updateCustomization: (id: string, customization: string) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
    applyDiscount: (code: string) => Promise<number>;
};

/* =========================
   CONTEXT
========================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

/* =========================
   PROVIDER
========================= */

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { data: session } = useSession();

    /* ---------- FETCH CART (FIXED) ---------- */
    const fetchCart = useCallback(async () => {
        if (!session) return;

        try {
            const response = await fetch("/api/cart");
            if (!response.ok) return;

            const data = await response.json();

            // ✅ IMPORTANT FIX
            setCart(data.items ?? data.cart ?? []);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            setCart([]);
        }
    }, [session]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /* ---------- ADD TO CART ---------- */
    const addToCart = async (payload: AddToCartPayload) => {
        try {
            const response = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: payload.productId,
                    prebuiltProductId: payload.prebuiltProductId,
                    printerId: payload.printerId,
                    productSizeId: payload.productSizeId ?? null,
                    productColorId: payload.productColorId ?? null,
                    quantity: payload.quantity ?? 1,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to add item to cart"
                );
            }

            await fetchCart();
        } catch (error) {
            console.error("Error adding item to cart:", error);
            throw error;
        }
    };

    /* ---------- REMOVE FROM CART ---------- */
    const removeFromCart = async (id: string) => {
        try {
            const response = await fetch(`/api/cart/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setCart((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (error) {
            console.error("Failed to remove item from cart:", error);
        }
    };

    /* ---------- UPDATE QUANTITY ---------- */
    const updateQuantity = async (id: string, quantity: number) => {
        try {
            const response = await fetch(`/api/cart/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });

            if (response.ok) {
                setCart((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update quantity:", error);
        }
    };

    /* ---------- UPDATE CUSTOMIZATION ---------- */
    const updateCustomization = async (id: string, customization: string) => {
        try {
            const response = await fetch(`/api/cart/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customization }),
            });

            if (response.ok) {
                setCart((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, customization } : item
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update customization:", error);
        }
    };

    /* ---------- CLEAR CART ---------- */
    const clearCart = async () => {
        try {
            const response = await fetch("/api/cart", {
                method: "DELETE",
            });

            if (response.ok) {
                setCart([]);
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
    };

    /* ---------- APPLY DISCOUNT ---------- */
    const applyDiscount = async (code: string): Promise<number> => {
        const response = await fetch("/api/apply-discount", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error("Invalid discount code");
        }

        const data = await response.json();
        return data.discount;
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateCustomization,
                clearCart,
                fetchCart,
                applyDiscount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
