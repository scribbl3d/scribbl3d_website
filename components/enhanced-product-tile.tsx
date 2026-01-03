"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Heart, ShoppingCart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductProps {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    images: string[];
    description: string;
    isCustomizable: boolean;
    availableSizes: string[];
    isPrebuilt?: boolean;
    isPrinter?: boolean;
}

export default function EnhancedProductTile({
    id,
    name,
    price,
    originalPrice,
    images,
    description,
    isCustomizable,
    availableSizes,
    isPrebuilt,
    isPrinter,
}: ProductProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    const { data: session } = useSession();
    const { addToCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();

    const discountPercentage = Math.round(
        ((originalPrice - price) / originalPrice) * 100
    );

    /* =========================
     EFFECTS
  ========================= */

    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!session) {
                setIsInitialLoad(false);
                return;
            }

            try {
                const res = await fetch(
                    `/api/wishlist/check?productId=${id}&isPrebuilt=${isPrebuilt}`
                );
                const data = await res.json();
                setIsInWishlist(data.isInWishlist);
            } catch (err) {
                console.error(err);
            } finally {
                setIsInitialLoad(false);
            }
        };

        checkWishlistStatus();
    }, [id, isPrebuilt, session]);

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    /* =========================
     HANDLERS
  ========================= */

    // 🔥 IMPORTANT: ONLY navigate when clicking the card itself
    const handleProductClick = (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget) return; // ⛔ child click → ignore

        setIsNavigating(true);
        router.push(`/product/${id}`);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.stopPropagation(); // extra safety
        router.push(
            `/checkout?mode=buynow&type=prebuiltproduct&productId=${id}`
        );
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCartLoading(true);

        try {
            if (isPrinter) {
                await addToCart({ printerId: id, quantity: 1 });
            } else if (isPrebuilt) {
                await addToCart({ prebuiltProductId: id, quantity: 1 });
            } else {
                await addToCart({ productId: id, quantity: 1 });
            }

            toast({
                title: "Added to cart",
                description: `${name} has been added to your cart.`,
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isWishlistLoading || isInitialLoad) return;

        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your wishlist.",
                variant: "destructive",
                action: (
                    <Button size="sm" onClick={() => signIn()}>
                        Log in
                    </Button>
                ),
            });
            return;
        }

        setIsWishlistLoading(true);

        try {
            const method = isInWishlist ? "DELETE" : "POST";
            await fetch("/api/wishlist", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: id, isPrebuilt }),
            });

            setIsInWishlist(!isInWishlist);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    /* =========================
     RENDER
  ========================= */

    return (
        <div
            className="relative w-[300px] h-[530px] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProductClick}
        >
            {/* Navigation overlay */}
            {isNavigating && (
                <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <div className="absolute inset-0 bg-white overflow-hidden">
                {/* Wishlist */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 z-20 bg-white/80 rounded-full"
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading}
                >
                    <Heart
                        className={`h-5 w-5 ${
                            isInWishlist
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500"
                        }`}
                    />
                </Button>

                {/* Images */}
                <div className="pt-8 px-4">
                    <div className="relative w-[250px] h-[250px] mx-auto rounded-lg overflow-hidden">
                        <Image
                            src={images[0] || "/placeholder.svg"}
                            alt={name}
                            fill
                            className={`object-cover transition-opacity ${
                                isHovered ? "opacity-0" : "opacity-100"
                            }`}
                            unoptimized
                        />
                        <Image
                            src={images[1] || images[0] || "/placeholder.svg"}
                            alt={name}
                            fill
                            className={`object-cover transition-opacity ${
                                isHovered ? "opacity-100" : "opacity-0"
                            }`}
                            unoptimized
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div
                    className={`absolute left-1/2 -translate-x-1/2 transition-all ${
                        isHovered
                            ? "opacity-100 bottom-36"
                            : "opacity-0 bottom-40"
                    }`}
                    onClick={(e) => e.stopPropagation()} // 🛡 final safety net
                >
                    <div className="flex gap-3 w-[260px]">
                        <Button
                            className="flex-1 h-9 bg-blue-300 hover:bg-blue-400 rounded-full"
                            onClick={handleAddToCart}
                            disabled={isCartLoading}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>

                        <Button
                            className="flex-1 h-9 bg-blue-300 hover:bg-blue-400 rounded-full"
                            onClick={handleBuyNow}
                            disabled={isCartLoading}
                        >
                            Buy Now
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 pt-5">
                    <h2 className="text-lg font-semibold line-clamp-2">
                        {name}
                    </h2>

                    <div className="flex justify-between items-center mt-1">
                        <div>
                            <span className="font-bold">₹{price}</span>
                            <span className="ml-2 text-sm line-through text-gray-500">
                                ₹{originalPrice}
                            </span>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            {discountPercentage}% OFF
                        </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
