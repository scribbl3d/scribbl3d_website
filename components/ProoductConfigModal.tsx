"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type Mode = "resin" | "prebuilt";

interface Props {
    open: boolean;
    onClose: () => void;
    mode: Mode;

    product: any; // resin or prebuilt object
    wishlistItemId?: string;

    onAdded?: () => void;
}

export default function ProductConfigModal({
    open,
    onClose,
    mode,
    product,
    wishlistItemId,
    onAdded,
}: Props) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    /* ---------- STATE ---------- */
    const [color, setColor] = useState<string | null>(null);
    const [size, setSize] = useState<string | null>(null);
    const [weightId, setWeightId] = useState<string | null>(null);
    const [qty, setQty] = useState(1);

    /* ---------- DERIVED ---------- */
    const price = useMemo(() => {
        if (mode === "resin") {
            return (
                product.weights?.find((w: any) => w.id === weightId)?.price ??
                null
            );
        }
        return product.price;
    }, [mode, product, weightId]);

    const image = useMemo(() => {
        if (mode === "resin") {
            return (
                product.colours?.find((c: any) => c.id === color)?.images?.[0]
                    ?.url ??
                product.cardImageUrl ??
                "/placeholder.svg"
            );
        }
        return product.images?.[0] ?? "/placeholder.svg";
    }, [mode, product, color]);

    const isValid =
        mode === "resin" ? Boolean(color && weightId) : Boolean(color && size);

    /* ---------- ADD ---------- */
    async function handleAdd() {
        if (!isValid) {
            toast({
                title: "Select required options",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            await addToCart(
                mode === "resin"
                    ? {
                          resinId: product.id,
                          resinColourId: color!,
                          resinWeightId: weightId!,
                          quantity: qty,
                      }
                    : {
                          prebuiltProductId: product.id,

                          quantity: qty,
                      },
            );

            if (wishlistItemId) {
                await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resinId: mode === "resin" ? product.id : undefined,
                        prebuiltProductId:
                            mode === "prebuilt" ? product.id : undefined,
                    }),
                });
            }

            toast({ title: "Added to cart" });
            onAdded?.();
            onClose();
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-xl p-5 relative">
                <button onClick={onClose} className="absolute top-3 right-3">
                    <X />
                </button>

                <div className="flex gap-4">
                    <Image
                        src={image}
                        alt={product.name}
                        width={90}
                        height={90}
                        className="rounded-lg object-cover"
                    />

                    <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                            {price ? `₹${price}` : "Select options"}
                        </p>
                    </div>
                </div>

                {/* ---------- OPTIONS ---------- */}
                <div className="mt-4 space-y-4">
                    {mode === "resin" && (
                        <>
                            <div>
                                <p className="text-sm font-medium mb-1">
                                    Colour
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.colours.map((c: any) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setColor(c.id)}
                                            className={`px-3 py-1 border rounded ${
                                                color === c.id
                                                    ? "border-black"
                                                    : ""
                                            }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-1">
                                    Weight
                                </p>
                                <div className="flex gap-2">
                                    {product.weights.map((w: any) => (
                                        <button
                                            key={w.id}
                                            onClick={() => setWeightId(w.id)}
                                            className={`px-3 py-1 border rounded ${
                                                weightId === w.id
                                                    ? "border-black"
                                                    : ""
                                            }`}
                                        >
                                            {w.weightInGrams}g
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {mode === "prebuilt" && (
                        <>
                            <div>
                                <p className="text-smAttachments font-medium mb-1">
                                    Colour
                                </p>
                                <div className="flex gap-2">
                                    {product.availableColors.map(
                                        (c: string) => (
                                            <button
                                                key={c}
                                                onClick={() => setColor(c)}
                                                className={`px-3 py-1 border rounded ${
                                                    color === c
                                                        ? "border-black"
                                                        : ""
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-1">Size</p>
                                <div className="flex gap-2">
                                    {product.availableSizes.map((s: string) => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s)}
                                            className={`px-3 py-1 border rounded ${
                                                size === s ? "border-black" : ""
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <Button
                    className="w-full mt-6"
                    disabled={!isValid || loading}
                    onClick={handleAdd}
                >
                    {loading ? "Adding..." : "Add to Cart"}
                </Button>
            </div>
        </div>
    );
}
