"use client";

import { useAuthToast } from "@/hooks/useAuthToast";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import FilamentVariantModal, { FilamentVariantItem } from "./FilamentVariantModal";
import { getSwatchStyle } from "@/lib/utils";
import { StockBadge } from "@/components/ui/stock-badge";
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
        <div className="w-full bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 flex flex-col border border-gray-100 relative group">
            
            {/* Image Section */}
            <Link href={`/filament/${slug || id}`} className="block relative bg-white aspect-square p-6 flex items-center justify-center">
                {/* Stock Badge - Top Left */}
                <StockBadge inStock={inStock} size="sm" className="top-3 left-3" />
                
                {/* Finish-type Badge - Top Left (when in stock) or Bottom Left (when out of stock) */}
                <div className={`absolute left-3 z-[2] ${!inStock ? 'bottom-3' : 'top-3'}`}>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${badgeClass}`}>
                        {finishBadge}
                    </span>
                </div>

                {/* Wishlist */}
                <button
                    className="absolute top-3 right-3 z-[3] w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-sm"
                    onClick={handleWishlistToggle}
                    disabled={isWishlistLoading}
                >
                    {isWishlistLoading ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                        <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                    )}
                </button>

                <ImageCarousel images={images} name={name} />
            </Link>

            {/* Details Section */}
            <div className="p-5 flex flex-col flex-1">
                

                <Link href={`/filament/${slug || id}`} className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2">
                        {name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 mb-4">
                        {shortDescription}
                    </p>
                </Link>

                <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-gray-900 tracking-tight">₹{price}</span>
                            {originalPrice > price && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>
                        {originalPrice > price && (
                            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                        )}
                    </div>
                </div>

                {/* Primary CTA - Select Variants (only when in stock) */}
                {inStock && (
                    <button
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-black transition-colors flex items-center justify-center"
                        onClick={handleSelectVariants}
                    >
                        Select Variants
                    </button>
                )}

                {/* Notify Me - only when out of stock */}
                {!inStock && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowNotifyModal(true);
                        }}
                        className="w-full py-2.5 border-2 border-blue-200 text-blue-500 hover:text-blue-700 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Bell size={14} />
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
