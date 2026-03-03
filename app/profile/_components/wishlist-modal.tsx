"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Check, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WishlistGridItem } from "./wishlist.types";

export default function WishlistModal({
    item,
    onClose,
}: {
    item: WishlistGridItem;
    onClose: () => void;
}) {
    const { addToCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    /* =====================
       RESIN STATE
    ===================== */
    const [selectedColourId, setSelectedColourId] = useState<string | null>(
        null,
    );
    const [selectedWeightId, setSelectedWeightId] = useState<string | null>(
        null,
    );
    const [displayPrice, setDisplayPrice] = useState<number>(item.price);

    /* =====================
       PREBUILT STATE
    ===================== */
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const variants = item.availableVariants ?? [];

    // Unique colors from variants
    const uniqueColors: { name: string; hex: string | null }[] = Array.from(
        new Map(
            variants
                .filter((v) => v.colorName)
                .map((v) => [
                    v.colorName,
                    { name: v.colorName!, hex: v.colorHex },
                ]),
        ).values(),
    );

    // Sizes valid for selected color (or all sizes if no color selected)
    const validSizes: string[] = Array.from(
        new Set(
            variants
                .filter(
                    (v) =>
                        v.sizeName &&
                        v.isActive &&
                        (!selectedColor || v.colorName === selectedColor),
                )
                .map((v) => v.sizeName!),
        ),
    );

    // Resolve the selected variant
    const selectedVariant =
        variants.find(
            (v) =>
                v.colorName === selectedColor &&
                v.sizeName === selectedSize &&
                v.isActive,
        ) ?? null;

    // Update display price when variant changes
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        setSelectedSize(null); // reset size on color change
    };

    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
        // Update preview price
        const v = variants.find(
            (v) =>
                v.colorName === selectedColor &&
                v.sizeName === size &&
                v.isActive,
        );
        if (v) setDisplayPrice(v.price);
    };

    /* =====================
       QUANTITY
    ===================== */
    const [quantity, setQuantity] = useState(1);

    /* =====================
       VALIDATION
    ===================== */
    const canAddToCart =
        (item.itemType === "resin" &&
            !!selectedColourId &&
            !!selectedWeightId) ||
        (item.itemType === "prebuilt" && !!selectedVariant);

    /* =====================
       ACTIONS
    ===================== */
    const handleAddToCart = async () => {
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
                action: (
                    <button
                        onClick={() => signIn()}
                        className="px-3 py-1 bg-white text-black rounded"
                    >
                        Log in
                    </button>
                ),
            });
            return;
        }

        if (item.itemType === "resin") {
            await addToCart({
                ...item.cartPayload,
                resinColourId: selectedColourId ?? undefined,
                resinWeightId: selectedWeightId ?? undefined,
                quantity,
            });
        }

        if (item.itemType === "prebuilt" && selectedVariant) {
            await addToCart({
                prebuiltProductId: item.cartPayload.prebuiltProductId,
                prebuiltVariantId: selectedVariant.id, // ✅ correct field
                quantity,
            });
        }

        onClose();
        toast({
            title: "Added to Cart",
            description: `${item.title} has been added to your cart.`,
        });
    };

    const goToPDP = () => {
        if (item.itemType === "resin" && item.slug) {
            router.push(`/resins/${item.slug}`);
        }
        if (item.itemType === "prebuilt" && item.slug) {
            router.push(`/prebuilt-products/${item.slug}`);
        }
        onClose();
    };

    /* =====================
       UI
    ===================== */
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="flex gap-4 p-5 relative">
                    <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={56}
                        height={56}
                        className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold pr-6">
                            {item.title}
                        </h2>
                        {item.badge && (
                            <span className="inline-block mt-1 px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                                {item.badge}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black"
                    >
                        <X />
                    </button>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="p-5 pb-8">
                    {/* PRICE */}
                    <div className="text-xl font-semibold">
                        ₹{displayPrice.toLocaleString("en-IN")}{" "}
                        <span className="text-sm text-gray-500">
                            (incl. GST)
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        In Stock
                    </div>

                    {/* ================= RESIN ================= */}
                    {item.itemType === "resin" && (
                        <>
                            {item.resinColours && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Color
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {item.resinColours.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() =>
                                                    setSelectedColourId(c.id)
                                                }
                                                title={c.name}
                                                className={`w-9 h-9 rounded-full border-2 transition-all ${
                                                    selectedColourId === c.id
                                                        ? "ring-2 ring-blue-600 ring-offset-1"
                                                        : "border-transparent"
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        c.hex ?? "#E5E7EB",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {item.resinWeights && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Pack Size
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {item.resinWeights.map((w) => (
                                            <button
                                                key={w.id}
                                                onClick={() => {
                                                    setSelectedWeightId(w.id);
                                                    setDisplayPrice(w.price);
                                                }}
                                                className={`h-10 rounded-lg border text-sm ${
                                                    selectedWeightId === w.id
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : "bg-white text-gray-700 border-gray-200"
                                                }`}
                                            >
                                                {w.label}g
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ================= PREBUILT ================= */}
                    {item.itemType === "prebuilt" && (
                        <>
                            {/* COLOR SWATCHES */}
                            {uniqueColors.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Color:{" "}
                                        <span className="font-normal text-gray-500">
                                            {selectedColor ?? "Select"}
                                        </span>
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {uniqueColors.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() =>
                                                    handleColorChange(c.name)
                                                }
                                                title={c.name}
                                                className={`relative w-9 h-9 rounded-full border-2 transition-all ring-offset-1 ${
                                                    selectedColor === c.name
                                                        ? "ring-2 ring-gray-900 scale-110"
                                                        : "border-transparent hover:ring-1 hover:ring-gray-400"
                                                }`}
                                                style={{
                                                    backgroundColor:
                                                        c.hex ?? "#E5E7EB",
                                                }}
                                            >
                                                {selectedColor === c.name && (
                                                    <Check
                                                        size={12}
                                                        className="absolute inset-0 m-auto text-white drop-shadow"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SIZE BUTTONS — filtered by selected color */}
                            {validSizes.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Size
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {validSizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() =>
                                                    handleSizeChange(size)
                                                }
                                                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                    selectedSize === size
                                                        ? "border-gray-900 bg-gray-900 text-white"
                                                        : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SELECTED VARIANT PRICE UPDATE */}
                            {selectedVariant &&
                                selectedVariant.price !== item.price && (
                                    <p className="mt-3 text-sm text-gray-500">
                                        Price for this variant:{" "}
                                        <span className="font-semibold text-gray-900">
                                            ₹
                                            {selectedVariant.price.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    </p>
                                )}
                        </>
                    )}

                    {/* QUANTITY */}
                    <div className="mt-5">
                        <p className="text-sm font-medium mb-2">Quantity</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                            >
                                −
                            </button>
                            <div className="flex-1 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-semibold text-base">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* CTA */}
                    <Button
                        disabled={!canAddToCart}
                        onClick={handleAddToCart}
                        className="w-full h-[48px] mt-8 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Add to Cart
                    </Button>

                    <button
                        onClick={goToPDP}
                        className="w-full text-sm mt-3 text-gray-500 hover:text-black"
                    >
                        View full details →
                    </button>
                </div>
            </div>
        </div>
    );
}
