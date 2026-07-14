"use client";

import { calculateDiscount } from "@/app/cart/utils/calculateDiscount";
import type { Discount } from "@/app/ops/control/discounts/types";
import WishlistModal from "@/app/profile/_components/wishlist-modal";
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
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Loader2,
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
   SAFE NUMBER HELPERS
================================================================= */

/** Safely coerce any value to a finite number, defaulting to 0 */
function safeNum(val: unknown): number {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

/** Format a number for Indian locale — never returns "NaN" */
function formatINR(val: unknown): string {
    return safeNum(val).toLocaleString("en-IN");
}

/** Safe line total for a cart item */
function safeLineTotal(item: { price?: unknown; quantity?: unknown }): number {
    return safeNum(item.price) * safeNum(item.quantity);
}

/** Safe subtotal for an array of cart items, optionally filtered */
function safeSubtotal(
    items: CartItem[],
    filterFn?: (item: CartItem) => boolean,
): number {
    const list = filterFn ? items.filter(filterFn) : items;
    return list.reduce((sum, item) => sum + safeLineTotal(item), 0);
}

/** Build the PDP URL for a given item type + slug/id */
function getPDPUrl(
    itemType: string | undefined,
    slug?: string | null,
    id?: string,
): string | null {
    const identifier = slug || id;
    if (!identifier || !itemType) return null;
    const type = itemType.toLowerCase();
    switch (type) {
        case "printer":
            return slug ? `/printers/${slug}` : null;
        case "product":
            return `/products/${identifier}`;
        case "resin":
            return `/resins/${identifier}`;
        case "prebuilt":
            return `/prebuilt-products/${identifier}`;
        default:
            return null;
    }
}

/* =================================================================
   TYPES
================================================================= */

interface ProductSuggestion {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    mrp?: number;
    category?: string;
    itemType?: string;
    technology?: string;
    buildVolume?: string;
}

interface AvailableCoupon {
    code: string;
    name: string;
    valueLabel: string;
    description: string;
    expiresOn: string | null;
    discount: Discount;
}

/* =================================================================
   HELPERS
================================================================= */

function buildValueLabel(d: Discount): string {
    if (d.valueType === "flat")
        return `Save ₹${safeNum(d.value).toLocaleString("en-IN")}`;
    return `${safeNum(d.value)}% OFF`;
}

function buildDescription(d: Discount): string {
    const parts: string[] = [];
    if (d.valueType === "flat") {
        parts.push(`Flat ₹${safeNum(d.value).toLocaleString("en-IN")} off`);
    } else {
        parts.push(`Get ${safeNum(d.value)}% off`);
    }
    if (d.scope === "item_type" && d.itemTypes?.length > 0) {
        const types = d.itemTypes.map(
            (t: { itemType: string }) => t.itemType + "s",
        );
        parts[0] += ` on all ${types.join(" & ")}`;
    } else {
        parts[0] += " on your order";
    }
    if (d.maxDiscount)
        parts.push(
            `Max discount ₹${safeNum(d.maxDiscount).toLocaleString("en-IN")}`,
        );
    if (d.minOrderValue)
        parts.push(
            `Min. order ₹${safeNum(d.minOrderValue).toLocaleString("en-IN")}`,
        );
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

function getRecommendationParams(cartItems: CartItem[]): {
    groups: Array<{
        itemType: string;
        limit: number;
        technology?: string;
        category?: string;
        sameCategoryAsIds?: string[];
    }>;
    excludeIds: string[];
} {
    const itemTypes = new Set<string>();
    const excludeIds = cartItems.map((i) => i.sourceId ?? i.id).filter(Boolean);
    for (const item of cartItems) {
        if (item.itemType) itemTypes.add(item.itemType.toLowerCase());
    }
    const groups: Array<{
        itemType: string;
        limit: number;
        technology?: string;
        category?: string;
        sameCategoryAsIds?: string[];
    }> = [];
    if (itemTypes.has("prebuilt")) {
        // Pass prebuilt IDs so the API can look up their categories
        const prebuiltSourceIds = cartItems
            .filter((i) => i.itemType?.toLowerCase() === "prebuilt")
            .map((i) => i.sourceId ?? i.id)
            .filter(Boolean);
        groups.push({
            itemType: "prebuilt",
            limit: 5,
            sameCategoryAsIds: prebuiltSourceIds,
        });
        groups.push({ itemType: "product", limit: 2, category: "PLA" });
        groups.push({ itemType: "printer", limit: 2 });
        groups.push({ itemType: "resin", limit: 2 });
    }
    if (itemTypes.has("product")) {
        groups.push({ itemType: "printer", limit: 3, technology: "FDM / FFF" });
        groups.push({ itemType: "product", limit: 3 });
    }
    if (itemTypes.has("resin")) {
        groups.push({ itemType: "printer", limit: 3, technology: "SLA / DLP" });
        groups.push({ itemType: "resin", limit: 3 });
    }
    if (itemTypes.has("printer")) {
        groups.push({ itemType: "printer", limit: 2, technology: "SAME" });
        groups.push({ itemType: "product", limit: 2 });
        groups.push({ itemType: "resin", limit: 2 });
    }
    if (groups.length === 0) {
        groups.push({ itemType: "product", limit: 2 });
        groups.push({ itemType: "printer", limit: 2 });
        groups.push({ itemType: "resin", limit: 1 });
        groups.push({ itemType: "prebuilt", limit: 1 });
    }
    return { groups, excludeIds };
}

/* =================================================================
   COMPONENT: DiscountAmountDisplay
================================================================= */

function DiscountAmountDisplay({
    isRecalculating,
    children,
}: {
    isRecalculating: boolean;
    children: React.ReactNode;
}) {
    if (isRecalculating) {
        return (
            <span className="inline-flex items-center gap-1.5 text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs font-medium">Updating…</span>
            </span>
        );
    }
    return <>{children}</>;
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
   COMPONENT: CouponModal
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
    onCheckCode: (
        code: string,
    ) => Promise<{ valid: boolean; message: string; coupon?: AvailableCoupon }>;
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
        const selected =
            coupons.find((c) => c.code === selectedCode) ??
            (manualCoupon?.code === selectedCode ? manualCoupon : null);
        onApplyCoupon(selected);
        onClose();
    };

    const hasSelection = selectedCode !== null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50 transition-opacity"
                onClick={onClose}
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div
                    className="pointer-events-auto bg-white w-full sm:w-[480px] sm:max-h-[85vh] max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-gray-300" />
                    </div>
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
                                className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${codeStatus.type === "success" ? "text-green-600" : "text-red-500"}`}
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
                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
                        {(() => {
                            const applicableCoupons = coupons.filter(
                                (coupon) => {
                                    const d = coupon.discount;
                                    if (
                                        d.scope === "item_type" &&
                                        d.itemTypes?.length > 0
                                    ) {
                                        const allowedTypes = d.itemTypes.map(
                                            (t: { itemType: string }) =>
                                                t.itemType,
                                        );
                                        const scopedSubtotal = safeSubtotal(
                                            cartItems,
                                            (item) =>
                                                allowedTypes.includes(
                                                    item.itemType,
                                                ),
                                        );
                                        if (scopedSubtotal === 0) return false;
                                    }
                                    if (d.minOrderValue) {
                                        const cartTotal =
                                            safeSubtotal(cartItems);
                                        if (cartTotal < d.minOrderValue)
                                            return false;
                                    }
                                    return true;
                                },
                            );
                            if (applicableCoupons.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-10 px-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                            <Ticket className="w-7 h-7 text-gray-300" />
                                        </div>
                                        <p className="text-[15px] font-semibold text-gray-900 text-center">
                                            No coupons available right now
                                        </p>
                                        <p className="text-sm text-gray-400 text-center mt-1.5 max-w-[280px] leading-relaxed">
                                            Try entering a coupon code above, or
                                            check back later for new offers.
                                        </p>
                                    </div>
                                );
                            }
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
                                                onSelect={() =>
                                                    setSelectedCode(
                                                        selectedCode ===
                                                            coupon.code
                                                            ? null
                                                            : coupon.code,
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100">
                        <Button
                            onClick={handleApply}
                            disabled={!hasSelection}
                            className={`w-full h-14 rounded-2xl text-base font-semibold transition-all ${hasSelection ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
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
    buttonState,
}: {
    product: ProductSuggestion;
    onAddToCart: (product: ProductSuggestion) => void;
    buttonState: "idle" | "loading" | "success";
}) {
    const price = safeNum(product.price);
    const mrp = safeNum(product.mrp);
    const hasDiscount = mrp > 0 && mrp > price;
    const isResinOrPrebuilt =
        product.itemType?.toLowerCase() === "resin" ||
        product.itemType?.toLowerCase() === "prebuilt";
    const pdpUrl = getPDPUrl(product.itemType, product.slug, product.id);

    const imageAndInfo = (
        <>
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
            <div className="p-3 pb-0">
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
                        ₹{formatINR(price)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                            ₹{formatINR(mrp)}
                        </span>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div className="flex-shrink-0 w-[180px] sm:w-[200px] bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-200 snap-start">
            {pdpUrl ? (
                <Link href={pdpUrl} className="block cursor-pointer">
                    {imageAndInfo}
                </Link>
            ) : (
                imageAndInfo
            )}
            <div className="p-3 pt-0">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    disabled={buttonState !== "idle"}
                    className={`w-full mt-3 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        buttonState === "success"
                            ? "bg-green-600 text-white hover:bg-green-600"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                    } disabled:opacity-80`}
                >
                    {buttonState === "loading" ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            <span className="sm:hidden">
                                {isResinOrPrebuilt ? "Loading…" : "Adding…"}
                            </span>
                            <span className="hidden sm:inline">
                                {isResinOrPrebuilt
                                    ? "Loading Options…"
                                    : "Adding…"}
                            </span>
                        </>
                    ) : buttonState === "success" ? (
                        <>
                            <Check className="w-4 h-4 mr-1" />
                            Added!
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-1" />
                            {isResinOrPrebuilt ? (
                                "Add to Cart"
                            ) : (
                                <>
                                    <span className="sm:hidden">Add</span>
                                    <span className="hidden sm:inline">
                                        Add to Cart
                                    </span>
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

/* =================================================================
   COMPONENT: ProductCarousel
================================================================= */

function ProductCarousel({
    title,
    subtitle,
    products,
    onAddToCart,
    buttonStates,
}: {
    title: string;
    subtitle: string;
    products: ProductSuggestion[];
    onAddToCart: (product: ProductSuggestion) => void;
    buttonStates: Record<string, "idle" | "loading" | "success">;
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

    useEffect(() => {
        if (isPaused || products.length <= 2) return;
        const interval = setInterval(() => {
            const el = scrollRef.current;
            if (!el) return;
            const cardWidth = 216;
            const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
            if (atEnd) {
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
        el.scrollBy({
            left: direction === "left" ? -432 : 432,
            behavior: "smooth",
        });
    };

    if (products.length === 0) return null;

    return (
        <div className="mt-10">
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
                        className={`p-2 rounded-full border transition-all ${canScrollLeft ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-gray-100 text-gray-300 cursor-not-allowed"}`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className={`p-2 rounded-full border transition-all ${canScrollRight ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-gray-100 text-gray-300 cursor-not-allowed"}`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
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
                            buttonState={buttonStates[product.id] ?? "idle"}
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
    const lineTotal = safeLineTotal(item);
    const pdpUrl = getPDPUrl(item.itemType, item.slug, item.sourceId);

    const displayColor = item.color ?? null;
    const displayColorHex = item.colorHex ?? null;

    const rawSize = item.size ?? null;
    const displaySize = (() => {
        if (!rawSize) return null;
        const gramMatch = rawSize.match(/^(\d+)\s*g$/i);
        if (gramMatch) {
            const grams = parseInt(gramMatch[1]);
            const kg = grams / 1000;
            return `${kg} kg`;
        }
        return rawSize;
    })();

    return (
        <Card className="rounded-2xl border border-gray-100 shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-4 sm:p-5">
                <div className="flex gap-4">
                    {/* Clickable image */}
                    {pdpUrl ? (
                        <Link
                            href={pdpUrl}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                            <Image
                                src={item.images?.[0] ?? "/placeholder.png"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </Link>
                    ) : (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                            <Image
                                src={item.images?.[0] ?? "/placeholder.png"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 pr-2">
                                {/* Clickable name */}
                                {pdpUrl ? (
                                    <Link
                                        href={pdpUrl}
                                        className="font-semibold text-gray-900 text-sm sm:text-base leading-snug hover:text-blue-600 transition-colors line-clamp-2"
                                    >
                                        {item.name}
                                    </Link>
                                ) : (
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                                        {item.name}
                                    </h3>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {/* Out of Stock Badge */}
                                    {item.inStock === false && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-100 text-xs text-red-600 font-semibold">
                                            Out of Stock
                                        </span>
                                    )}
                                    {displayColor && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full border border-gray-200"
                                                style={{
                                                    backgroundColor:
                                                        displayColorHex ??
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
                            <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
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
                                    disabled={item.quantity <= 1 || item.inStock === false}
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
                                    disabled={item.inStock === false}
                                    className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-base sm:text-lg font-bold text-gray-900">
                                    ₹{formatINR(lineTotal)}
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
        isRecalculatingDiscount,
    } = useCart();
    const { setPricing } = useCheckout();

    const [localCart, setLocalCart] = useState<CartItem[]>([]);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(
        [],
    );
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [emptySuggestions, setEmptySuggestions] = useState<
        ProductSuggestion[]
    >([]);
    const [mobileExpanded, setMobileExpanded] = useState(false);
    const [activeModalItem, setActiveModalItem] = useState<any>(null);

    /* Per-product button states for suggestion cards */
    const [suggestionButtonStates, setSuggestionButtonStates] = useState<
        Record<string, "idle" | "loading" | "success">
    >({});

    const setButtonState = useCallback(
        (productId: string, state: "idle" | "loading" | "success") => {
            setSuggestionButtonStates((prev) => ({
                ...prev,
                [productId]: state,
            }));
        },
        [],
    );

    const cartKey = localCart
        .map((i) => i.id)
        .sort()
        .join(",");

    const hasFetched = useRef(false);
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchCart().then(() => {
            setTimeout(() => setInitialLoadDone(true), 50);
        });
    }, [fetchCart]);

    /* Sanitise cart items when syncing from provider */
    useEffect(() => {
        setLocalCart(
            (cart ?? []).map((item) => ({
                ...item,
                price: safeNum(item.price),
                quantity: Math.max(1, Math.round(safeNum(item.quantity))),
            })),
        );
    }, [cart]);

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
                /* silently fail */
            }
        })();
    }, []);

    useEffect(() => {
        if (!initialLoadDone) return;
        const controller = new AbortController();
        if (localCart.length === 0) {
            (async () => {
                try {
                    const wishlistRes = await fetch("/api/wishlist", {
                        signal: controller.signal,
                    });
                    if (wishlistRes.ok) {
                        const wishlistData = await wishlistRes.json();
                        if (wishlistData.length > 0) {
                            setEmptySuggestions(wishlistData);
                            setSuggestionsLoaded(true);
                            return;
                        }
                    }
                    const res = await fetch("/api/recommendations?limit=6", {
                        signal: controller.signal,
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setEmptySuggestions(data);
                    }
                } catch (e: any) {
                    if (e?.name === "AbortError") return;
                } finally {
                    if (!controller.signal.aborted) setSuggestionsLoaded(true);
                }
            })();
        } else {
            const { groups, excludeIds } = getRecommendationParams(localCart);
            (async () => {
                try {
                    const res = await fetch("/api/recommendations", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ groups, excludeIds }),
                        signal: controller.signal,
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSuggestions(data);
                    }
                } catch (e: any) {
                    if (e?.name === "AbortError") return;
                } finally {
                    if (!controller.signal.aborted) setSuggestionsLoaded(true);
                }
            })();
        }
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLoadDone, cartKey]);

    const isLoading = !initialLoadDone || !suggestionsLoaded;

    /* ── Safe price calculations ── */
    const subtotal = safeSubtotal(localCart);
    const couponDiscount = safeNum(contextDiscountAmount);
    const afterDiscount = Math.max(0, subtotal - couponDiscount);
    const gstAmount = Math.round(afterDiscount - afterDiscount / 1.18);
    const grandTotal = afterDiscount;

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
            if (!res.ok)
                return {
                    valid: false,
                    message: "This coupon is not applicable to your order",
                };
            const discount: Discount = await res.json();

            let applicableSubtotal: number;
            if (
                discount.scope === "item_type" &&
                discount.itemTypes?.length > 0
            ) {
                const allowedTypes = discount.itemTypes.map(
                    (t: { itemType: string }) => t.itemType,
                );
                applicableSubtotal = safeSubtotal(localCart, (item) =>
                    allowedTypes.includes(item.itemType),
                );
            } else {
                applicableSubtotal = safeSubtotal(localCart);
            }

            const testAmount = safeNum(
                calculateDiscount(discount, applicableSubtotal),
            );
            if (testAmount === 0)
                return {
                    valid: false,
                    message: "This coupon is not applicable to your order",
                };
            const coupon: AvailableCoupon = {
                code: discount.code,
                name: discount.name,
                valueLabel: buildValueLabel(discount),
                description: buildDescription(discount),
                expiresOn: formatExpiryDate(discount.expiresAt),
                discount,
            };
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

    const handleCheckout = async () => {
        setPricing({
            subtotal,
            discountAmount: couponDiscount,
            appliedDiscountCode,
            tax: gstAmount,
        });
        
        // Set checkout access cookie to allow navigation
        try {
            await fetch("/api/checkout/set-access", { method: "POST" });
        } catch (error) {
            console.error("Failed to set checkout access:", error);
        }
        
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
        const type = product.itemType?.toLowerCase();
        const pid = product.id;

        /* ── FIX 1: Always clear any stale modal before doing anything ── */
        setActiveModalItem(null);

        if (type === "resin" || type === "prebuilt") {
            setButtonState(pid, "loading");
            try {
                if (type === "resin") {
                    let slug = product.slug;
                    if (!slug) {
                        try {
                            const lookupRes = await fetch(`/api/resins`);
                            if (lookupRes.ok) {
                                const resinsResponse = await lookupRes.json();
                                const resinsList =
                                    resinsResponse.resins ?? resinsResponse;
                                const found = Array.isArray(resinsList)
                                    ? resinsList.find(
                                          (r: any) => r.id === product.id,
                                      )
                                    : null;
                                slug = found?.slug;
                            }
                        } catch {
                            /* ignore */
                        }
                    }
                    if (!slug) {
                        toast({
                            title: "Unable to load options",
                            description:
                                "Please add this resin from the Resins page",
                            variant: "destructive",
                        });
                        setButtonState(pid, "idle");
                        return;
                    }
                    const res = await fetch(`/api/resins/${slug}`);
                    if (!res.ok) throw new Error("Resin not found");
                    const resinData: any = await res.json();
                    setActiveModalItem({
                        id: resinData.id,
                        itemType: "resin",
                        title: resinData.name,
                        image: resinData.cardImageUrl ?? product.images[0],
                        badge: resinData.technology,
                        price:
                            safeNum(resinData.weights?.[0]?.price) ||
                            safeNum(product.price),
                        originalPrice:
                            resinData.weights?.[0]?.originalPrice ?? null,
                        requiresOptions: true,
                        slug: resinData.slug,
                        cartPayload: { resinId: resinData.id },
                        resinColours:
                            resinData.colours?.map((c: any) => ({
                                id: c.id,
                                name: c.name,
                                hex: c.hexCode ?? null,
                                image:
                                    c.images?.find((i: any) => i.isMain)?.url ??
                                    null,
                            })) ?? [],
                        resinWeights:
                            resinData.weights?.map((w: any) => ({
                                id: w.id,
                                label: `${w.weightInGrams} g`,
                                price: safeNum(w.price),
                                originalPrice: w.originalPrice,
                            })) ?? [],
                    });
                } else {
                    const endpoint = product.slug
                        ? `/api/prebuilt-products/${product.slug}`
                        : `/api/prebuilt-products/id/${product.id}`;

                    const res = await fetch(endpoint);
                    if (!res.ok) throw new Error("Product not found");
                    const prebuiltData: any = await res.json();

                    const variants = prebuiltData.variants ?? [];
                    const cheapest = variants.reduce(
                        (min: any, v: any) =>
                            !min || safeNum(v.price) < safeNum(min.price)
                                ? v
                                : min,
                        null,
                    );

                    setActiveModalItem({
                        id: prebuiltData.id,
                        itemType: "prebuilt",
                        title: prebuiltData.name,
                        image:
                            prebuiltData.images?.find((i: any) => i.isMain)
                                ?.url ??
                            prebuiltData.images?.[0]?.url ??
                            product.images[0],
                        badge: prebuiltData.category,
                        price:
                            safeNum(cheapest?.price) || safeNum(product.price),
                        originalPrice: cheapest?.originalPrice ?? null,
                        requiresOptions: variants.length > 0,
                        slug: prebuiltData.slug ?? null,
                        cartPayload: { prebuiltProductId: prebuiltData.id },
                        availableVariants: variants.map((v: any) => ({
                            id: v.id,
                            colorName: v.colorName ?? null,
                            colorHex: v.colorHex ?? null,
                            sizeName: v.sizeName ?? null,
                            price: safeNum(v.price),
                            originalPrice: safeNum(v.originalPrice),
                            isActive: v.isActive,
                        })),
                    });
                }
                /* Reset button once modal is ready to show */
                setButtonState(pid, "idle");
            } catch {
                toast({
                    title: "Failed to load options",
                    variant: "destructive",
                });
                setButtonState(pid, "idle");
            }
            return;
        }

        // Printer & Product — direct add
        setButtonState(pid, "loading");
        try {
            const payload: Record<string, string | number> = { quantity: 1 };
            if (type === "printer") {
                payload.printerId = product.id;
            } else {
                payload.productId = product.id;
            }
            await addToCart(
                payload as unknown as Parameters<typeof addToCart>[0],
            );
            setButtonState(pid, "success");
            toast({ title: `${product.name} added to cart` });
            setTimeout(() => setButtonState(pid, "idle"), 1500);
        } catch {
            toast({ title: "Failed to add item", variant: "destructive" });
            setButtonState(pid, "idle");
        }
    };

    /* =========================
       RENDER
    ========================= */

    /* Loading skeleton */
    if (isLoading) {
        return (
            <>
                <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
                    <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
                    <div className="grid lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-gray-100 p-4 sm:p-5"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 pr-2">
                                                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                                    <div className="flex gap-1.5 mt-2">
                                                        <div className="h-5 w-16 bg-gray-100 rounded-md animate-pulse" />
                                                        <div className="h-5 w-12 bg-gray-100 rounded-md animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="h-9 w-28 bg-gray-100 rounded-xl animate-pulse" />
                                                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-4 hidden lg:block">
                            <div className="rounded-2xl border border-gray-100 p-6 space-y-4">
                                <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse mt-2" />
                                </div>
                                <div className="h-px bg-gray-100" />
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between"
                                    >
                                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                ))}
                                <div className="h-14 w-full bg-gray-200 rounded-2xl animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal always available, even during loading */}
                {activeModalItem && (
                    <WishlistModal
                        item={activeModalItem}
                        onClose={() => {
                            const pid = activeModalItem.id;
                            setActiveModalItem(null);
                            setButtonState(pid, "idle");
                        }}
                    />
                )}
            </>
        );
    }

    /* Empty cart */
    if (localCart.length === 0) {
        return (
            <>
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
                            buttonStates={suggestionButtonStates}
                        />
                    )}
                </div>

                {/* Modal always available, even for empty cart suggestions */}
                {activeModalItem && (
                    <WishlistModal
                        item={activeModalItem}
                        onClose={() => {
                            const pid = activeModalItem.id;
                            setActiveModalItem(null);
                            setButtonState(pid, "idle");
                        }}
                    />
                )}
            </>
        );
    }

    /* Filled cart */
    return (
        <>
            <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 pb-32 lg:pb-10">
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
                    <div className="lg:col-span-8 space-y-3">
                        {localCart.map((item) => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveFromCart}
                            />
                        ))}
                        {suggestions.length > 0 && (
                            <div className="hidden lg:block">
                                <ProductCarousel
                                    title="You might also need"
                                    subtitle="Frequently bought together with your cart items"
                                    products={suggestions}
                                    onAddToCart={handleAddSuggestion}
                                    buttonStates={suggestionButtonStates}
                                />
                            </div>
                        )}
                    </div>

                    {/* Desktop Order Summary */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <Card className="sticky top-4 rounded-2xl border border-gray-100 shadow-none">
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
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            ₹{formatINR(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Coupon Discount
                                        </span>
                                        {couponDiscount > 0 ? (
                                            <DiscountAmountDisplay
                                                isRecalculating={
                                                    isRecalculatingDiscount
                                                }
                                            >
                                                <span className="font-medium text-green-600">
                                                    -₹
                                                    {formatINR(couponDiscount)}
                                                </span>
                                            </DiscountAmountDisplay>
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
                                        <DiscountAmountDisplay
                                            isRecalculating={
                                                isRecalculatingDiscount
                                            }
                                        >
                                            <span className="font-medium text-gray-900">
                                                ₹{formatINR(gstAmount)}
                                            </span>
                                        </DiscountAmountDisplay>
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
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-bold text-gray-900">
                                        Grand Total
                                    </span>
                                    <div className="text-right">
                                        <DiscountAmountDisplay
                                            isRecalculating={
                                                isRecalculatingDiscount
                                            }
                                        >
                                            <span className="text-2xl font-bold text-gray-900">
                                                ₹{formatINR(grandTotal)}
                                            </span>
                                        </DiscountAmountDisplay>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                            Inclusive of all taxes
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isRecalculatingDiscount}
                                    className="w-full h-14 rounded-2xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isRecalculatingDiscount ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : null}
                                    Proceed to Checkout{" "}
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

                {/* Mobile carousel */}
                {suggestions.length > 0 && (
                    <div className="lg:hidden">
                        <ProductCarousel
                            title="You might also need"
                            subtitle="Frequently bought together with your cart items"
                            products={suggestions}
                            onAddToCart={handleAddSuggestion}
                            buttonStates={suggestionButtonStates}
                        />
                    </div>
                )}

                {/* Mobile Order Summary */}
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
                                        ₹{formatINR(subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Coupon Discount
                                    </span>
                                    {couponDiscount > 0 ? (
                                        <DiscountAmountDisplay
                                            isRecalculating={
                                                isRecalculatingDiscount
                                            }
                                        >
                                            <span className="font-medium text-green-600">
                                                -₹{formatINR(couponDiscount)}
                                            </span>
                                        </DiscountAmountDisplay>
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
                                    <DiscountAmountDisplay
                                        isRecalculating={
                                            isRecalculatingDiscount
                                        }
                                    >
                                        <span className="font-medium">
                                            ₹{formatINR(gstAmount)}
                                        </span>
                                    </DiscountAmountDisplay>
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
                                    <DiscountAmountDisplay
                                        isRecalculating={
                                            isRecalculatingDiscount
                                        }
                                    >
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹{formatINR(grandTotal)}
                                        </span>
                                    </DiscountAmountDisplay>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                        Inclusive of all taxes
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                disabled={isRecalculatingDiscount}
                                className="w-full h-14 rounded-2xl bg-gray-900 text-white text-base font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isRecalculatingDiscount ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : null}
                                Proceed to Checkout{" "}
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

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
                {mobileExpanded && (
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-2 text-sm animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                                ₹{formatINR(subtotal)}
                            </span>
                        </div>
                        {couponDiscount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Coupon Discount
                                </span>
                                <DiscountAmountDisplay
                                    isRecalculating={isRecalculatingDiscount}
                                >
                                    <span className="text-green-600 font-medium">
                                        -₹{formatINR(couponDiscount)}
                                    </span>
                                </DiscountAmountDisplay>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax (GST)</span>
                            <DiscountAmountDisplay
                                isRecalculating={isRecalculatingDiscount}
                            >
                                <span className="font-medium">
                                    ₹{formatINR(gstAmount)}
                                </span>
                            </DiscountAmountDisplay>
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
                                className={`w-3 h-3 text-gray-400 transition-transform ${mobileExpanded ? "rotate-180" : ""}`}
                            />
                        </button>
                        <DiscountAmountDisplay
                            isRecalculating={isRecalculatingDiscount}
                        >
                            <p className="text-xl font-bold text-gray-900">
                                ₹{formatINR(grandTotal)}
                            </p>
                        </DiscountAmountDisplay>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        disabled={isRecalculatingDiscount}
                        className="h-12 px-8 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isRecalculatingDiscount ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        ) : null}
                        Checkout <ChevronRight className="w-4 h-4 ml-1" />
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

            {/* Options Modal (Resin/Prebuilt) — FIX 3: reset button on close */}
            {activeModalItem && (
                <WishlistModal
                    item={activeModalItem}
                    onClose={() => {
                        const pid = activeModalItem.id;
                        setActiveModalItem(null);
                        setButtonState(pid, "idle");
                    }}
                />
            )}
        </>
    );
}
