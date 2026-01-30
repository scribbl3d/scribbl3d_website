"use client";

import { calculateExpressShipping } from "@/app/checkout/components/expressShipping";
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
    }>({
        allowed: true,
        price: 0,
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
        });
    };

    /* =========================
       EXPRESS SHIPPING LOGIC
    ========================= */

    useEffect(() => {
        if (!cart || cart.length === 0) {
            setExpressShipping({
                allowed: true,
                price: 0,
            });
            return;
        }

        const result = calculateExpressShipping(cart);
        setExpressShipping(result);

        // Auto-fallback if premium becomes invalid
        if (!result.allowed && state.selectedShipping?.id === "premium") {
            setState((prev) => ({
                ...prev,
                selectedShipping: FREE_SHIPPING_OPTION,
            }));
        }
    }, [cart, state.selectedShipping]);

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
