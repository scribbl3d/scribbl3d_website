"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Bell, Heart } from "lucide-react";
import Image from "next/image";
import { WishlistGridItem } from "./wishlist.types";

export default function WishlistCard({
    item,
    onRemove,
    onSelect,
    onNotify,
}: {
    item: WishlistGridItem;
    onRemove: (id: string) => void;
    onSelect: (item: WishlistGridItem) => void;
    onNotify?: (item: WishlistGridItem) => void;
}) {
    const { addToCart } = useCart();

    const discount =
        item.originalPrice && item.price
            ? Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) *
                      100,
              )
            : null;

    const canOpenModal =
        item.itemType === "resin" || item.itemType === "prebuilt";
    const isOOS = item.inStock === false;

    const handleCTA = async () => {
        if (isOOS) {
            onNotify?.(item);
            return;
        }

        if (canOpenModal) {
            onSelect(item);
            return;
        }

        try {
            await addToCart({ ...item.cartPayload, quantity: 1 });
            onRemove(item.id);
            toast({
                title: "Added to Cart",
                description: `${item.title} has been added to your cart.`,
            });
        } catch (err) {
            console.error("Failed to add to cart:", err);
        }
    };

    return (
        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-row sm:flex-col">
            {/* IMAGE */}
            <div className="relative w-[100px] h-[100px] sm:w-full sm:h-[240px] bg-white flex-shrink-0">
                <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-contain"
                />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col flex-1 p-2 sm:p-4 relative">
                {/* REMOVE (HEART) - Mobile top-right */}
                <button
                    onClick={() => onRemove(item.id)}
                    className="absolute top-1 right-1 sm:top-3 sm:right-3 w-[24px] h-[24px] sm:w-[32px] sm:h-[32px] rounded-full bg-[#1D4ED8] flex items-center justify-center shadow hover:bg-[#1E40AF] transition z-10"
                >
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                </button>

                {/* Out of Stock badge - Mobile */}
                {isOOS && (
                    <div className="absolute top-1 left-1 sm:top-auto sm:left-auto sm:relative bg-red-500 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full z-10 sm:mb-2 sm:w-fit">
                        OOS
                    </div>
                )}
                {item.badge && (
                    <span className="mb-1 sm:mb-2 px-1.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded-full bg-blue-50 text-blue-600 w-fit">
                        {item.badge}
                    </span>
                )}

                <h3 className="text-xs sm:text-base font-semibold text-gray-900 line-clamp-2 sm:line-clamp-2 pr-6 sm:pr-0">
                    {item.title}
                </h3>

                <div className="my-1 sm:my-3 h-px bg-gray-200 hidden sm:block" />

                <div className="mt-auto">
                    {/* PRICE */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-sm sm:text-lg font-bold">
                            ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        {item.originalPrice && (
                            <span className="text-[10px] sm:text-sm line-through text-gray-400">
                                ₹{item.originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}
                        {discount && (
                            <span className="text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-700">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    <p className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mb-3 hidden sm:block">
                        (incl. GST)
                    </p>

                    {/* CTA — Select Variants or Notify Me */}
                    <div className="mt-1 sm:mt-0">
                    {isOOS ? (
                        <button
                            onClick={handleCTA}
                            className="w-full rounded py-1 sm:py-2.5 text-[9px] sm:text-sm font-bold border border-blue-300 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-0.5 sm:gap-2"
                        >
                            <Bell className="w-2.5 h-2.5 sm:w-[14px] sm:h-[14px]" />
                            <span className="hidden sm:inline">Notify Me When Back</span>
                            <span className="sm:hidden">Notify</span>
                        </button>
                    ) : (
                        <Button
                            className="w-full h-[26px] sm:h-[44px] bg-black text-white rounded text-[9px] sm:text-sm font-bold px-2"
                            onClick={handleCTA}
                        >
                            {canOpenModal ? (
                                <>
                                    <span className="hidden sm:inline">Select Variants</span>
                                    <span className="sm:hidden">Variants</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline">Add to Cart</span>
                                    <span className="sm:hidden">Add</span>
                                </>
                            )}
                        </Button>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}
