"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Heart } from "lucide-react";
import Image from "next/image";
import { WishlistGridItem } from "./wishlist.types";
export default function WishlistCard({
    item,
    onRemove,
    onSelect,
}: {
    item: WishlistGridItem;
    onRemove: (id: string) => void;
    onSelect: (item: WishlistGridItem) => void;
}) {
    const { addToCart } = useCart();

    const discount =
        item.originalPrice && item.price
            ? Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) * 100
              )
            : null;

    const canOpenModal =
        item.itemType === "resin" || item.itemType === "prebuilt";

    /* =========================
       CTA HANDLER
    ========================= */
    const handleCTA = async () => {
        // 🔥 VARIANT ITEMS → MODAL
        if (canOpenModal) {
            onSelect(item);
            return;
        }

        // 🔥 DIRECT ADD TO CART
        try {
            await addToCart({
                ...item.cartPayload,
                quantity: 1,
            });

            // 🔥 REMOVE FROM WISHLIST AFTER ADD
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
        <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
            {/* IMAGE */}
            <div className="relative h-[240px] bg-gray-100">
                <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                />

                {/* REMOVE (HEART) */}
                <button
                    onClick={() => onRemove(item.id)}
                    className="
                        absolute top-3 right-3
                        w-[32px] h-[32px]
                        rounded-full
                        bg-[#1D4ED8]
                        flex items-center justify-center
                        shadow
                        hover:bg-[#1E40AF]
                        transition
                    "
                >
                    <Heart className="w-4 h-4 text-white fill-white" />
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col flex-1 p-4">
                {item.badge && (
                    <span className="mb-2 px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600 w-fit">
                        {item.badge}
                    </span>
                )}

                {/* TITLE (FIXED HEIGHT) */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">
                    {item.title}
                </h3>

                {/* DIVIDER */}
                <div className="my-3 h-px bg-gray-200" />

                <div className="mt-auto">
                    {/* PRICE */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                            ₹{item.price.toLocaleString("en-IN")}
                        </span>

                        {item.originalPrice && (
                            <span className="text-sm line-through text-gray-400">
                                ₹{item.originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}

                        {discount && (
                            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1 mb-3">
                        (incl. GST)
                    </p>

                    {/* CTA */}
                    <Button
                        className="mt-3 w-full h-[44px] bg-black text-white rounded-md"
                        onClick={handleCTA}
                    >
                        {canOpenModal ? "Select Options" : "Add to Cart"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
