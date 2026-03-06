"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Bell, Check, X } from "lucide-react";
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

    // Resin OOS derived
    const selectedColourData = item.resinColours?.find(
        (c) => c.id === selectedColourId,
    );
    const selectedWeightData = item.resinWeights?.find(
        (w) => w.id === selectedWeightId,
    );
    const isResinProductOOS =
        item.itemType === "resin" && item.inStock === false;
    const isResinColourOOS =
        !isResinProductOOS && selectedColourData?.inStock === false;
    const isResinWeightOOS =
        !isResinProductOOS &&
        !isResinColourOOS &&
        selectedWeightData?.inStock === false;
    const isResinAnyOOS =
        isResinProductOOS || isResinColourOOS || isResinWeightOOS;

    /* =====================
       PREBUILT STATE
    ===================== */
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const variants = item.availableVariants ?? [];

    // Unique colors — track if ALL variants for that colour are OOS
    const uniqueColors: { name: string; hex: string | null; isOOS: boolean }[] =
        Array.from(
            new Map(
                variants
                    .filter((v) => v.colorName)
                    .map((v) => [
                        v.colorName,
                        { name: v.colorName!, hex: v.colorHex },
                    ]),
            ).values(),
        ).map((c) => {
            const allForColour = variants.filter(
                (v) => v.colorName === c.name && v.isActive,
            );
            const isOOS =
                allForColour.length > 0 &&
                allForColour.every((v) => v.inStock === false);
            return { ...c, isOOS };
        });

    // Sizes valid for selected color
    const validSizes: { name: string; isOOS: boolean }[] = Array.from(
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
    ).map((size) => {
        const v = variants.find(
            (v) =>
                v.colorName === selectedColor &&
                v.sizeName === size &&
                v.isActive,
        );
        return { name: size, isOOS: v?.inStock === false };
    });

    // Resolve the selected variant
    const selectedVariant =
        variants.find(
            (v) =>
                v.colorName === selectedColor &&
                v.sizeName === selectedSize &&
                v.isActive,
        ) ?? null;

    const isSelectedVariantOOS = selectedVariant?.inStock === false;

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        setSelectedSize(null);
    };

    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
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
            !!selectedWeightId &&
            !isResinAnyOOS) ||
        (item.itemType === "prebuilt" &&
            !!selectedVariant &&
            !isSelectedVariantOOS);

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
                prebuiltVariantId: selectedVariant.id,
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
        if (item.itemType === "resin" && item.slug)
            router.push(`/resins/${item.slug}`);
        if (item.itemType === "prebuilt" && item.slug)
            router.push(`/prebuilt-products/${item.slug}`);
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

                    {/* Stock status */}
                    {item.itemType === "prebuilt" ? (
                        isSelectedVariantOOS ? (
                            <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Out of Stock
                            </div>
                        ) : selectedVariant ? (
                            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                In Stock
                            </div>
                        ) : null
                    ) : item.itemType === "resin" ? (
                        isResinAnyOOS ? (
                            <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Out of Stock
                            </div>
                        ) : selectedColourId && selectedWeightId ? (
                            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                In Stock
                            </div>
                        ) : null
                    ) : (
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            In Stock
                        </div>
                    )}

                    {/* ================= RESIN ================= */}
                    {item.itemType === "resin" && (
                        <>
                            {item.resinColours && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Color
                                        {isResinColourOOS && (
                                            <span className="ml-2 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                Out of Stock
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                        {item.resinColours.map((c) => {
                                            const colourOOS =
                                                isResinProductOOS ||
                                                c.inStock === false;
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() =>
                                                        !colourOOS &&
                                                        setSelectedColourId(
                                                            c.id,
                                                        )
                                                    }
                                                    title={
                                                        colourOOS
                                                            ? `${c.name} — Out of Stock`
                                                            : c.name
                                                    }
                                                    className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                                                        selectedColourId ===
                                                        c.id
                                                            ? "ring-2 ring-blue-600 ring-offset-1"
                                                            : "border-transparent"
                                                    } ${colourOOS ? "opacity-40 cursor-not-allowed" : ""}`}
                                                    style={{
                                                        backgroundColor:
                                                            c.hex ?? "#E5E7EB",
                                                    }}
                                                >
                                                    {colourOOS && (
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <span className="block w-[110%] h-[2px] bg-red-500 rotate-45 rounded" />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {isResinColourOOS && (
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            This colour is out of stock. Select
                                            another colour or get notified
                                            below.
                                        </p>
                                    )}
                                </div>
                            )}

                            {item.resinWeights && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Pack Size
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {item.resinWeights.map((w) => {
                                            const weightOOS =
                                                isResinProductOOS ||
                                                isResinColourOOS ||
                                                w.inStock === false;
                                            const isSelected =
                                                selectedWeightId === w.id;
                                            // Convert grams to kg label
                                            const weightLabel =
                                                typeof w.label === "number"
                                                    ? w.label >= 1000
                                                        ? `${w.label / 1000} kg`
                                                        : `${w.label} g`
                                                    : w.label; // already a string from ResinGrid
                                            return (
                                                <button
                                                    key={w.id}
                                                    onClick={() => {
                                                        if (weightOOS) return;
                                                        setSelectedWeightId(
                                                            w.id,
                                                        );
                                                        setDisplayPrice(
                                                            w.price,
                                                        );
                                                    }}
                                                    disabled={weightOOS}
                                                    title={
                                                        w.inStock === false &&
                                                        !isResinProductOOS &&
                                                        !isResinColourOOS
                                                            ? "Out of Stock"
                                                            : undefined
                                                    }
                                                    className={`h-10 rounded-lg border text-sm transition-all ${
                                                        isSelected
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : weightOOS
                                                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                                                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {weightLabel}
                                                    {w.inStock === false &&
                                                        !isResinProductOOS &&
                                                        !isResinColourOOS && (
                                                            <span className="ml-0.5 text-[9px] text-red-400"></span>
                                                        )}
                                                </button>
                                            );
                                        })}
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
                                                    !c.isOOS &&
                                                    handleColorChange(c.name)
                                                }
                                                disabled={c.isOOS}
                                                title={
                                                    c.isOOS
                                                        ? `${c.name} — Out of Stock`
                                                        : c.name
                                                }
                                                className={`relative w-9 h-9 rounded-full border-2 transition-all ring-offset-1 ${
                                                    selectedColor === c.name
                                                        ? "ring-2 ring-gray-900 scale-110"
                                                        : "border-transparent hover:ring-1 hover:ring-gray-400"
                                                } ${c.isOOS ? "opacity-35 cursor-not-allowed" : ""}`}
                                                style={{
                                                    backgroundColor:
                                                        c.hex ?? "#E5E7EB",
                                                }}
                                            >
                                                {selectedColor === c.name &&
                                                    !c.isOOS && (
                                                        <Check
                                                            size={12}
                                                            className="absolute inset-0 m-auto text-white drop-shadow"
                                                        />
                                                    )}
                                                {/* Red diagonal strikethrough for OOS colour */}
                                                {c.isOOS && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span className="block w-[110%] h-[2px] bg-red-500 rotate-45 rounded" />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SIZE BUTTONS */}
                            {validSizes.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-sm font-medium mb-2">
                                        Size
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {validSizes.map(
                                            ({
                                                name: size,
                                                isOOS: sizeOOS,
                                            }) => (
                                                <button
                                                    key={size}
                                                    onClick={() =>
                                                        !sizeOOS &&
                                                        handleSizeChange(size)
                                                    }
                                                    disabled={sizeOOS}
                                                    title={
                                                        sizeOOS
                                                            ? `${size} — Out of Stock`
                                                            : undefined
                                                    }
                                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                        selectedSize === size
                                                            ? "border-gray-900 bg-gray-900 text-white"
                                                            : sizeOOS
                                                              ? "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                                                              : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {size}
                                                    {sizeOOS && (
                                                        <span className="ml-1 text-[10px] text-red-400"></span>
                                                    )}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SELECTED VARIANT PRICE UPDATE */}
                            {selectedVariant &&
                                selectedVariant.price !== item.price &&
                                !isSelectedVariantOOS && (
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

                            {/* OOS message for selected variant */}
                            {isSelectedVariantOOS && (
                                <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                                    This colour + size combination is currently
                                    out of stock. Visit the product page to get
                                    notified when it's back.
                                </p>
                            )}
                        </>
                    )}

                    {/* QUANTITY — hidden if any OOS */}
                    {!isSelectedVariantOOS && !isResinAnyOOS && (
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
                    )}

                    {/* CTA */}
                    {isSelectedVariantOOS || isResinAnyOOS ? (
                        <button
                            onClick={goToPDP}
                            className="w-full h-[48px] mt-8 font-semibold rounded-xl border-2 border-orange-400 text-orange-500 hover:bg-orange-50 transition flex items-center justify-center gap-2 text-sm"
                        >
                            <Bell size={14} />
                            Notify Me — View Product
                        </button>
                    ) : (
                        <Button
                            disabled={!canAddToCart}
                            onClick={handleAddToCart}
                            className="w-full h-[48px] mt-8 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Add to Cart
                        </Button>
                    )}

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
