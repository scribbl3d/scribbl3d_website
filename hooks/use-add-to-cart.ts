"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { useAuthToast } from "./useAuthToast";
import { useCart } from "@/providers/CartProvider";

interface AddToCartOptions {
    productName?: string;
    showSuccessToast?: boolean;
    onSuccess?: () => void;
    onError?: () => void;
}

export function useAddToCart(options: AddToCartOptions = {}) {
    const { data: session } = useSession();
    const { showAuthToast } = useAuthToast();
    const { addToCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);

    const {
        productName = "Item",
        showSuccessToast = true,
        onSuccess,
        onError,
    } = options;

    const handleAddToCart = async (
        cartPayload: any,
        e?: React.MouseEvent
    ) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Check authentication
        if (!session) {
            showAuthToast("add items to your cart");
            return false;
        }

        if (isLoading) return false;

        setIsLoading(true);

        try {
            await addToCart(cartPayload);

            if (showSuccessToast) {
                toast({
                    title: "Added to Cart",
                    description: `${productName} has been added to your cart.`,
                });
            }

            onSuccess?.();
            return true;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add item to cart. Please try again.",
                variant: "destructive",
            });

            onError?.();
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleAddToCart,
        isLoading,
    };
}
