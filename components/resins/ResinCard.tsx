"use client";

import { getCardImageUrl } from "@/lib/cloudinary-url";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PriceDisplay } from "@/components/ui/price-display";
import { StockBadge } from "@/components/ui/stock-badge";
import { useWishlist } from "@/hooks/use-wishlist";
import { Bell, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ── Resin Card ── */
interface ResinCardProps {
    resin: any;
    onSelect: () => void;
    priceRange?: [number, number] | null;
}

export default function ResinCard({ resin, onSelect, priceRange }: ResinCardProps) {
    const imageUrl = resin.cardImageUrl;
    const name = resin.name;
    const shortDescription = resin.shortDescription;
    const material = resin.attributes?.find(
        (attr: any) => attr.label === "Material",
    )?.value;
    const technology = resin.technology;
    const slug = resin.slug;

    const price = resin.weights?.[0]?.price ?? 0;
    const originalPrice = resin.weights?.[0]?.originalPrice ?? null;
    const discount = resin.weights?.[0]?.discount;

    const isOutOfStock = resin.inStock === false;

    // Check if any weight variants match the price filter
    const matchingWeights = priceRange && resin.weights
        ? resin.weights.filter((w: any) => {
            const [minPrice, maxPrice] = priceRange;
            return w.price >= minPrice && w.price <= maxPrice;
        })
        : [];
    const hasMatchingVariants = matchingWeights.length > 0 && matchingWeights.length < (resin.weights?.length || 0);

    const [showNotifyModal, setShowNotifyModal] = useState(false);

    // Use wishlist hook
    const { isFavorite, isLoading: isWishLoading, toggleWishlist } = useWishlist({
        productId: resin.id,
        productName: resin.name,
        productType: "resin",
    });

    return (
        <>
            <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                <Link
                    href={`/resins/${slug}`}
                    className="flex flex-col h-full"
                >
                    {/* IMAGE — square on all sizes */}
                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                        {imageUrl && (
                            <img
                                src={getCardImageUrl(imageUrl)}
                                alt={name}
                                className="w-full h-full object-contain"
                                loading="eager"
                            />
                        )}
                        <StockBadge inStock={!isOutOfStock} size="sm" />
                        <button
                            onClick={toggleWishlist}
                            disabled={isWishLoading}
                            className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center"
                        >
                            {isWishLoading ? (
                                <LoadingSpinner size="sm" color="gray" className="w-3 h-3 sm:w-5 sm:h-5" />
                            ) : (
                                <Heart
                                    className={`w-3 h-3 sm:w-5 sm:h-5 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                            )}
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="px-2.5 pt-2 pb-0 sm:px-5 sm:pt-4 sm:pb-0">
                        {/* Material badge */}
                        <span className="inline-block mb-1 sm:mb-2 px-1.5 py-px sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {material}
                        </span>

                        {/* Name */}
                        <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                            {name}
                        </h3>

                        {/* Colour swatches */}
                        {resin.colours && resin.colours.length > 0 && (
                            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
                                {resin.colours.map((c: any) => (
                                    <span
                                        key={c.id}
                                        title={`${c.name}${c.inStock === false ? " — Out of Stock" : ""}`}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300 flex-shrink-0 ${c.inStock === false ? "opacity-30" : ""}`}
                                        style={{
                                            backgroundColor:
                                                c.hexCode || "#ccc",
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Description — hidden on mobile */}
                        <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                            {shortDescription}
                        </p>

                        {/* Specs — hidden on mobile */}
                        <div className="hidden sm:block text-[13px] text-gray-700 mt-1.5">
                            <div>
                                <strong>Technology:</strong> {technology}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* FOOTER */}
                <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                    <hr className="hidden sm:block my-3" />

                    {/* Price range indicator badge */}
                    {hasMatchingVariants && (
                        <div className="mb-1.5 sm:mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {matchingWeights.length} variant{matchingWeights.length !== 1 ? 's' : ''} in range
                            </span>
                        </div>
                    )}

                    <PriceDisplay
                        price={price}
                        originalPrice={originalPrice}
                        discount={discount}
                        size="sm"
                        className="mt-1"
                    />

                    {/* Select Variants — hidden when OOS */}
                    {!isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onSelect();
                            }}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                        >
                            Select Variants
                        </button>
                    )}

                    {/* Notify Me — only when OOS */}
                    {isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowNotifyModal(true);
                            }}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center gap-1.5 border-2 border-blue-200 text-blue-500 hover:text-blue-700"
                        >
                            <Bell
                                size={12}
                                className="sm:w-[14px] sm:h-[14px]"
                            />
                            Notify Me
                        </button>
                    )}
                </div>
            </div>

            {showNotifyModal && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={resin.id}
                    productName={resin.name}
                    productType="resin"
                />
            )}
        </>
    );
}