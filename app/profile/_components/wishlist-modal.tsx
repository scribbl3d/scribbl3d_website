"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { X } from "lucide-react";
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

    /* =====================
       STATE
    ===================== */

    const [selectedColourId, setSelectedColourId] = useState<string | null>(
        null
    );
    const [selectedWeightId, setSelectedWeightId] = useState<string | null>(
        null
    );
    const prebuiltColours = item.availableColours ?? [];
    const prebuiltSizes = item.availableSizes ?? [];

    const [selectedPrebuiltColour, setSelectedPrebuiltColour] = useState<
        string | null
    >(null);
    const [selectedPrebuiltSize, setSelectedPrebuiltSize] = useState<
        string | null
    >(null);
    const [displayPrice, setDisplayPrice] = useState<number>(item.price);

    const [quantity, setQuantity] = useState(1);

    /* =====================
       VALIDATION
    ===================== */

    const canAddToCart =
        (item.itemType === "resin" && selectedColourId && selectedWeightId) ||
        (item.itemType === "prebuilt" &&
            selectedPrebuiltColour &&
            selectedPrebuiltSize);

    /* =====================
       ACTIONS
    ===================== */

    const handleAddToCart = async () => {
        await addToCart({
            ...item.cartPayload,

            resinColourId:
                item.itemType === "resin"
                    ? (selectedColourId ?? undefined)
                    : undefined,

            resinWeightId:
                item.itemType === "resin"
                    ? (selectedWeightId ?? undefined)
                    : undefined,

            prebuiltColour:
                item.itemType === "prebuilt"
                    ? (selectedPrebuiltColour ?? undefined)
                    : undefined,

            prebuiltSize:
                item.itemType === "prebuilt"
                    ? (selectedPrebuiltSize ?? undefined)
                    : undefined,

            quantity,
        });

        onClose();
        toast({
            title: "Added to Cart",
            description: `${item.title} has been added to your cart.`,
        });
    };

    const goToPDP = () => {
        if (item.itemType === "resin") {
            router.push(`/resins/${item.slug}`);
        }

        if (item.itemType === "prebuilt") {
            router.push(`/product/${item.cartPayload.prebuiltProductId}`);
        }

        onClose();
    };

    /* =====================
       UI
    ===================== */

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-[420px] overflow-hidden">
                {/* HEADER */}
                <div className="flex gap-4 p-6 relative">
                    <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={56}
                        height={56}
                        className="rounded-lg object-cover"
                    />

                    <div className="flex-1">
                        <h2 className="text-lg font-semibold">{item.title}</h2>

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

                <div className="p-6">
                    {/* PRICE */}
                    <div className="text-xl font-semibold">
                        ₹{displayPrice}{" "}
                        <span className="text-sm text-gray-500">
                            (incl. GST)
                        </span>
                    </div>

                    {/* IN STOCK */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        In Stock
                    </div>

                    {/* ================= RESIN ================= */}
                    {item.itemType === "resin" && (
                        <>
                            {/* COLOR */}
                            {item.resinColours && (
                                <div className="mt-6">
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
                                                className={`w-9 h-9 rounded-full border ${
                                                    selectedColourId === c.id
                                                        ? "ring-2 ring-blue-600"
                                                        : ""
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

                            {/* PACK SIZE */}
                            {item.resinWeights && (
                                <div className="mt-6">
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
                                                        : ""
                                                }`}
                                            >
                                                {w.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ================= PREBUILT ================= */}
                    {/* PREBUILT COLORS */}
                    {item.itemType === "prebuilt" &&
                        prebuiltColours.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-medium mb-2">
                                    Color:
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {prebuiltColours.map((c) => (
                                        <button
                                            key={c.label}
                                            onClick={() =>
                                                setSelectedPrebuiltColour(
                                                    c.label
                                                )
                                            }
                                            className={`px-3 py-2 rounded-lg border text-sm ${
                                                selectedPrebuiltColour ===
                                                c.label
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white"
                                            }`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* QUANTITY */}
                    {/* PREBUILT SIZES */}
                    {item.itemType === "prebuilt" &&
                        prebuiltSizes.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-medium mb-2">
                                    Size:
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {prebuiltSizes.map((s) => (
                                        <button
                                            key={s.label}
                                            onClick={() =>
                                                setSelectedPrebuiltSize(s.label)
                                            }
                                            className={`h-10 rounded-lg border text-sm ${
                                                selectedPrebuiltSize === s.label
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-white"
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* CTA */}
                    <Button
                        disabled={!canAddToCart}
                        onClick={handleAddToCart}
                        className="w-full h-[48px] mt-8 bg-black text-white disabled:bg-gray-400"
                    >
                        Add to Cart
                    </Button>

                    <button
                        onClick={goToPDP}
                        className="w-full text-sm mt-3 text-gray-500 hover:text-black"
                    >
                        View full details
                    </button>
                </div>
            </div>
        </div>
    );
}
