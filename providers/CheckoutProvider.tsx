"use client";

import {
    calculateExpressShipping,
    calculateExpressShippingPrice,
} from "@/app/checkout/components/expressShipping";
import { useCart } from "@/providers/CartProvider";
import type {
    CheckoutState,
    ShippingDetails,
    ShippingOption,
} from "@/types/checkout";
import { Truck } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

/* =========================
   CONTEXT TYPES
========================= */

interface CheckoutContextType {
    state: CheckoutState;

    setShippingDetails: (details: ShippingDetails) => void;
    setShippingOption: (option: ShippingOption) => void;
    setPricing: (pricing: CheckoutState["pricing"]) => void;

    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetCheckout: () => void;

    expressShipping: {
        allowed: boolean;
        price: number;
        reason?: string;
        loading?: boolean;
    };
}

/* =========================
   CONSTANT SHIPPING OPTIONS
========================= */

const FREE_SHIPPING_OPTION: ShippingOption = {
    id: "free",
    name: "Free Shipping",
    description: "5–7 business days",
    price: 0,
    estimatedDays: "5–7 days",
    icon: Truck,
};

/* =========================
   CONTEXT
========================= */

const CheckoutContext = createContext<CheckoutContextType | undefined>(
    undefined,
);

/* =========================
   INITIAL STATE
========================= */

const initialState: CheckoutState = {
    step: 1,
    shippingDetails: null,
    selectedShipping: null,
    pricing: null,
};

/* =========================
   PROVIDER
========================= */

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<CheckoutState>(initialState);

    const [expressShipping, setExpressShipping] = useState<{
        allowed: boolean;
        price: number;
        reason?: string;
        loading?: boolean;
    }>({
        allowed: true,
        price: 0,
        loading: false,
    });

    const { cart } = useCart();

    /* =========================
       SET PRICING (LOCKED FROM CART)
    ========================= */

    const setPricing = (pricing: CheckoutState["pricing"]) => {
        setState((prev) => ({
            ...prev,
            pricing,
        }));
    };

    /* =========================
       SET SHIPPING DETAILS
    ========================= */

    const setShippingDetails = (details: ShippingDetails) => {
        setState((prev) => ({
            ...prev,
            shippingDetails: details,
        }));
    };

    /* =========================
       SET SHIPPING OPTION
    ========================= */

    const setShippingOption = (option: ShippingOption) => {
        setState((prev) => ({
            ...prev,
            selectedShipping: option,
        }));
    };

    /* =========================
       STEP CONTROLS
    ========================= */

    const nextStep = () => {
        setState((prev) => ({
            ...prev,
            step: Math.min(prev.step + 1, 3),
        }));
    };

    const prevStep = () => {
        setState((prev) => ({
            ...prev,
            step: Math.max(prev.step - 1, 1),
        }));
    };

    const goToStep = (step: number) => {
        setState((prev) => ({
            ...prev,
            step: Math.min(Math.max(step, 1), 3),
        }));
    };

    /* =========================
       RESET CHECKOUT (ONLY MANUAL)
    ========================= */

    const resetCheckout = () => {
        setState(initialState);
        setExpressShipping({
            allowed: true,
            price: 0,
            loading: false,
        });
    };

    /* =========================
       EXPRESS SHIPPING LOGIC
       - Estimate when no pincode
       - Real API call when pincode available
    ========================= */

    useEffect(() => {
        // No cart = reset
        if (!cart || cart.length === 0) {
            setExpressShipping({
                allowed: true,
                price: 0,
                loading: false,
            });
            return;
        }

        const pincode = state.shippingDetails?.pincode;

        // No pincode yet = use quick estimate
        if (!pincode) {
            const result = calculateExpressShipping(cart);
            setExpressShipping({
                ...result,
                loading: false,
            });

            // Auto-fallback if premium becomes invalid
            if (!result.allowed && state.selectedShipping?.id === "premium") {
                setState((prev) => ({
                    ...prev,
                    selectedShipping: FREE_SHIPPING_OPTION,
                }));
            }
            return;
        }

        // Has pincode = fetch real price from Delhivery API
        const fetchRealPrice = async () => {
            setExpressShipping((prev) => ({ ...prev, loading: true }));

            try {
                const result = await calculateExpressShippingPrice(
                    cart,
                    pincode,
                );

                setExpressShipping({
                    allowed: result.allowed,
                    price: result.price,
                    reason: result.reason,
                    loading: false,
                });

                // Auto-fallback if premium becomes invalid
                if (
                    !result.allowed &&
                    state.selectedShipping?.id === "premium"
                ) {
                    setState((prev) => ({
                        ...prev,
                        selectedShipping: FREE_SHIPPING_OPTION,
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch express shipping price:", error);

                // Fallback to estimate on error
                const estimate = calculateExpressShipping(cart);
                setExpressShipping({
                    ...estimate,
                    loading: false,
                });
            }
        };

        fetchRealPrice();
    }, [cart, state.shippingDetails?.pincode]);

    // Separate effect for auto-fallback when selectedShipping changes
    useEffect(() => {
        if (
            !expressShipping.allowed &&
            state.selectedShipping?.id === "premium"
        ) {
            setState((prev) => ({
                ...prev,
                selectedShipping: FREE_SHIPPING_OPTION,
            }));
        }
    }, [expressShipping.allowed, state.selectedShipping?.id]);

    /* =========================
       PROVIDER
    ========================= */

    return (
        <CheckoutContext.Provider
            value={{
                state,
                setShippingDetails,
                setShippingOption,
                setPricing,
                nextStep,
                prevStep,
                goToStep,
                resetCheckout,
                expressShipping,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
}

/* =========================
   HOOK
========================= */

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error("useCheckout must be used within a CheckoutProvider");
    }
    return context;
};
