"use client";

import { useAuthToast } from "@/hooks/useAuthToast";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import FilamentVariantModal, { FilamentVariantItem } from "./FilamentVariantModal";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";

interface FilamentProductTileProps {
    id: string;
    slug?: string; // SEO-friendly slug
    name: string;
    shortDescription: string;
    price: number;
    originalPrice: number;
    discount: number;
    images: string[];
    color?: string; // Hex color from DB
    colors?: { hexCode: string; name: string }[]; // Available colors
    finishType?: string;
    weight?: string;
    diameter?: string;
    isInWishlist: boolean;
    onWishlistToggle: () => Promise<void>;
    inStock?: boolean;
}

export function FilamentProductTile({
    id,
    slug,
    name,
    shortDescription,
    price,
    originalPrice,
    discount,
    images,
    color,
    colors,
    finishType = "Matte",
    weight = "1kg",
    diameter = "1.75mm",
    isInWishlist: initialIsInWishlist,
    onWishlistToggle,
    inStock = true,
}: FilamentProductTileProps) {
    const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const { data: session } = useSession();
    const { showAuthToast } = useAuthToast();

    // Check wishlist status on mount
    useEffect(() => {
        if (!session || !id) return;
        
        const checkWishlist = async () => {
            try {
                const res = await fetch(`/api/wishlist/check?filamentId=${id}`);
                const data = await res.json();
                if (data.isAuthenticated) {
                    setIsInWishlist(data.isInWishlist);
                }
            } catch (err) {
                console.error("Wishlist check failed", err);
            }
        };
        
        checkWishlist();
    }, [session, id]);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            showAuthToast("add items to your wishlist");
            return;
        }

        setIsWishlistLoading(true);
        const wasInWishlist = isInWishlist;
        setIsInWishlist(!wasInWishlist);
        
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filamentId: id }),
            });
            toast({
                title: wasInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
            });
        } catch (error) {
            setIsInWishlist(wasInWishlist);
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleSelectVariants = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowVariantModal(true);
    };

    // If API provides multiple colors, use them, else fake it from the single color
    const availableColors = colors && colors.length > 0
        ? colors
        : (color ? [{ hexCode: color, name: color }] : []);

    // Badge label: show finish type (Matte / Silk / Gloss) — much more useful than "Premium"
    const finishBadge = finishType || "Matte";
    const finishBadgeStyle: Record<string, string> = {
        Silk: "text-purple-700 bg-purple-100",
        Gloss: "text-blue-700 bg-blue-100",
        Matte: "text-gray-700 bg-gray-100",
        Transparent: "text-cyan-700 bg-cyan-100",
        Gradient: "text-pink-700 bg-pink-100",
    };
    const badgeClass = finishBadgeStyle[finishBadge] ?? "text-green-700 bg-green-100";

    const variantItem: FilamentVariantItem = {
        id,
        name,
        image: images[0] ?? "",
        material: finishBadge,
        price,
        originalPrice,
        discount,
        colours: availableColors.map((c) => ({ name: c.name, hex: c.hexCode })),
        diameters: ["1.75mm", "2.85mm", "3mm"],
        spoolWeights: ["250g", "500g", "1 kg", "3 kg"],
        pdpHref: `/filament/${slug || id}`,
        inStock: true,
    };

    return (
        <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
            <Link href={`/filament/${slug || id}`} className="flex flex-col h-full">
                {/* IMAGE — square on all sizes */}
                <div className="relative aspect-square w-full bg-white overflow-hidden">
                    {images[0] && (
                        <img
                            src={images[0]}
                            alt={name}
                            className="w-full h-full object-contain"
                            loading="eager"
                        />
                    )}
                    {/* Stock Badge */}
                    {!inStock && (
                        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                            Out of Stock
                        </div>
                    )}
                    {/* Finish Badge - on image */}
                    <div className={`absolute ${!inStock ? 'bottom-1.5 left-1.5 sm:bottom-3 sm:left-3' : 'top-1.5 left-1.5 sm:top-3 sm:left-3'} z-[2]`}>
                        <span className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full ${badgeClass}`}>
                            {finishBadge}
                        </span>
                    </div>
                    {/* Wishlist */}
                    <button
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                        className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center"
                    >
                        {isWishlistLoading ? (
                            <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                            <Heart className={`w-3 h-3 sm:w-5 sm:h-5 transition ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        )}
                    </button>
                </div>

                {/* CONTENT */}
                <div className="px-2.5 pt-2 pb-0 sm:px-5 sm:pt-4 sm:pb-0">
                    {/* Name */}
                    <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                        {name}
                    </h3>

                    {/* Description — hidden on mobile */}
                    <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                        {shortDescription}
                    </p>

                    {/* Specs — hidden on mobile */}
                    <div className="hidden sm:block text-[13px] text-gray-700 mt-1.5">
                        <div>
                            <strong>Diameter:</strong> {diameter || "1.75mm"} | <strong>Weight:</strong> {weight || "1kg"}
                        </div>
                    </div>
                </div>
            </Link>

            {/* FOOTER */}
            <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                <hr className="hidden sm:block my-3" />

                {/* Price */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    <span className="text-base sm:text-lg font-black text-gray-900">₹{price}</span>
                    {originalPrice > price && (
                        <>
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{originalPrice}</span>
                            <span className="text-[9px] sm:text-[11px] font-bold text-green-600 bg-green-50 px-1 py-0.5 sm:px-1.5 rounded">
                                {discount}% OFF
                            </span>
                        </>
                    )}
                </div>

                {/* Select Variants — hidden when OOS */}
                {inStock && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectVariants(e);
                        }}
                        className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                    >
                        Select Variants
                    </button>
                )}

                {/* Notify Me — only when OOS */}
                {!inStock && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowNotifyModal(true);
                        }}
                        className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center gap-1.5 border-2 border-blue-200 text-blue-500 hover:text-blue-700"
                    >
                        <Bell size={12} className="sm:w-[14px] sm:h-[14px]" />
                        Notify Me
                    </button>
                )}
            </div>

            {/* Variant picker modal */}
            {showVariantModal && (
                <FilamentVariantModal
                    item={variantItem}
                    onClose={() => setShowVariantModal(false)}
                />
            )}

            {/* Notify Me modal */}
            {showNotifyModal && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={id}
                    productName={name}
                    productType="filament"
                />
            )}
        </div>
    );
}
