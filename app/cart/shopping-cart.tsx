"use client";

import type { Discount } from "@/app/admin/discounts/types";
import { calculateDiscount } from "@/app/cart/utils/calculateDiscount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import type { CartItem } from "@/providers/CartProvider";
import { useCart } from "@/providers/CartProvider";
import { useCheckout } from "@/providers/CheckoutProvider";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Minus,
    Plus,
    ShoppingCart as ShoppingCartIcon,
    Ticket,
    Trash2,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* =================================================================
   TYPES
================================================================= */

interface ProductSuggestion {
    id: string;
    name: string;
    images: string[];
    price: number;
    mrp?: number;
    category?: string;
    itemType?: string;
    technology?: string;
    buildVolume?: string;
}

/**
 * Shape used for available coupons displayed in the modal.
 * Built from the Discount model:
 *   id, name, code, scope, valueType, value,
 *   minOrderValue, maxDiscount, expiresAt, isHidden, isActive, createdAt, updatedAt
 */
interface AvailableCoupon {
    code: string;
    name: string;
    valueLabel: string;
    description: string;
    expiresOn: string | null;
    discount: Discount;
}

/* =================================================================
   HELPER: Build display label for a Discount
================================================================= */

function buildValueLabel(d: Discount): string {
    if (d.valueType === "flat") {
        return `Save ₹${d.value.toLocaleString("en-IN")}`;
    }
    return `${d.value}% OFF`;
}

function buildDescription(d: Discount): string {
    const parts: string[] = [];

    if (d.valueType === "flat") {
        parts.push(`Flat ₹${d.value.toLocaleString("en-IN")} off`);
    } else {
        parts.push(`Get ${d.value}% off`);
    }

    if (d.scope === "item_type" && d.itemTypes?.length > 0) {
        const types = d.itemTypes.map(
            (t: { itemType: string }) => t.itemType + "s",
        );
        parts[0] += ` on all ${types.join(" & ")}`;
    } else {
        parts[0] += " on your order";
    }

    if (d.maxDiscount) {
        parts.push(`Max discount ₹${d.maxDiscount.toLocaleString("en-IN")}`);
    }

    if (d.minOrderValue) {
        parts.push(`Min. order ₹${d.minOrderValue.toLocaleString("en-IN")}`);
    }

    return parts.join(". ") + ".";
}

function formatExpiryDate(date: string | null | undefined): string | null {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/* =================================================================
   HELPER: Recommendation Logic
================================================================= */

/**
 * Determines which product types to recommend based on cart contents.
 *
 * Logic:
 *  - PRINTER   → filaments, resins
 *  - PRODUCT   → printers (FDM/FFF), prebuilt products, other products
 *  - RESIN     → resin printers (SLA, DLP), other resins
 *  - PREBUILT  → other prebuilts (different categories), 1-2 printers
 */
function getRecommendationFilters(cartItems: CartItem[]): {
    itemTypes: string[];
    technologies?: string[];
    excludeIds: string[];
} {
    const itemTypes = new Set<string>();
    const excludeIds = cartItems.map((i) => i.id);

    for (const item of cartItems) {
        if (item.itemType) itemTypes.add(item.itemType.toLowerCase());
    }

    const recTypes: string[] = [];
    const recTechnologies: string[] = [];

    if (itemTypes.has("printer")) {
        recTypes.push("product", "resin");
    }
    if (itemTypes.has("product")) {
        recTypes.push("printer", "prebuilt", "product");
        recTechnologies.push("FDM", "FFF");
    }
    if (itemTypes.has("resin")) {
        recTypes.push("printer", "resin");
        recTechnologies.push("SLA", "DLP");
    }
    if (itemTypes.has("prebuilt")) {
        recTypes.push("prebuilt", "printer");
    }

    // Fallback: if cart has unknown types, show a mix
    if (recTypes.length === 0) {
        recTypes.push("printer", "product", "resin", "prebuilt");
    }

    // Deduplicate using Array.from to avoid TS2802
    const uniqueTypes = Array.from(new Set(recTypes));
    const uniqueTech =
        recTechnologies.length > 0
            ? Array.from(new Set(recTechnologies))
            : undefined;

    return {
        itemTypes: uniqueTypes,
        technologies: uniqueTech,
        excludeIds,
    };
}

/* =================================================================
   COMPONENT: CouponCard
================================================================= */

function CouponCard({
    coupon,
    isSelected,
    onSelect,
}: {
    coupon: AvailableCoupon;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                    ? "border-blue-500 bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900">
                        {coupon.code}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-0.5">
                        {coupon.valueLabel}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
                        {coupon.description}
                    </p>
                    {coupon.expiresOn && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                            <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <rect
                                    x="2"
                                    y="3"
                                    width="12"
                                    height="11"
                                    rx="1.5"
                                />
                                <path d="M2 6.5h12" />
                                <path d="M5.5 1.5v3M10.5 1.5v3" />
                            </svg>
                            <span className="uppercase tracking-wide">
                                Expires on {coupon.expiresOn}
                            </span>
                        </div>
                    )}
                </div>

                <div className="ml-3 mt-1 flex-shrink-0">
                    {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg
                                width="10"
                                height="10"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M2 6L5 9L10 3"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                </div>
            </div>
        </button>
    );
}

/* =================================================================
   COMPONENT: CouponModal (Desktop dialog / Mobile bottom-sheet)
================================================================= */

function CouponModal({
    isOpen,
    onClose,
    coupons,
    appliedCode,
    cartItems,
    onApplyCoupon,
    onCheckCode,
}: {
    isOpen: boolean;
    onClose: () => void;
    coupons: AvailableCoupon[];
    appliedCode: string | undefined;
    cartItems: CartItem[];
    onApplyCoupon: (coupon: AvailableCoupon | null) => void;
    onCheckCode: (code: string) => Promise<{
        valid: boolean;
        message: string;
        coupon?: AvailableCoupon;
    }>;
}) {
    const [manualCode, setManualCode] = useState("");
    const [codeStatus, setCodeStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });
    const [selectedCode, setSelectedCode] = useState<string | null>(
        appliedCode ?? null,
    );
    const [isChecking, setIsChecking] = useState(false);
    const [manualCoupon, setManualCoupon] = useState<AvailableCoupon | null>(
        null,
    );

    useEffect(() => {
        setSelectedCode(appliedCode ?? null);
    }, [appliedCode]);

    if (!isOpen) return null;

    const handleCheckCode = async () => {
        if (!manualCode.trim()) return;
        setIsChecking(true);
        try {
            const result = await onCheckCode(manualCode.trim().toUpperCase());
            if (result.valid) {
                setCodeStatus({ type: "success", message: result.message });
                if (result.coupon) {
                    setSelectedCode(result.coupon.code);
                    // Store the manually validated coupon so handleApply can find it
                    setManualCoupon(result.coupon);
                }
            } else {
                setCodeStatus({ type: "error", message: result.message });
            }
        } catch {
            setCodeStatus({
                type: "error",
                message: "This coupon is not applicable to your order",
            });
        }
        setIsChecking(false);
    };

    const handleApply = () => {
        // Check visible coupons first, then fall back to manually validated coupon
        const selected =
            coupons.find((c) => c.code === selectedCode) ??
            (manualCoupon?.code === selectedCode ? manualCoupon : null);
        onApplyCoupon(selected);
        onClose();
    };

    const hasSelection = selectedCode !== null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div
                    className="pointer-events-auto bg-white w-full sm:w-[480px] sm:max-h-[85vh] max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drag handle (mobile) */}
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                            Apply Coupons
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Code input */}
                    <div className="px-5 sm:px-6 pb-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="ENTER CODE"
                                value={manualCode}
                                onChange={(e) => {
                                    setManualCode(e.target.value.toUpperCase());
                                    setCodeStatus({ type: null, message: "" });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCheckCode();
                                }}
                                className="flex-1 h-11 sm:h-12 rounded-full border-gray-200 bg-white text-sm font-medium tracking-wide placeholder:text-gray-400 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Button
                                onClick={handleCheckCode}
                                disabled={isChecking || !manualCode.trim()}
                                className="h-11 sm:h-12 px-5 sm:px-6 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 text-sm"
                            >
                                {isChecking ? "..." : "Check"}
                            </Button>
                        </div>
                        {codeStatus.type && (
                            <div
                                className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${
                                    codeStatus.type === "success"
                                        ? "text-green-600"
                                        : "text-red-500"
                                }`}
                            >
                                {codeStatus.type === "success" ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <AlertCircle className="w-4 h-4" />
                                )}
                                {codeStatus.message}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Available coupons list */}
                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
                        {(() => {
                            // Filter to only applicable coupons
                            const applicableCoupons = coupons.filter(
                                (coupon) => {
                                    const d = coupon.discount;

                                    // Check scoped item types
                                    if (
                                        d.scope === "item_type" &&
                                        d.itemTypes?.length > 0
                                    ) {
                                        const allowedTypes = d.itemTypes.map(
                                            (t: { itemType: string }) =>
                                                t.itemType,
                                        );
                                        const scopedSubtotal = cartItems
                                            .filter((item) =>
                                                allowedTypes.includes(
                                                    item.itemType,
                                                ),
                                            )
                                            .reduce(
                                                (sum, item) =>
                                                    sum +
                                                    item.price * item.quantity,
                                                0,
                                            );
                                        if (scopedSubtotal === 0) return false;
                                    }

                                    // Check min order value
                                    if (d.minOrderValue) {
                                        const cartTotal = cartItems.reduce(
                                            (sum, item) =>
                                                sum +
                                                item.price * item.quantity,
                                            0,
                                        );
                                        if (cartTotal < d.minOrderValue)
                                            return false;
                                    }

                                    return true;
                                },
                            );

                            if (applicableCoupons.length === 0) return null;

                            return (
                                <>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                        Available Offers
                                    </p>
                                    <div className="space-y-3">
                                        {applicableCoupons.map((coupon) => (
                                            <CouponCard
                                                key={coupon.code}
                                                coupon={coupon}
                                                isSelected={
                                                    selectedCode === coupon.code
                                                }
                                                onSelect={() => {
                                                    setSelectedCode(
                                                        selectedCode ===
                                                            coupon.code
                                                            ? null
                                                            : coupon.code,
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Apply button */}
                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100">
                        <Button
                            onClick={handleApply}
                            disabled={!hasSelection}
                            className={`w-full h-14 rounded-2xl text-base font-semibold transition-all ${
                                hasSelection
                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {appliedCode && selectedCode === appliedCode
                                ? "Coupon Applied"
                                : "Apply Coupon"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* =================================================================
   COMPONENT: ProductSuggestionCard
================================================================= */

function ProductSuggestionCard({
    product,
    onAddToCart,
}: {
    product: ProductSuggestion;
    onAddToCart: (product: ProductSuggestion) => void;
}) {
    const hasDiscount = product.mrp && product.mrp > product.price;

    return (
        <div className="flex-shrink-0 w-[180px] sm:w-[200px] bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-200 snap-start">
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {product.images[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingCartIcon className="w-10 h-10" />
                    </div>
                )}
            </div>

            <div className="p-3">
                {/* Category badge — shows technology/tileType/category based on itemType */}
                {product.itemType && (
                    <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${
                            product.itemType.toLowerCase() === "printer"
                                ? "bg-blue-100 text-blue-700"
                                : product.itemType.toLowerCase() === "product"
                                  ? "bg-orange-100 text-orange-700"
                                  : product.itemType.toLowerCase() === "resin"
                                    ? "bg-purple-100 text-purple-700"
                                    : product.itemType.toLowerCase() ===
                                        "prebuilt"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {/*
                          Badge text per type:
                            printer  → technology (FDM, SLA, DLP)
                            product  → category (PLA, ABS, PETG)
                            prebuilt → category (Enclosure, Accessory)
                            resin    → resolution + " Resolution" (e.g. "4K Resolution")
                        */}
                        {product.itemType.toLowerCase() === "resin" &&
                        product.category
                            ? `${product.category} Resolution`
                            : product.technology ||
                              product.category ||
                              product.itemType}
                    </span>
                )}

                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
                    {product.name}
                </h4>

                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-bold text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                            ₹{product.mrp!.toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                <Button
                    onClick={() => onAddToCart(product)}
                    className="w-full mt-3 h-9 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="sm:hidden">Add</span>
                    <span className="hidden sm:inline">Add to Cart</span>
                </Button>
            </div>
        </div>
    );
}

/* =================================================================
   COMPONENT: ProductCarousel
   Horizontal scrollable carousel with left/right nav arrows
================================================================= */

function ProductCarousel({
    title,
    subtitle,
    products,
    onAddToCart,
}: {
    title: string;
    subtitle: string;
    products: ProductSuggestion[];
    onAddToCart: (product: ProductSuggestion) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, products]);

    // Auto-scroll every 3 seconds
    useEffect(() => {
        if (isPaused || products.length <= 2) return;

        const interval = setInterval(() => {
            const el = scrollRef.current;
            if (!el) return;

            const cardWidth = 216;
            const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;

            if (atEnd) {
                // Loop back to start
                el.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                el.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused, products.length]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 216;
        el.scrollBy({
            left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
            behavior: "smooth",
        });
    };

    if (products.length === 0) return null;

    return (
        <div className="mt-10">
            {/* Header with arrows */}
            <div className="flex items-end justify-between mb-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className={`p-2 rounded-full border transition-all ${
                            canScrollLeft
                                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                                : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-full border transition-all ${
                            canScrollRight
                                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                                : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scrollable card row */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product) => (
                        <ProductSuggestionCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* =================================================================
   COMPONENT: CartItemCard
================================================================= */

function CartItemCard({
    item,
    onUpdateQuantity,
    onRemove,
}: {
    item: CartItem;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
}) {
    const lineTotal = item.price * item.quantity;

    // Determine color and size display based on item type
    const displayColor = item.prebuiltColour ?? item.color ?? null;
    const displaySize = item.prebuiltSize ?? item.size ?? null;

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-4 sm:p-5">
                <div className="flex gap-4">
                    {/* Product image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image
                            src={item.images?.[0] ?? "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 pr-2">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                                    {item.name}
                                </h3>

                                {/* Variant badges */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {displayColor && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full border border-gray-200"
                                                style={{
                                                    backgroundColor:
                                                        displayColor
                                                            .toLowerCase()
                                                            .replace(/\s/g, ""),
                                                }}
                                            />
                                            {displayColor}
                                        </span>
                                    )}
                                    {item.weight &&
                                        item.itemType !== "printer" && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                                                {item.weight}
                                            </span>
                                        )}
                                    {displaySize && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                                            Size: {displaySize}
                                        </span>
                                    )}
                                    {item.customization && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-xs text-blue-600 font-medium">
                                            Customization Available
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Delete button */}
                            <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quantity + Price row */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onUpdateQuantity(
                                            item.id,
                                            item.quantity - 1,
                                        )
                                    }
                                    disabled={item.quantity <= 1}
                                    className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onUpdateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                        )
                                    }
                                    className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="text-right">
                                <p className="text-base sm:text-lg font-bold text-gray-900">
                                    ₹{lineTotal.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* =================================================================
   MAIN COMPONENT: ShoppingCart
================================================================= */

export default function ShoppingCart() {
    const router = useRouter();
    const {
        cart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        addToCart,
        discountAmount: contextDiscountAmount,
        appliedDiscountCode,
        applyDiscountCode,
        clearDiscount,
    } = useCart();
    const { setPricing } = useCheckout();

    const [localCart, setLocalCart] = useState<CartItem[]>([]);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(
        [],
    );
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [emptySuggestions, setEmptySuggestions] = useState<
        ProductSuggestion[]
    >([]);
    const [mobileExpanded, setMobileExpanded] = useState(false);

    // --- Fetch cart
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        setLocalCart(cart ?? []);
    }, [cart]);

    // --- Fetch available coupons
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/discounts");
                if (res.ok) {
                    const data: Discount[] = await res.json();
                    const mapped: AvailableCoupon[] = data
                        .filter((d) => d.isActive && !d.isHidden)
                        .map((d) => ({
                            code: d.code,
                            name: d.name,
                            valueLabel: buildValueLabel(d),
                            description: buildDescription(d),
                            expiresOn: formatExpiryDate(d.expiresAt),
                            discount: d,
                        }));
                    setAvailableCoupons(mapped);
                }
            } catch {
                // silently fail
            }
        })();
    }, []);

    // --- Fetch product suggestions ("You Might Also Need")
    useEffect(() => {
        if (localCart.length === 0) return;
        const filters = getRecommendationFilters(localCart);

        (async () => {
            try {
                const params = new URLSearchParams();
                filters.itemTypes.forEach((t) => params.append("itemType", t));
                if (filters.technologies) {
                    filters.technologies.forEach((t) =>
                        params.append("technology", t),
                    );
                }
                filters.excludeIds.forEach((id) =>
                    params.append("exclude", id),
                );
                params.set("limit", "6");

                const res = await fetch(
                    `/api/recommendations?${params.toString()}`,
                );
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                }
            } catch {
                // silently fail
            }
        })();
    }, [localCart]);

    // --- Fetch suggestions for empty cart (wishlist / popular products)
    useEffect(() => {
        if (localCart.length > 0) return;

        (async () => {
            try {
                const wishlistRes = await fetch("/api/wishlist");
                if (wishlistRes.ok) {
                    const wishlistData = await wishlistRes.json();
                    if (wishlistData.length > 0) {
                        setEmptySuggestions(wishlistData);
                        return;
                    }
                }

                const res = await fetch("/api/recommendations?limit=6");
                if (res.ok) {
                    const data = await res.json();
                    setEmptySuggestions(data);
                }
            } catch {
                // silently fail
            }
        })();
    }, [localCart.length]);

    /* =========================
       PRICE CALCULATIONS

       Prices from DB are INCLUSIVE of 18% GST.
       - Subtotal = sum of (price × qty) — already includes tax
       - GST display = back-calculated from subtotal for transparency
       - Coupon discount is applied after subtotal
       - Grand Total = Subtotal - Coupon Discount (tax already included)
    ========================= */

    const subtotal = localCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const couponDiscount = contextDiscountAmount;

    // GST is already included in prices — extract it for display only
    // Price = Base + 18% GST → Base = Price / 1.18 → GST = Price - Base
    const afterDiscount = subtotal - couponDiscount;
    const gstAmount = Math.round(afterDiscount - afterDiscount / 1.18);

    const grandTotal = afterDiscount;

    /* =========================
       ACTIONS
    ========================= */

    const handleApplyCoupon = async (coupon: AvailableCoupon | null) => {
        if (coupon) {
            try {
                await applyDiscountCode(coupon.code);
                toast({
                    title: "Coupon Applied",
                    description: `Code "${coupon.code}" applied successfully`,
                });
            } catch (err) {
                clearDiscount();
                toast({
                    title: "Coupon not applicable",
                    description:
                        err instanceof Error
                            ? err.message
                            : "This coupon cannot be applied to your cart",
                    variant: "destructive",
                });
            }
        } else {
            clearDiscount();
        }
    };

    const handleCheckCode = async (
        code: string,
    ): Promise<{
        valid: boolean;
        message: string;
        coupon?: AvailableCoupon;
    }> => {
        try {
            const res = await fetch(
                `/api/discounts/apply?code=${encodeURIComponent(code)}`,
            );
            if (!res.ok) {
                return {
                    valid: false,
                    message: "This coupon is not applicable to your order",
                };
            }

            const discount: Discount = await res.json();

            // For scoped discounts, only check against matching item types
            let applicableSubtotal: number;
            if (
                discount.scope === "item_type" &&
                discount.itemTypes?.length > 0
            ) {
                const allowedTypes = discount.itemTypes.map(
                    (t: { itemType: string }) => t.itemType,
                );
                applicableSubtotal = localCart
                    .filter((item) => allowedTypes.includes(item.itemType))
                    .reduce((sum, item) => sum + item.price * item.quantity, 0);
            } else {
                applicableSubtotal = localCart.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                );
            }

            const testAmount = calculateDiscount(discount, applicableSubtotal);
            if (testAmount === 0) {
                return {
                    valid: false,
                    message: "This coupon is not applicable to your order",
                };
            }

            const coupon: AvailableCoupon = {
                code: discount.code,
                name: discount.name,
                valueLabel: buildValueLabel(discount),
                description: buildDescription(discount),
                expiresOn: formatExpiryDate(discount.expiresAt),
                discount,
            };

            // Hidden coupons show as "secret" when entered manually
            const isSecret =
                discount.isHidden ||
                !availableCoupons.some((c) => c.code === discount.code);

            return {
                valid: true,
                message: isSecret
                    ? "Secret coupon applied successfully!"
                    : "Valid coupon code!",
                coupon,
            };
        } catch {
            return {
                valid: false,
                message: "This coupon is not applicable to your order",
            };
        }
    };

    const handleCheckout = () => {
        setPricing({
            subtotal,
            discountAmount: couponDiscount,
            appliedDiscountCode,
            tax: gstAmount,
        });

        router.push("/checkout");
    };

    const handleUpdateQuantity = useCallback(
        async (id: string, quantity: number) => {
            if (quantity < 1) return;
            setLocalCart((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
            );
            await updateQuantity(id, quantity);
        },
        [updateQuantity],
    );

    const handleRemoveFromCart = async (id: string) => {
        setLocalCart((prev) => prev.filter((i) => i.id !== id));
        await removeFromCart(id);
    };

    const handleAddSuggestion = async (product: ProductSuggestion) => {
        try {
            const payload: Record<string, string | number> = { quantity: 1 };
            switch (product.itemType?.toLowerCase()) {
                case "printer":
                    payload.printerId = product.id;
                    break;
                case "prebuilt":
                    payload.prebuiltProductId = product.id;
                    break;
                case "resin":
                    payload.resinId = product.id;
                    break;
                default:
                    payload.productId = product.id;
                    break;
            }

            await addToCart(
                payload as unknown as Parameters<typeof addToCart>[0],
            );
            toast({ title: `${product.name} added to cart` });
        } catch {
            toast({
                title: "Failed to add item",
                variant: "destructive",
            });
        }
    };

    /* =========================
       EMPTY STATE
    ========================= */

    if (localCart.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                    Shopping Cart
                </h1>

                <Card className="rounded-2xl border border-gray-100 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                            <ShoppingCartIcon className="w-7 h-7 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Your cart is empty
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Explore our catalog to add products.
                        </p>
                        <Link href="/">
                            <Button className="h-12 px-8 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 text-sm">
                                Browse Products
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {emptySuggestions.length > 0 && (
                    <ProductCarousel
                        title="Here are some products you might need"
                        subtitle="Add these to your cart to get started"
                        products={emptySuggestions}
                        onAddToCart={handleAddSuggestion}
                    />
                )}
            </div>
        );
    }

    /* =========================
       FILLED CART
    ========================= */

    return (
        <>
            <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 pb-32 lg:pb-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/">
                        <button
                            type="button"
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Shopping Cart
                    </h1>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* --- Cart Items Column --- */}
                    <div className="lg:col-span-8 space-y-3">
                        {localCart.map((item) => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveFromCart}
                            />
                        ))}

                        {/* Desktop: Carousel inside left column */}
                        {suggestions.length > 0 && (
                            <div className="hidden lg:block">
                                <ProductCarousel
                                    title="You might also need"
                                    subtitle="Frequently bought together with your cart items"
                                    products={suggestions}
                                    onAddToCart={handleAddSuggestion}
                                />
                            </div>
                        )}
                    </div>

                    {/* --- Order Summary (Desktop) --- */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <Card className="sticky top-4 rounded-2xl border border-gray-100 shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold">
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Coupons section */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Ticket className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-900">
                                            Coupons
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Apply coupons to save more on this order
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full h-10 rounded-xl border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50"
                                        onClick={() => setShowCouponModal(true)}
                                    >
                                        {appliedDiscountCode
                                            ? `${appliedDiscountCode} Applied`
                                            : "Apply Coupons"}
                                    </Button>
                                </div>

                                <Separator />

                                {/* Price breakdown */}
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            ₹{subtotal.toLocaleString("en-IN")}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Coupon Discount
                                        </span>
                                        {couponDiscount > 0 ? (
                                            <span className="font-medium text-green-600">
                                                -₹
                                                {couponDiscount.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="text-blue-600 font-medium hover:underline"
                                                onClick={() =>
                                                    setShowCouponModal(true)
                                                }
                                            >
                                                Apply Coupon
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tax (GST)
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            ₹{gstAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Shipping
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            FREE
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Grand Total */}
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-bold text-gray-900">
                                        Grand Total
                                    </span>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹
                                            {grandTotal.toLocaleString("en-IN")}
                                        </span>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                            Inclusive of all taxes
                                        </p>
                                    </div>
                                </div>

                                {/* Checkout button */}
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full h-14 rounded-2xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Proceed to Checkout
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </Button>

                                <Link
                                    href="/"
                                    className="block text-center text-sm font-semibold text-gray-900 hover:underline"
                                >
                                    Continue Shopping
                                </Link>

                                {/* Payment trust badge */}
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                                            VISA
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                                            UPI
                                        </span>
                                        <span>
                                            Secure encrypted checkout powered by
                                            PhonePe
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- Mobile: Carousel (full width, outside grid) --- */}
                {suggestions.length > 0 && (
                    <div className="lg:hidden">
                        <ProductCarousel
                            title="You might also need"
                            subtitle="Frequently bought together with your cart items"
                            products={suggestions}
                            onAddToCart={handleAddSuggestion}
                        />
                    </div>
                )}

                {/* --- Mobile: Order Summary (after recommendations) --- */}
                <div className="lg:hidden mt-6">
                    <Card className="rounded-2xl border border-gray-100 shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold">
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Ticket className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-gray-900">
                                        Coupons
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-10 rounded-xl border-blue-200 text-blue-600 font-semibold text-sm hover:bg-blue-50 mt-2"
                                    onClick={() => setShowCouponModal(true)}
                                >
                                    {appliedDiscountCode
                                        ? `${appliedDiscountCode} Applied`
                                        : "Apply Coupons"}
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal
                                    </span>
                                    <span className="font-medium">
                                        ₹{subtotal.toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Coupon Discount
                                    </span>
                                    {couponDiscount > 0 ? (
                                        <span className="font-medium text-green-600">
                                            -₹
                                            {couponDiscount.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="text-blue-600 font-medium hover:underline"
                                            onClick={() =>
                                                setShowCouponModal(true)
                                            }
                                        >
                                            Apply Coupon
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Tax (GST)
                                    </span>
                                    <span className="font-medium">
                                        ₹{gstAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Shipping
                                    </span>
                                    <span className="font-medium">FREE</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-baseline">
                                <span className="text-lg font-bold text-gray-900">
                                    Grand Total
                                </span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{grandTotal.toLocaleString("en-IN")}
                                    </span>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                        Inclusive of all taxes
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full h-14 rounded-2xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800"
                            >
                                Proceed to Checkout
                                <ChevronRight className="w-5 h-5 ml-1" />
                            </Button>

                            <Link
                                href="/"
                                className="block text-center text-sm font-semibold text-gray-900 hover:underline"
                            >
                                Continue Shopping
                            </Link>

                            <div className="flex items-center justify-center gap-2 pt-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                                        VISA
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                                        UPI
                                    </span>
                                    <span>
                                        Secure encrypted checkout powered by
                                        PhonePe
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- Mobile Sticky Bottom Bar --- */}
            <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
                {mobileExpanded && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-2 text-sm animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                        </div>
                        {couponDiscount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Coupon Discount
                                </span>
                                <span className="text-green-600 font-medium">
                                    -₹{couponDiscount.toLocaleString("en-IN")}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax (GST)</span>
                            <span className="font-medium">
                                ₹{gstAmount.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">FREE</span>
                        </div>
                    </div>
                )}

                <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                        <button
                            type="button"
                            onClick={() => setMobileExpanded(!mobileExpanded)}
                            className="flex items-center gap-1"
                        >
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                Grand Total
                            </p>
                            <ChevronUp
                                className={`w-3 h-3 text-gray-400 transition-transform ${
                                    mobileExpanded ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        <p className="text-xl font-bold text-gray-900">
                            ₹{grandTotal.toLocaleString("en-IN")}
                        </p>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        className="h-12 px-8 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                    >
                        Checkout
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Coupon Modal */}
            <CouponModal
                isOpen={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                coupons={availableCoupons}
                appliedCode={appliedDiscountCode}
                cartItems={localCart}
                onApplyCoupon={handleApplyCoupon}
                onCheckCode={handleCheckCode}
            />
        </>
    );
}
