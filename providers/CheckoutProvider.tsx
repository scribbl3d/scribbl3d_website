"use client";

import type {
    CheckoutState,
    ShippingDetails,
    ShippingOption,
} from "@/types/checkout";
import { createContext, useContext, useState } from "react";

interface CheckoutContextType {
    state: CheckoutState;
    setShippingDetails: (details: ShippingDetails) => void;
    setShippingOption: (option: ShippingOption) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetCheckout: () => void; // New function to reset the checkout state
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
    undefined
);

const initialState: CheckoutState = {
    step: 1,
    shippingDetails: null,
    selectedShipping: null,
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<CheckoutState>(initialState);

    const setShippingDetails = (details: ShippingDetails) => {
        setState((prev) => ({
            ...prev,
            shippingDetails: details,
        }));
    };

    const setShippingOption = (option: ShippingOption) => {
        setState((prev) => ({
            ...prev,
            selectedShipping: option,
        }));
    };

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

    const resetCheckout = () => {
        setState(initialState);
    };

    return (
        <CheckoutContext.Provider
            value={{
                state,
                setShippingDetails,
                setShippingOption,
                nextStep,
                prevStep,
                goToStep,
                resetCheckout,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
}

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (context === undefined) {
        throw new Error("useCheckout must be used within a CheckoutProvider");
    }
    return context;
};
