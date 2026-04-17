import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useAuthToast } from "./useAuthToast";

interface UseWishlistProps {
    itemId: string;
    itemName: string;
    itemType?: "product" | "resin" | "printer" | "prebuilt";
    isPrebuilt?: boolean;
}

export const useWishlist = ({
    itemId,
    itemName,
    itemType = "product",
    isPrebuilt = false,
}: UseWishlistProps) => {
    const { data: session } = useSession();
    const { showAuthToast } = useAuthToast();
    const [isLoading, setIsLoading] = useState(false);

    const toggleWishlist = async (isInWishlist: boolean) => {
        if (!session) {
            showAuthToast("add items to your wishlist");
            return false;
        }

        setIsLoading(true);
        try {
            const body: any = { isPrebuilt };
            
            if (itemType === "product") {
                body.productId = itemId;
            } else if (itemType === "resin") {
                body.resinId = itemId;
            } else if (itemType === "printer") {
                body.printerId = itemId;
            } else if (itemType === "prebuilt") {
                body.prebuiltProductId = itemId;
            }

            const response = await fetch("/api/wishlist", {
                method: isInWishlist ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Failed to update wishlist");

            toast({
                title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
                description: `${itemName} has been ${
                    isInWishlist ? "removed from" : "added to"
                } your wishlist.`,
            });

            return true;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { toggleWishlist, isLoading };
};
