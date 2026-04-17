"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { imageLoader } from "@/lib/utils";
import { useCart } from "@/providers/CartProvider";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

// Type definitions for product data and props
interface ProductTileProps {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    images: string[];
    color?: string;
    isInWishlist: boolean;
    onWishlistToggle: () => Promise<void>;
    isPrebuilt?: boolean;
}

interface ImageCarouselProps {
    images: string[];
    name: string;
}

/**
 * ImageCarousel Component
 * Displays a swipeable carousel of product images with touch support
 * Includes navigation dots and handles empty states
 */
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, name }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Add swipe support while keeping the original click handlers
    const handlers = useSwipeable({
        onSwipedLeft: () =>
            setCurrentImageIndex(
                (prevIndex) => (prevIndex + 1) % images.length
            ),
        onSwipedRight: () =>
            setCurrentImageIndex(
                (prevIndex) => (prevIndex - 1 + images.length) % images.length
            ),
        trackMouse: true,
    });

    if (!images || images.length === 0) {
        return (
            <div className="relative w-[270px] h-[270px] bg-gray-200 flex items-center justify-center rounded-2xl">
                <span className="text-gray-500">No image available</span>
            </div>
        );
    }

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(
            (prevIndex) => (prevIndex - 1 + images.length) % images.length
        );
    };

    return (
        <div
            className="relative w-[270px] h-[270px] overflow-hidden"
            {...handlers}
        >
            <div className="w-full h-full overflow-hidden rounded-2xl">
                <Image
                    loader={imageLoader}
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={`${name} - Image ${currentImageIndex + 1}`}
                    width={270}
                    height={270}
                    quality={85}
                    priority={currentImageIndex === 0}
                    loading={currentImageIndex === 0 ? "eager" : "lazy"}
                    className="rounded-2xl object-cover"
                    unoptimized={true} // Key prop
                />
            </div>
            {images.length > 1 && (
                <>
                    <button
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full bg-white p-2 touch-manipulation"
                        onClick={prevImage}
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full bg-white p-2 touch-manipulation"
                        onClick={nextImage}
                    >
                        <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                    {/* Add dots for mobile */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                    index === currentImageIndex
                                        ? "bg-white"
                                        : "bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/**
 * ProductTileA Component
 * Standard product tile with basic styling
 * Used for regular product displays
 */
export const ProductTileA: React.FC<ProductTileProps> = ({
    id,
    name,
    price,
    originalPrice,
    discount,
    images,
    isInWishlist,
    onWishlistToggle,
}) => {
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Handle wishlist toggle with authentication check
    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your wishlist.",
                variant: "destructive",
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => signIn()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Log in
                    </Button>
                ),
            });
            return;
        }

        setIsWishlistLoading(true);
        try {
            await onWishlistToggle();
            toast({
                title: isInWishlist
                    ? "Removed from Wishlist"
                    : "Added to Wishlist",
                description: `${name} has been ${
                    isInWishlist ? "removed from" : "added to"
                } your wishlist.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Handle add to cart with authentication check
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => signIn()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Log in
                    </Button>
                ),
            });
            return;
        }

        setIsCartLoading(true);
        try {
            await addToCart({
                productId: id,

                quantity: 1,
            });

            toast({
                title: "Added to Cart",
                description: `${name} has been added to your cart.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add item to cart. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    return (
        <div className="w-[300px] bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            {/* CLICKABLE AREA ONLY */}
            <Link href={`/products/${id}`} className="block">
                <div className="relative w-full h-[340px] bg-gray-100 overflow-hidden flex flex-col items-center">
                    {/* Bubble Free badge */}
                    <div className="absolute top-2 right-2 z-[2] flex items-center justify-center rounded-full bg-black px-4 py-1 shadow">
                        <span className="text-[#B8C0FF] text-[13px] font-medium">
                            Bubble Free
                        </span>
                    </div>

                    {/* Wishlist */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 z-[3] bg-white/80 hover:bg-white rounded-full w-10 h-10"
                        onClick={(e) => {
                            e.preventDefault();
                            handleWishlistToggle(e);
                        }}
                        disabled={isWishlistLoading || isCartLoading}
                    >
                        {isWishlistLoading ? (
                            <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                            <Heart
                                className={`h-5 w-5 ${
                                    isInWishlist
                                        ? "fill-red-500 text-red-500"
                                        : "text-gray-500"
                                }`}
                            />
                        )}
                    </Button>

                    <div className="pt-10">
                        <ImageCarousel images={images} name={name} />
                    </div>
                </div>

                {/* Title & price */}
                <div className="p-3">
                    <h3 className="text-[20px] font-normal leading-6 text-[#3A3A3A]">
                        {name}
                    </h3>

                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[18px] font-bold text-[#3A3A3A]">
                            ₹{price}
                        </span>
                        <span className="text-[12px] font-bold line-through text-[#75757A]">
                            ₹{originalPrice}
                        </span>
                        <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold text-[#51B960] bg-[rgba(81,185,96,0.1)]">
                            {discount}% OFF
                        </span>
                    </div>
                </div>
            </Link>

            <div className="px-4 pb-4 relative h-[53px]">
                <button
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow rounded-[4px] flex items-center justify-center touch-manipulation"
                    style={{
                        color: "#5D32F5",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "18px",
                        fontStyle: "normal",
                        fontWeight: 700,
                        lineHeight: "21.6px",
                        width: "253px",
                        height: "37px",
                    }}
                    onClick={handleAddToCart}
                    disabled={isWishlistLoading || isCartLoading}
                >
                    {isCartLoading ? (
                        <div className="h-5 w-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    ) : (
                        "Add to Cart"
                    )}
                </button>
            </div>
        </div>
    );
};

/**
 * ProductTileB Component
 * Premium product tile with enhanced styling
 * Used for special/featured products
 */
export const ProductTileB: React.FC<ProductTileProps> = ({
    id,
    name,
    price,
    originalPrice,
    discount,
    images,
    isInWishlist,
    onWishlistToggle,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const router = useRouter();

    // Handlers are identical to ProductTileA but with isPrebuilt: true
    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your wishlist.",
                variant: "destructive",
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => signIn()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Log in
                    </Button>
                ),
            });
            return;
        }

        setIsLoading(true);
        try {
            await onWishlistToggle();
            toast({
                title: isInWishlist
                    ? "Removed from Wishlist"
                    : "Added to Wishlist",
                description: `${name} has been ${
                    isInWishlist ? "removed from" : "added to"
                } your wishlist.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => signIn()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Log in
                    </Button>
                ),
            });
            return;
        }

        setIsLoading(true);
        try {
            await addToCart({
                productId: id,

                quantity: 1,
            });

            toast({
                title: "Added to Cart",
                description: `${name} has been added to your cart.`,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to add item to cart. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    const handleBuyNow = async () => {
        // Set checkout access cookie to allow navigation
        try {
            await fetch("/api/checkout/set-access", { method: "POST" });
        } catch (error) {
        }
        router.push(`/checkout?mode=buynow&type=product&productId=${id}`);
    };

    return (
        <div className="flex justify-center">
            <div className="w-[300px] bg-white hover:shadow-lg transition-shadow duration-300">
                {/* CLICKABLE PART ONLY */}
                <Link href={`/products/${id}`}>
                    {/* Product image section */}
                    <div className="relative w-full h-[340px] bg-gradient-to-b from-[#E1ADFF] to-black overflow-hidden flex flex-col items-center">
                        {/* Premium badge */}
                        <div className="absolute top-2 right-2 z-[2] flex items-center justify-center rounded-full bg-gradient-to-b from-[#6359F3] to-black px-4 py-1 shadow">
                            <span className="font-inter text-sm font-medium italic text-white/80">
                                Special Grade
                            </span>
                        </div>

                        {/* Wishlist button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-2 right-2 z-[3] bg-white/80 hover:bg-white rounded-full w-10 h-10"
                            onClick={(e) => {
                                e.preventDefault();
                                handleWishlistToggle(e as React.MouseEvent);
                            }}
                            disabled={isLoading}
                        >
                            <Heart
                                className={`h-5 w-5 ${
                                    isInWishlist
                                        ? "fill-red-500 text-red-500"
                                        : "text-gray-500"
                                }`}
                            />
                        </Button>

                        <div className="pt-10">
                            <ImageCarousel images={images} name={name} />
                        </div>
                    </div>

                    {/* Product details */}
                    <div className="p-2">
                        <h3
                            className="p-1 font-normal"
                            style={{
                                background:
                                    "linear-gradient(289deg, #545454 23.37%, rgba(255, 117, 253, 0.77) 77.15%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontFamily: "Lato, sans-serif",
                                fontSize: "20px",
                                lineHeight: "24px",
                            }}
                        >
                            {name}
                        </h3>

                        <div className="flex items-baseline gap-2 p-1">
                            <span className="text-[18px] font-bold text-gray-900">
                                ₹{price}
                            </span>
                            <span className="text-[12px] font-bold text-gray-500 line-through">
                                ₹{originalPrice}
                            </span>
                            <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold uppercase text-[#51B960] bg-[rgba(81,185,96,0.1)]">
                                {discount}% OFF
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="px-4 pb-4 relative h-[53px]">
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6359F3] to-[#5D32F5] text-white rounded-[4px] flex items-center justify-center touch-manipulation w-[253px] h-[37px] font-medium text-[18px]"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        ) : (
                            "Add to Cart"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
