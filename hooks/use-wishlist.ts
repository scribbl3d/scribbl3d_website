"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { useAuthToast } from "./useAuthToast";

type ProductType = "printer" | "resin" | "prebuilt";

interface UseWishlistParams {
    productId: string;
    productName: string;
    productType: ProductType;
}

export function useWishlist({ productId, productName, productType }: UseWishlistParams) {
    const { data: session } = useSession();
    const { showAuthToast } = useAuthToast();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if item is in wishlist on mount
    useEffect(() => {
        if (!session || !productId) return;

        async function checkWishlist() {
            try {
                const paramName = productType === "prebuilt" ? "prebuiltProductId" : `${productType}Id`;
                const queryParam = `${paramName}=${productId}`;
                const res = await fetch(`/api/wishlist/check?${queryParam}`);
                const data = await res.json();
                
                if (data.isAuthenticated) {
                    setIsFavorite(data.isInWishlist);
                }
            } catch (error) {
                console.error("Failed to check wishlist:", error);
            }
        }

        checkWishlist();
    }, [session, productId, productType]);

    const toggleWishlist = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Check authentication
        if (!session) {
            showAuthToast("add items to wishlist");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        const wasInWishlist = isFavorite;
        
        // Optimistic update
        setIsFavorite(!wasInWishlist);

        try {
            const paramName = productType === "prebuilt" ? "prebuiltProductId" : `${productType}Id`;
            const body = { [paramName]: productId };
            
            const res = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error("Failed to update wishlist");
            }

            toast({
                title: wasInWishlist ? "Removed from wishlist" : "Added to wishlist",
                description: `${productName} has been ${wasInWishlist ? "removed from" : "added to"} your wishlist.`,
            });
        } catch (error) {
            // Revert optimistic update on error
            setIsFavorite(wasInWishlist);
            
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isFavorite,
        isLoading,
        toggleWishlist,
    };
}
