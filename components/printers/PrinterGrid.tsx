"use client";

import { getCardImageUrl } from "@/lib/cloudinary-url";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { Bell, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ================= TYPES ================= */
interface PrinterGridProps {
    printers: any[];
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export default function PrinterGrid({
    printers,
    page,
    total,
    limit,
    onPageChange,
}: PrinterGridProps) {
    const totalPages = Math.ceil(total / limit);

    if (printers.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No printers found
                </h3>
                <p className="text-gray-600">
                    Try adjusting your filters to see more results
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* GRID — 2 cols on mobile, 2 on md, 3 on xl */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                {printers.map((printer) => (
                    <PrinterCard key={printer.id} printer={printer} />
                ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40 text-sm"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`px-3 py-1 border rounded text-sm ${p === page ? "bg-black text-white" : ""}`}
                            >
                                {p}
                            </button>
                        );
                    })}
                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40 text-sm"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

function PrinterCard({ printer }: { printer: any }) {
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const isOutOfStock = printer.inStock === false;
    const price = printer.price || 0;
    const originalPrice = printer.originalPrice || null;
    const imageUrl =
        printer.images.find((img: any) => img.isMain)?.url ||
        printer.images[0]?.url;

    // Use custom hooks
    const { isFavorite, isLoading: isWishLoading, toggleWishlist } = useWishlist({
        productId: printer.id,
        productName: printer.name,
        productType: "printer",
    });

    const { handleAddToCart, isLoading: isCartLoading } = useAddToCart({
        productName: printer.name,
    });

    const onAddToCart = async () => {
        if (isOutOfStock) return;
        await handleAddToCart({ printerId: printer.id, quantity: 1 });
    };

    return (
        <>
            <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                <Link
                    href={`/printers/${printer.slug}`}
                    className="flex flex-col h-full"
                >
                    {/* IMAGE — square on all sizes */}
                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                        {imageUrl && (
                            <img
                                src={getCardImageUrl(imageUrl)}
                                alt={printer.name}
                                className="w-full h-full object-contain"
                                loading="eager"
                            />
                        )}
                        {isOutOfStock && (
                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                Out of Stock
                            </div>
                        )}
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
                        {/* Technology badge */}
                        <span className="inline-block mb-1 sm:mb-2 px-1.5 py-px sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {printer.technology}
                        </span>

                        {/* Name */}
                        <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                            {printer.name}
                        </h3>

                        {/* Description — hidden on mobile */}
                        <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                            {printer.shortDescription || printer.description}
                        </p>

                        {/* Specs — hidden on mobile */}
                        <div className="hidden sm:block text-[13px] text-gray-700 mt-1.5">
                            <div>
                                <strong>Build Volume:</strong>{" "}
                                {(() => {
                                    if (!printer.volumeDisplay) return "—";
                                    const dims = printer.volumeDisplay
                                        .split("×")
                                        .map((v: string) => v.trim())
                                        .filter(Boolean);
                                    return dims.length === 3
                                        ? `${dims.join(" × ")} mm³`
                                        : "—";
                                })()}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* FOOTER */}
                <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                    <hr className="hidden sm:block my-3" />

                    {/* Line 1: Actual price + Original price */}
                    <div className="flex items-baseline gap-3 sm:gap-0 sm:justify-start mt-1 ">
                        <span className="text-[13px] sm:text-[16px] font-bold text-[#101828]">
                            ₹{price.toLocaleString("en-IN")}
                        </span>
                        {originalPrice && (
                            <span className="sm:ml-3 text-[10px] sm:text-[14px] font-normal line-through text-[#99A1AF]">
                                ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}
                        {/* Discount — desktop only inline with prices */}
                        {printer.discount && (
                            <span className="hidden sm:inline-flex sm:ml-2 h-[22px] px-2 items-center rounded-full text-[12px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]">
                                {printer.discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Line 2: GST + Discount on mobile */}
                    <div className="flex items-center gap-3 sm:gap-2.5 mb-0.5 sm:mb-2.5 sm:justify-start">
                        <p className="text-[9px] sm:text-[13px] text-[#667085]">
                            (incl. GST)
                        </p>
                        {printer.discount && (
                            <span className="sm:hidden h-[14px] px-1 inline-flex items-center rounded-full text-[8px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]">
                                {printer.discount}% OFF
                            </span>
                        )}
                    </div>
                    {!isOutOfStock && (
                        <button
                            onClick={onAddToCart}
                            disabled={isCartLoading}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                        >
                            {isCartLoading ? (
                                <LoadingSpinner size="sm" color="white" className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            ) : (
                                "Add to Cart"
                            )}
                        </button>
                    )}

                    {/* Notify Me */}
                    {isOutOfStock && (
                        <button
                            onClick={() => setShowNotifyModal(true)}
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
                    productId={printer.id}
                    productName={printer.name}
                    productType="printer"
                />
            )}
        </>
    );
}
