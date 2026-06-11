"use client";

import { useCart } from "@/providers/CartProvider";
import { toast } from "@/components/ui/use-toast";
import { Bell, Check, Loader2, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSwatchStyle } from "@/lib/utils";

export interface FilamentVariantItem {
    id: string;
    name: string;
    image: string;
    /** material label shown as a badge, e.g. "PLA", "PETG" */
    material: string;
    price: number;
    originalPrice?: number | null;
    discount?: number;
    /** Available colour swatches */
    colours: { name: string; hex: string | null }[];
    /** Available diameters, e.g. ["1.75mm", "3mm"] */
    diameters: string[];
    /** Available spool sizes, e.g. ["250g", "500g", "1 kg", "3 kg"] */
    spoolWeights: string[];
    /** Link to the full PDP */
    pdpHref: string;
    inStock: boolean;
}

interface FilamentVariantModalProps {
    item: FilamentVariantItem;
    onClose: () => void;
}

const DIAMETER_OPTIONS = ["1.75mm", "2.85mm", "3mm"];

export default function FilamentVariantModal({ item, onClose }: FilamentVariantModalProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    const { data: session } = useSession();

    /* ── scroll lock ── */
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    /* ── state ── */
    const [selectedDiameter, setSelectedDiameter] = useState<string | null>(
        item.diameters.length === 1 ? item.diameters[0] : null
    );
    const [selectedWeight, setSelectedWeight] = useState<string | null>(
        item.spoolWeights.length === 1 ? item.spoolWeights[0] : null
    );
    const [quantity, setQuantity] = useState(1);
    const [addingState, setAddingState] = useState<"idle" | "loading" | "success">("idle");

    const availableDiameters = item.diameters.length > 0
        ? item.diameters
        : DIAMETER_OPTIONS;
    const availableWeights = item.spoolWeights.length > 0
        ? item.spoolWeights
        : ["250g", "500g", "1 kg", "3 kg"];

    const canAdd = !!(selectedDiameter && selectedWeight) && item.inStock;

    /* ── handlers ── */
    const handleAddToCart = async () => {
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
                action: (
                    <button onClick={() => signIn()} className="px-3 py-1 bg-white text-black rounded text-sm font-semibold">
                        Log in
                    </button>
                ),
            });
            return;
        }

        setAddingState("loading");
        try {
            await addToCart({ productId: item.id, quantity });
            setAddingState("success");
            toast({
                title: "Added to Cart",
                description: `${item.name} (${selectedDiameter}, ${selectedWeight}) has been added.`,
            });
            setTimeout(() => onClose(), 800);
        } catch {
            setAddingState("idle");
            toast({ title: "Failed to add item", description: "Something went wrong. Please try again.", variant: "destructive" });
        }
    };

    const goToPDP = () => {
        router.push(item.pdpHref);
        onClose();
    };

    /* ── ui ── */
    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 relative flex-shrink-0 border-b border-gray-200">
                    {/* Pull indicator (mobile) */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />

                    {item.image && (
                        <Image
                            src={item.image}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="rounded-xl object-cover flex-shrink-0 mt-2 sm:mt-0 border border-gray-100"
                            unoptimized
                        />
                    )}

                    <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                        <h2 className="text-base sm:text-lg font-bold pr-8 line-clamp-2 text-gray-900">
                            {item.name}
                        </h2>
                        <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] sm:text-xs rounded-full bg-blue-50 text-blue-600 font-semibold">
                            {item.material}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-4 sm:p-5 pb-6 overflow-y-auto flex-1 space-y-5">

                    {/* PRICE */}
                    <div className="flex items-end gap-2">
                        <span className="text-xl font-black text-gray-900">₹{item.price.toLocaleString("en-IN")}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <>
                                <span className="text-sm text-gray-400 line-through mb-0.5">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                                {item.discount && (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded mb-0.5">{item.discount}% OFF</span>
                                )}
                            </>
                        )}
                    </div>


                    {/* DIAMETER */}
                    <div>
                        <p className="text-sm font-semibold text-gray-800 mb-2.5">Diameter</p>
                        <div className="flex gap-2 flex-wrap">
                            {availableDiameters.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDiameter(d)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                        selectedDiameter === d
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SPOOL WEIGHT / SIZE */}
                    <div>
                        <p className="text-sm font-semibold text-gray-800 mb-2.5">Spool Size</p>
                        <div className="flex gap-2 flex-wrap">
                            {availableWeights.map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setSelectedWeight(w)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                        selectedWeight === w
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* QUANTITY */}
                    <div>
                        <p className="text-sm font-semibold text-gray-800 mb-2.5">Quantity</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={addingState !== "idle"}
                                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl disabled:opacity-40"
                            >
                                −
                            </button>
                            <div className="flex-1 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-bold text-base">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                disabled={addingState !== "idle"}
                                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER CTAs */}
                <div className="p-4 sm:p-5 pt-0 space-y-2 flex-shrink-0">
                    {!item.inStock ? (
                        <button
                            onClick={goToPDP}
                            className="w-full h-12 font-semibold rounded-xl border-2 border-orange-400 text-orange-500 hover:bg-orange-50 transition flex items-center justify-center gap-2 text-sm"
                        >
                            <Bell size={16} />
                            Notify Me — View Product
                        </button>
                    ) : (
                        <button
                            disabled={!canAdd || addingState !== "idle"}
                            onClick={handleAddToCart}
                            className={`w-full h-12 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                                addingState === "success"
                                    ? "bg-green-600 text-white"
                                    : canAdd
                                    ? "bg-gray-900 hover:bg-black text-white"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {addingState === "loading" ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
                            ) : addingState === "success" ? (
                                <><Check className="w-4 h-4" /> Added to Cart!</>
                            ) : canAdd ? (
                                `Add to Cart · ₹${(item.price * quantity).toLocaleString("en-IN")}`
                            ) : (
                                "Select all options"
                            )}
                        </button>
                    )}

                    <button
                        onClick={goToPDP}
                        disabled={addingState === "loading"}
                        className="w-full text-sm text-gray-500 hover:text-black disabled:opacity-40 py-2 transition text-center"
                    >
                        View full details →
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Returns true if the hex colour is light (so we use dark text on top). */
function isLightColor(hex: string | null): boolean {
    if (!hex) return false;
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    // YIQ formula
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
