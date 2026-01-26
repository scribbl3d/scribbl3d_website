"use client";

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
    itemType: "product" | "prebuilt" | "printer" | "resin" | "unknown";
    name: string;
    price: number;
    quantity: number;
    images: string[];
    size?: string | null; // weight for resin
    color?: string | null; // colour for resin
    prebuiltColour?: string | null;
    prebuiltSize?: string | null;
    customization?: string | null;
    weight?: string | null;
};

export type AddToCartPayload = {
    productId?: string;
    prebuiltProductId?: string;
    printerId?: string;

    /* 🧪 Resin */
    resinId?: string;
    resinColourId?: string;
    resinWeightId?: string;

    /* 🧱 Prebuilt */
    prebuiltColour?: string;
    prebuiltSize?: string;

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
    const { data: session } = useSession();

    /* ---------- FETCH CART ---------- */
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

    /* ---------- ADD TO CART ---------- */
    const addToCart = async (payload: AddToCartPayload) => {
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: payload.productId,
                    prebuiltProductId: payload.prebuiltProductId,
                    printerId: payload.printerId,

                    resinId: payload.resinId,
                    resinColourId: payload.resinColourId,
                    resinWeightId: payload.resinWeightId,

                    prebuiltColour: payload.prebuiltColour,
                    prebuiltSize: payload.prebuiltSize,

                    quantity: payload.quantity ?? 1,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Add to cart failed");
            }

            await fetchCart();
        } catch (err) {
            console.error("Add to cart error:", err);
            throw err;
        }
    };

    /* ---------- REMOVE ---------- */
    const removeFromCart = async (id: string) => {
        try {
            const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
            if (res.ok) {
                setCart((prev) => prev.filter((i) => i.id !== id));
            }
        } catch (err) {
            console.error("Remove cart item failed:", err);
        }
    };

    /* ---------- UPDATE QTY ---------- */
    const updateQuantity = async (id: string, quantity: number) => {
        try {
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
        } catch (err) {
            console.error("Update quantity failed:", err);
        }
    };

    /* ---------- UPDATE CUSTOMIZATION ---------- */
    const updateCustomization = async (id: string, customization: string) => {
        try {
            const res = await fetch(`/api/cart/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customization }),
            });

            if (res.ok) {
                setCart((prev) =>
                    prev.map((i) =>
                        i.id === id ? { ...i, customization } : i,
                    ),
                );
            }
        } catch (err) {
            console.error("Update customization failed:", err);
        }
    };

    /* ---------- CLEAR ---------- */
    const clearCart = async () => {
        try {
            const res = await fetch("/api/cart", { method: "DELETE" });
            if (res.ok) setCart([]);
        } catch (err) {
            console.error("Clear cart failed:", err);
        }
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
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
