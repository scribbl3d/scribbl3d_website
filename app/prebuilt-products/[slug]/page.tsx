"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import {
    Bell,
    Check,
    ChevronLeft,
    ChevronRight,
    Heart,
    Minus,
    Plus,
    ShoppingCart,
    Star,
    X,
    Zap,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function Shimmer({ className = "" }: { className?: string }) {
    return (
        <div
            className={`relative overflow-hidden rounded-lg ${className}`}
            style={{
                background:
                    "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
            }}
        />
    );
}

function PDPSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                <div className="flex flex-col gap-4">
                    <Shimmer className="w-full aspect-square rounded-2xl" />
                    <div className="flex gap-2.5 justify-center">
                        {[...Array(4)].map((_, i) => (
                            <Shimmer
                                key={i}
                                className="w-[72px] h-[72px] rounded-xl"
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="h-10 w-3/4" />
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-2/3" />
                    <div className="pt-4 flex flex-col gap-3">
                        <Shimmer className="h-4 w-16" />
                        <Shimmer className="h-6 w-48" />
                        <Shimmer className="h-12 w-40" />
                        <Shimmer className="h-4 w-32" />
                    </div>
                    <Shimmer className="h-44 w-full rounded-2xl" />
                    <Shimmer className="h-14 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

function ShieldCheckIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2L3 6.5V12c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6.5L12 2z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function TruckIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    );
}

/* ── Notify Me Modal ── */
function NotifyMeModal({
    product,
    variantId,
    variantLabel,
    onClose,
}: {
    product: any;
    variantId?: string;
    variantLabel?: string;
    onClose: () => void;
}) {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [email, setEmail] = useState((session?.user?.email as string) ?? "");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !phone.trim()) {
            toast({
                title: "Email and phone are required",
                variant: "destructive",
            });
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/stock-notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    productType: "prebuilt",
                    variantId: variantId ?? null,
                    variantLabel: variantLabel ?? null,
                    email: email.trim(),
                    phone: phone.trim(),
                    name: name.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast({
                    title: data.error || "Something went wrong",
                    variant: "destructive",
                });
                return;
            }
            setDone(true);
        } catch {
            toast({ title: "Request failed", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                            <Bell size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Notify Me When Back
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {product.name}
                                {variantLabel ? ` — ${variantLabel}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black mt-0.5"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5">
                    {done ? (
                        <div className="flex flex-col items-center py-6 text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                <Check size={22} className="text-green-600" />
                            </div>
                            <p className="text-base font-bold text-gray-900">
                                You're on the list!
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We'll notify you on{" "}
                                <span className="font-semibold text-gray-700">
                                    {email}
                                </span>{" "}
                                and{" "}
                                <span className="font-semibold text-gray-700">
                                    {phone}
                                </span>{" "}
                                as soon as this item is back in stock.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition"
                            >
                                Got it
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3.5">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                This product is currently out of stock. Leave
                                your details and we'll let you know the moment
                                it's available.
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Name{" "}
                                    <span className="text-gray-400 normal-case font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Email{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Phone Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    maxLength={15}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Bell size={14} /> Notify Me
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Variant Modal ── */
function VariantModal({
    product,
    onClose,
}: {
    product: any;
    onClose: () => void;
}) {
    const { addToCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

    const variants: any[] =
        product.variants?.filter((v: any) => v.isActive) ?? [];
    const uniqueColors: { name: string; hex: string | null }[] = Array.from(
        new Map(
            variants
                .filter((v) => v.colorName)
                .map((v) => [
                    v.colorName,
                    { name: v.colorName, hex: v.colorHex },
                ]),
        ).values(),
    );

    const [selectedColor, setSelectedColor] = useState<string | null>(
        uniqueColors[0]?.name ?? null,
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const validSizes: string[] = Array.from(
        new Set(
            variants
                .filter(
                    (v) =>
                        v.sizeName &&
                        (!selectedColor || v.colorName === selectedColor),
                )
                .map((v) => v.sizeName),
        ),
    );
    const selectedVariant =
        variants.find(
            (v) => v.colorName === selectedColor && v.sizeName === selectedSize,
        ) ??
        variants.find((v) => v.colorName === selectedColor) ??
        null;
    const displayPrice =
        selectedVariant?.price ?? product.variants?.[0]?.price ?? 0;
    const originalPrice = selectedVariant?.originalPrice ?? 0;
    const discount =
        originalPrice > displayPrice && originalPrice > 0
            ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
            : 0;

    const handleAddToCart = async () => {
        if (!session) {
            toast({
                title: "Authentication required",
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
        if (!selectedVariant) return;
        setIsAdding(true);
        try {
            await addToCart({
                prebuiltProductId: product.id,
                prebuiltVariantId: selectedVariant.id,
                quantity,
            });
            toast({
                title: "Added to cart",
                description: `${product.name} × ${quantity} added.`,
            });
            onClose();
        } catch {
            toast({
                title: "Error",
                description: "Failed to add to cart",
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                <div className="flex gap-4 p-5 relative">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {(product.images?.find((i: any) => i.isMain)?.url ??
                            product.images?.[0]?.url) && (
                            <Image
                                src={
                                    product.images?.find((i: any) => i.isMain)
                                        ?.url ?? product.images?.[0]?.url
                                }
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-semibold pr-6 leading-snug">
                            {product.name}
                        </h2>
                        {product.category && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
                                {product.category}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="p-5 pb-8">
                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-xl font-bold text-gray-900">
                            ₹{displayPrice.toLocaleString("en-IN")}
                        </span>
                        {originalPrice > displayPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                {discount}% off
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">(incl. GST)</p>
                    {uniqueColors.length > 0 && (
                        <div className="mb-4">
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
                                        onClick={() => {
                                            setSelectedColor(c.name);
                                            setSelectedSize(null);
                                        }}
                                        title={c.name}
                                        className={`relative w-8 h-8 rounded-full border-2 transition-all ring-offset-1 ${selectedColor === c.name ? "ring-2 ring-gray-900 scale-110" : "border-transparent hover:ring-1 hover:ring-gray-400"}`}
                                        style={{
                                            backgroundColor: c.hex ?? "#E5E7EB",
                                        }}
                                    >
                                        {selectedColor === c.name && (
                                            <Check
                                                size={11}
                                                className="absolute inset-0 m-auto text-white drop-shadow"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {validSizes.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {validSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${selectedSize === size ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-2">Quantity</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                            >
                                −
                            </button>
                            <div className="flex-1 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-semibold">
                                {quantity}
                            </div>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <button
                        disabled={
                            !selectedVariant ||
                            isAdding ||
                            product.inStock === false
                        }
                        onClick={handleAddToCart}
                        className={`w-full h-12 font-semibold rounded-xl transition flex items-center justify-center gap-2 ${product.inStock === false ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"}`}
                    >
                        {product.inStock === false ? (
                            "Out of Stock"
                        ) : isAdding ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Add to Cart"
                        )}
                    </button>
                    <button
                        onClick={() => {
                            if (product.slug)
                                router.push(
                                    `/prebuilt-products/${product.slug}`,
                                );
                            onClose();
                        }}
                        className="w-full text-sm mt-3 text-gray-500 hover:text-black"
                    >
                        View full details →
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Similar Product Card ── */
function SimilarProductCard({ product }: { product: any }) {
    const { data: session } = useSession();
    const router = useRouter();
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    useEffect(() => {
        if (!session || !product?.id) return;
        fetch(`/api/wishlist/check?prebuiltProductId=${product.id}`)
            .then((r) => r.json())
            .then((d) => setIsFavorite(d.isInWishlist))
            .catch(() => {});
    }, [session, product?.id]);

    const handleToggleWishlist = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please log in to add items to wishlist",
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
        if (isWishlistLoading) return;
        setIsWishlistLoading(true);
        const was = isFavorite;
        setIsFavorite(!was);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prebuiltProductId: product.id }),
            });
        } catch {
            setIsFavorite(was);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const discount = variant?.originalPrice
        ? Math.round(
              ((variant.originalPrice - variant.price) /
                  variant.originalPrice) *
                  100,
          )
        : 0;
    const sizes = Array.from(
        new Set(product.variants?.map((v: any) => v.sizeName).filter(Boolean)),
    );
    const uniqueColors: { name: string; hex: string }[] = Array.from(
        new Map(
            product.variants
                ?.filter((v: any) => v.colorHex)
                .map((v: any) => [
                    v.colorHex,
                    { name: v.colorName, hex: v.colorHex },
                ]),
        ).values() as IterableIterator<{ name: string; hex: string }>,
    );
    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    return (
        <>
            <div
                onClick={() =>
                    product.slug &&
                    router.push(`/prebuilt-products/${product.slug}`)
                }
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden w-full h-full cursor-pointer transition-all hover:shadow-lg hover:border-gray-200"
            >
                <div
                    className="relative overflow-hidden bg-[#f9f9f9]"
                    style={{ aspectRatio: "1 / 0.9" }}
                >
                    {mainImage ? (
                        <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                            No image
                        </div>
                    )}
                    {/* Out of Stock badge */}
                    {product.inStock === false && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                            Out of Stock
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWishlist(e);
                        }}
                        disabled={isWishlistLoading}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-400 shadow-sm backdrop-blur-md transition-colors hover:text-red-500"
                    >
                        {isWishlistLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                            <Heart
                                size={20}
                                className={
                                    isFavorite
                                        ? "fill-red-500 text-red-500"
                                        : "text-gray-400"
                                }
                            />
                        )}
                    </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <div className="mb-3 h-[32px] flex items-center">
                        {product.highlighted ? (
                            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-medium text-[#372AAC] border-2 border-[#3f5df2] bg-white">
                                Trending Now
                            </span>
                        ) : (
                            <span className="invisible px-4 py-1.5 text-[11px]">
                                Trending Now
                            </span>
                        )}
                    </div>
                    <h3 className="text-base font-medium text-[#101828] mb-2 line-clamp-2 h-[48px]">
                        {product.name}
                    </h3>
                    <p className="text-sm text-[#4A5565] mb-4 line-clamp-2 h-[40px]">
                        {product.shortDescription}
                    </p>
                    <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#6A7282]">
                                Available Sizes:
                            </span>
                            <span className="text-xs text-[#364153]">
                                {sizeString}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#6A7282]">
                                Colour Options:
                            </span>
                            {uniqueColors.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    {uniqueColors.slice(0, 5).map((c, i) => (
                                        <div
                                            key={i}
                                            title={c.name}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center border ${i === 0 ? "border-black" : "border-gray-300"}`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{
                                                    backgroundColor: c.hex,
                                                }}
                                            />
                                        </div>
                                    ))}
                                    {uniqueColors.length > 5 && (
                                        <span className="text-[10px] text-gray-400">
                                            +{uniqueColors.length - 5}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-xs text-[#364153]">
                                    Standard
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#6A7282]">
                                Starts at
                            </span>
                            <span className="text-base font-semibold text-[#1a1a1a]">
                                ₹{variant?.price?.toLocaleString()}
                            </span>
                            {discount > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                    ₹{variant?.originalPrice?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        {discount > 0 && (
                            <span className="rounded-full bg-[#e8f5e9] px-2 py-1 text-[10px] font-semibold text-[#2e7d32]">
                                {discount}% OFF
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400 mb-4">
                        (incl. GST)
                    </span>

                    {/* Select Variants — hidden when out of stock */}
                    {product.inStock !== false && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowModal(true);
                            }}
                            className="w-full rounded-[10px] py-2.5 text-sm font-semibold transition-all bg-[#1E1E1E] text-white hover:bg-black active:scale-[0.97]"
                        >
                            Select Variants
                        </button>
                    )}

                    {/* Notify Me — only when out of stock */}
                    {product.inStock === false && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotifyModal(true);
                            }}
                            className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2 border-orange-400 text-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Bell size={13} /> Notify Me When Back in Stock
                        </button>
                    )}
                </div>
            </div>

            {showModal && (
                <VariantModal
                    product={product}
                    onClose={() => setShowModal(false)}
                />
            )}
            {showNotifyModal && (
                <NotifyMeModal
                    product={product}
                    onClose={() => setShowNotifyModal(false)}
                />
            )}
        </>
    );
}

/* ── Similar Products Carousel ── */
function SimilarProductsCarousel({
    products,
    category,
}: {
    products: any[];
    category: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isHoveringRef = useRef(false);
    const doubled = [...products, ...products];

    const startAutoScroll = useCallback(() => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        if (products.length <= 1) return;
        autoScrollRef.current = setInterval(() => {
            if (isHoveringRef.current) return;
            const container = scrollRef.current;
            if (!container) return;
            const cardWidth =
                (container.firstElementChild as HTMLElement)?.offsetWidth +
                    20 || 300;
            container.scrollBy({ left: cardWidth, behavior: "smooth" });
            setTimeout(() => {
                if (!container) return;
                if (container.scrollLeft >= container.scrollWidth / 2)
                    container.scrollTo({ left: 0, behavior: "auto" });
            }, 600);
        }, 3000);
    }, [products.length]);

    useEffect(() => {
        startAutoScroll();
        return () => {
            if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        };
    }, [startAutoScroll]);

    const scrollBy = (dir: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth =
            (container.firstElementChild as HTMLElement)?.offsetWidth + 20 ||
            300;
        container.scrollBy({
            left: dir === "right" ? cardWidth : -cardWidth,
            behavior: "smooth",
        });
    };

    if (products.length === 0) return null;

    return (
        <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Similar Products
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        More from {category}
                    </p>
                </div>
            </div>
            <div className="relative">
                <button
                    onClick={() => scrollBy("left")}
                    className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={() => scrollBy("right")}
                    className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                >
                    <ChevronRight size={18} />
                </button>
                <div
                    ref={scrollRef}
                    onMouseEnter={() => {
                        isHoveringRef.current = true;
                    }}
                    onMouseLeave={() => {
                        isHoveringRef.current = false;
                    }}
                    className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <style>{`div::-webkit-scrollbar{display:none}`}</style>
                    {doubled.map((p: any, index: number) => (
                        <div
                            key={`${p.id}-${index}`}
                            className="snap-start flex-shrink-0 w-[85%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
                        >
                            <SimilarProductCard product={p} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Main PDP ── */
export default function PrebuiltProductPDP() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const slug = params.slug as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "specifications" | "features" | "support" | "care"
    >("specifications");

    useEffect(() => {
        if (!slug) return;
        async function fetchProduct() {
            try {
                setLoading(true);
                const res = await fetch(`/api/prebuilt-products/${slug}`);
                if (!res.ok) throw new Error("Product not found");
                const data = await res.json();
                setProduct(data);
                if (data.variants?.length > 0) {
                    const first =
                        data.variants.find((v: any) => v.isActive) ||
                        data.variants[0];
                    setSelectedColor(first.colorName || "");
                    setSelectedSize(first.sizeName || "");
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load product",
                );
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (!product?.category) return;
        async function fetchSimilar() {
            try {
                const res = await fetch(
                    `/api/prebuilt-products?category=${encodeURIComponent(product.category)}&limit=8`,
                );
                if (!res.ok) return;
                const data = await res.json();
                const all = data.products || data;
                setSimilarProducts(
                    all
                        .filter(
                            (p: any) => p.id !== product.id && p.slug !== slug,
                        )
                        .slice(0, 8),
                );
            } catch {
                /* silently fail */
            }
        }
        fetchSimilar();
    }, [product?.category, product?.id, slug]);

    useEffect(() => {
        if (!session || !product?.id) return;
        fetch(`/api/wishlist/check?prebuiltProductId=${product.id}`)
            .then((r) => r.json())
            .then((d) => setIsFavorite(d.isInWishlist))
            .catch(() => {});
    }, [session, product?.id]);

    const images: any[] = (() => {
        if (!product) return [];
        const byColor =
            product.images?.filter(
                (img: any) => !img.colorName || img.colorName === selectedColor,
            ) || [];
        return byColor.length > 0 ? byColor : product.images || [];
    })();
    const totalSlides = images.length;

    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (totalSlides > 1)
            autoPlayRef.current = setInterval(
                () => setCurrentSlide((c) => (c + 1) % totalSlides),
                3000,
            );
    }, [totalSlides]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [startAutoPlay]);

    const handleMouseEnter = () => {
        setIsHovering(true);
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    };
    const handleMouseLeave = () => {
        setIsHovering(false);
        startAutoPlay();
    };
    const prev = () =>
        setCurrentSlide((c) => (c - 1 + totalSlides) % totalSlides);
    const next = () => setCurrentSlide((c) => (c + 1) % totalSlides);
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const d = touchStartX.current - touchEndX.current;
        if (Math.abs(d) > 50) d > 0 ? next() : prev();
    };
    useEffect(() => {
        setCurrentSlide(0);
    }, [selectedColor]);

    const uniqueColors: string[] = Array.from(
        new Set(
            product?.variants
                ?.filter((v: any) => v.isActive && v.colorName)
                .map((v: any) => v.colorName),
        ),
    );
    const uniqueSizes: string[] = Array.from(
        new Set(
            product?.variants
                ?.filter((v: any) => v.isActive && v.sizeName)
                .map((v: any) => v.sizeName),
        ),
    );

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const sizeValid = product?.variants?.some(
            (v: any) =>
                v.colorName === color &&
                v.sizeName === selectedSize &&
                v.isActive,
        );
        if (!sizeValid)
            setSelectedSize(
                product?.variants?.find(
                    (v: any) => v.colorName === color && v.isActive,
                )?.sizeName || "",
            );
    };
    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
        const colorValid = product?.variants?.some(
            (v: any) =>
                v.sizeName === size &&
                v.colorName === selectedColor &&
                v.isActive,
        );
        if (!colorValid)
            setSelectedColor(
                product?.variants?.find(
                    (v: any) => v.sizeName === size && v.isActive,
                )?.colorName || "",
            );
    };

    const selectedVariant =
        product?.variants?.find(
            (v: any) =>
                v.colorName === selectedColor &&
                v.sizeName === selectedSize &&
                v.isActive,
        ) ||
        product?.variants?.find(
            (v: any) => v.colorName === selectedColor && v.isActive,
        ) ||
        product?.variants?.find((v: any) => v.isActive);

    const displayPrice = selectedVariant?.price || 0;
    const originalPrice = selectedVariant?.originalPrice || 0;
    const discount =
        originalPrice > displayPrice && originalPrice > 0
            ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
            : 0;
    const avgRating =
        product?.reviews?.length > 0
            ? (
                  product.reviews.reduce(
                      (s: number, r: any) => s + r.rating,
                      0,
                  ) / product.reviews.length
              ).toFixed(1)
            : "0";

    const handleToggleWishlist = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        if (!session) {
            toast({
                title: "Authentication required",
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
        if (isWishlistLoading) return;
        setIsWishlistLoading(true);
        const was = isFavorite;
        setIsFavorite(!was);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prebuiltProductId: product.id }),
            });
            toast({
                title: was ? "Removed from wishlist" : "Added to wishlist",
            });
        } catch {
            setIsFavorite(was);
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!session) {
            toast({
                title: "Authentication required",
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
        if (!selectedVariant) {
            toast({
                title: "Please select a variant",
                description: "Choose a colour and size before adding to cart.",
                variant: "destructive",
            });
            return;
        }
        if (!selectedVariant.isActive) {
            toast({
                title: "Variant unavailable",
                description:
                    "This colour/size combination is currently out of stock.",
                variant: "destructive",
            });
            return;
        }
        setIsAddingToCart(true);
        try {
            await addToCart({
                prebuiltProductId: product.id,
                prebuiltVariantId: selectedVariant.id,
                quantity,
            });
            const variantLabel = [selectedColor, selectedSize]
                .filter(Boolean)
                .join(", ");
            toast({
                title: "Added to cart",
                description: `${product.name}${variantLabel ? ` (${variantLabel})` : ""} × ${quantity} added.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to add to cart",
                variant: "destructive",
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    const tabs = [
        { key: "specifications", label: "Specifications" },
        { key: "features", label: "Features" },
        { key: "support", label: "Support & Warranty" },
        { key: "care", label: "Care & Precautions" },
    ] as const;

    if (loading)
        return (
            <div className="min-h-screen bg-white">
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                <div className="border-b border-gray-100 py-3.5 px-10">
                    <Shimmer className="h-4 w-48" />
                </div>
                <PDPSkeleton />
            </div>
        );

    if (error || !product)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <h1 className="text-2xl font-bold text-gray-900">
                    Product not found
                </h1>
                <p className="text-gray-500">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="text-gray-700 hover:underline font-medium"
                >
                    ← Back
                </button>
            </div>
        );

    const isOutOfStock = product.inStock === false;
    // Variant-level OOS: product is in stock but selected variant is not
    const isVariantOutOfStock =
        !isOutOfStock && selectedVariant?.inStock === false;
    // Combined: either the whole product or the selected variant is OOS
    const isAnyOutOfStock = isOutOfStock || isVariantOutOfStock;

    // Build a human-readable label for the notify modal (e.g. "Red, Large")
    const variantLabel = [selectedColor, selectedSize]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="min-h-screen bg-white">
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

            <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2">
                    <button
                        onClick={() => router.push("/prebuilt-products")}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition px-3 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <ChevronLeft size={16} /> Back to all pre-built products
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* LEFT */}
                    <div className="lg:sticky lg:top-20 flex flex-col gap-4">
                        <div
                            className="relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 select-none"
                            style={{ aspectRatio: "1/1" }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        >
                            {images.length > 0 ? (
                                <>
                                    <div
                                        className="flex h-full transition-transform duration-500 ease-in-out"
                                        style={{
                                            transform: `translateX(-${currentSlide * 100}%)`,
                                        }}
                                    >
                                        {images.map((img: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="relative min-w-full h-full"
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt={
                                                        img.altText ||
                                                        product.name
                                                    }
                                                    fill
                                                    className="object-contain p-10"
                                                    priority={idx === 0}
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {totalSlides > 1 && isHovering && (
                                        <>
                                            <button
                                                onClick={prev}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform z-10"
                                            >
                                                <ChevronLeft
                                                    size={18}
                                                    className="text-gray-700"
                                                />
                                            </button>
                                            <button
                                                onClick={next}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform z-10"
                                            >
                                                <ChevronRight
                                                    size={18}
                                                    className="text-gray-700"
                                                />
                                            </button>
                                        </>
                                    )}
                                    {totalSlides > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                            {images.map(
                                                (_: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() =>
                                                            setCurrentSlide(idx)
                                                        }
                                                        className={`rounded-full transition-all duration-300 ${idx === currentSlide ? "w-5 h-2 bg-gray-900" : "w-2 h-2 bg-gray-300 hover:bg-gray-500"}`}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300 text-sm">
                                    No image available
                                </div>
                            )}
                            {product.highlighted && (
                                <span className="absolute top-4 left-4 flex items-center gap-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                                    <Zap size={10} className="fill-white" />{" "}
                                    Trending Now
                                </span>
                            )}
                            {isOutOfStock && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10">
                                    Out of Stock
                                </div>
                            )}
                        </div>
                        {totalSlides > 1 && (
                            <div className="flex gap-2.5 justify-center flex-wrap">
                                {images
                                    .slice(0, 6)
                                    .map((img: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            className={`relative rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 ${currentSlide === idx ? "border-gray-900 scale-105" : "border-gray-200 hover:border-gray-400"}`}
                                            style={{ width: 72, height: 72 }}
                                        >
                                            <Image
                                                src={img.url}
                                                alt={`View ${idx + 1}`}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col gap-4 relative">
                        <button
                            onClick={handleToggleWishlist}
                            disabled={isWishlistLoading}
                            className="absolute top-0 right-0 w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-60 z-10"
                        >
                            {isWishlistLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    size={16}
                                    className={
                                        isFavorite
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-400"
                                    }
                                />
                            )}
                        </button>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                                {product.category}
                            </p>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight pr-10">
                                {product.name}
                            </h1>
                            <p className="mt-1.5 text-gray-500 text-sm leading-relaxed">
                                {product.shortDescription}
                            </p>
                            {product.reviews?.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                className={
                                                    i <
                                                    Math.round(
                                                        Number(avgRating),
                                                    )
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-200"
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {avgRating}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        ({product.reviews.length} review
                                        {product.reviews.length !== 1
                                            ? "s"
                                            : ""}
                                        )
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-b border-gray-100 py-3">
                            <p className="text-xs text-gray-400 mb-1">Price</p>
                            {originalPrice > displayPrice && (
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm text-gray-400 line-through">
                                        ₹{originalPrice.toLocaleString("en-IN")}
                                    </span>
                                    {discount > 0 && (
                                        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                                            {discount}% off
                                        </span>
                                    )}
                                </div>
                            )}
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">
                                ₹{displayPrice.toLocaleString("en-IN")}
                            </p>
                            {originalPrice > displayPrice && (
                                <p className="text-xs text-green-600 font-semibold mt-0.5">
                                    Save ₹
                                    {(
                                        originalPrice - displayPrice
                                    ).toLocaleString("en-IN")}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                MRP inclusive of all taxes. Shipping calculated
                                at checkout.
                            </p>
                        </div>

                        {(uniqueColors.length > 0 ||
                            uniqueSizes.length > 0) && (
                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
                                {uniqueColors.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Color:{" "}
                                            <span className="font-normal text-gray-500">
                                                {selectedColor || "Select"}
                                            </span>
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {uniqueColors.map((color) => {
                                                const cv =
                                                    product.variants?.find(
                                                        (v: any) =>
                                                            v.colorName ===
                                                                color &&
                                                            v.colorHex,
                                                    );
                                                const hex =
                                                    cv?.colorHex || "#cccccc";
                                                const isSelected =
                                                    selectedColor === color;
                                                return (
                                                    <button
                                                        key={color}
                                                        onClick={() =>
                                                            handleColorChange(
                                                                color,
                                                            )
                                                        }
                                                        title={color}
                                                        className={`relative w-8 h-8 rounded-full transition-all ring-offset-2 ${isSelected ? "ring-2 ring-gray-900 scale-110" : "ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-105"}`}
                                                        style={{
                                                            backgroundColor:
                                                                hex,
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <Check
                                                                size={12}
                                                                className="absolute inset-0 m-auto text-white drop-shadow"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {uniqueColors.length > 0 &&
                                    uniqueSizes.length > 0 && (
                                        <div className="border-t border-gray-100" />
                                    )}
                                {uniqueSizes.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Size
                                        </p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {uniqueSizes.map((size) => {
                                                const isSelected =
                                                    selectedSize === size;
                                                const available =
                                                    product.variants?.some(
                                                        (v: any) =>
                                                            v.sizeName ===
                                                                size &&
                                                            (!selectedColor ||
                                                                v.colorName ===
                                                                    selectedColor) &&
                                                            v.isActive,
                                                    );
                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() =>
                                                            available &&
                                                            handleSizeChange(
                                                                size,
                                                            )
                                                        }
                                                        disabled={!available}
                                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isSelected ? "border-gray-900 bg-gray-900 text-white" : available ? "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50" : "border-gray-100 text-gray-300 cursor-not-allowed line-through"}`}
                                                    >
                                                        {size}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {product.isCustomizable !== undefined && (
                                    <>
                                        <div className="border-t border-gray-100" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700 mb-1.5">
                                                Customization
                                            </p>
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${product.isCustomizable ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                                            >
                                                {product.isCustomizable && (
                                                    <Check size={10} />
                                                )}
                                                {product.isCustomizable
                                                    ? "Available"
                                                    : "Not Available"}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!isAnyOutOfStock && (
                            <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                    Quantity
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-900 transition bg-white"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <div className="w-12 h-9 rounded-lg border border-gray-200 flex items-center justify-center bg-white">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {quantity}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-900 transition bg-white"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={
                                isAnyOutOfStock ? undefined : handleAddToCart
                            }
                            disabled={
                                isAnyOutOfStock ||
                                isAddingToCart ||
                                !selectedVariant
                            }
                            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${isAnyOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black text-white disabled:opacity-50"}`}
                        >
                            {isAnyOutOfStock ? (
                                "Out of Stock"
                            ) : isAddingToCart ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShoppingCart size={16} />
                                    {!selectedVariant
                                        ? "Select a Variant"
                                        : "Add to Cart"}
                                </>
                            )}
                        </button>

                        {isAnyOutOfStock && (
                            <button
                                onClick={() => setShowNotifyModal(true)}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-orange-400 text-orange-500 hover:bg-orange-50 transition flex items-center justify-center gap-2"
                            >
                                <Bell size={15} />
                                Notify Me When Back in Stock
                                {isVariantOutOfStock && variantLabel && (
                                    <span className="text-xs font-normal opacity-75">
                                        ({variantLabel})
                                    </span>
                                )}
                            </button>
                        )}

                        {!isAnyOutOfStock && (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <ShieldCheckIcon /> Quality Inspected
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <TruckIcon /> Express Shipping
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABS */}
                <div className="mt-14 border border-gray-200 rounded-2xl bg-white overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-gray-200">
                        {tabs.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition -mb-px ${activeTab === key ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">
                        {activeTab === "specifications" && (
                            <div className="flex flex-col gap-6">
                                {(product.longDescription ||
                                    product.shortDescription) && (
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 mb-2">
                                            Description
                                        </h2>
                                        <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
                                            {product.longDescription ||
                                                product.shortDescription}
                                        </p>
                                    </div>
                                )}
                                {(product.attributes?.length > 0 ||
                                    product.weight) && (
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 mb-3">
                                            Physical Properties
                                        </h2>
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            {product.attributes?.map(
                                                (attr: any, i: number) => (
                                                    <div
                                                        key={attr.id}
                                                        className={`flex items-center px-5 py-3 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"} border-b border-gray-100`}
                                                    >
                                                        <span className="text-sm text-gray-500 w-56 flex-shrink-0">
                                                            {attr.label}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {attr.value}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                            {product.weight && (
                                                <div
                                                    className={`flex items-center px-5 py-3 ${product.attributes?.length % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                                                >
                                                    <span className="text-sm text-gray-500 w-56 flex-shrink-0">
                                                        Weight
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {product.weight}g
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === "features" && (
                            <div>
                                {product.features?.length > 0 ? (
                                    <>
                                        <h2 className="text-base font-semibold text-gray-900 mb-4">
                                            Key Features
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                                            {product.features.map(
                                                (
                                                    feature: string,
                                                    idx: number,
                                                ) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-2.5"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Check
                                                                size={11}
                                                                className="text-green-600"
                                                            />
                                                        </div>
                                                        <span className="text-gray-600 text-sm leading-relaxed">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        No features listed for this product.
                                    </p>
                                )}
                            </div>
                        )}
                        {activeTab === "support" && (
                            <div className="flex flex-col gap-5">
                                {[
                                    {
                                        title: "Warranty",
                                        body: "7-day structural warranty on all 3D printed components covering manufacturing defects only. 30-day warranty on electrical components (if applicable) covering functional defects in internal parts.",
                                    },
                                    {
                                        title: "Installation",
                                        body: "Product is shipped fully assembled and ready to use. For electrical variants, connect to the recommended power source and follow the included quick-start guide.",
                                    },
                                    {
                                        title: "Not Covered",
                                        body: "Warranty does not cover damage from impact, heat exposure, moisture, incorrect power supply, or unauthorised modifications.",
                                    },
                                ].map((item) => (
                                    <div key={item.title}>
                                        <h2 className="text-sm font-bold text-gray-900 mb-1">
                                            {item.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {item.body}
                                        </p>
                                    </div>
                                ))}
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 mb-1">
                                        Contact Support
                                    </h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        To raise a warranty claim, contact our
                                        support team with your{" "}
                                        <span className="font-bold text-gray-800">
                                            Order ID
                                        </span>{" "}
                                        along with photos or a video clearly
                                        showing the defect.
                                    </p>
                                </div>
                            </div>
                        )}
                        {activeTab === "care" && (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full flex-shrink-0" />
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Maintenance Guidelines
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        {
                                            title: "Cleaning & Surface Care",
                                            body: "Use a soft microfiber cloth for cleaning. Avoid harsh chemicals, acetone, or alcohol-based cleaners as they may damage the 3D printed surface. For electrical models, disconnect power before cleaning.",
                                        },
                                        {
                                            title: "Structural Care",
                                            body: "3D printed components can soften under high heat. Avoid placing the product in direct sunlight, near heaters, or inside vehicles. Do not apply excessive force or weight.",
                                        },
                                        {
                                            title: "Electrical Check (If Applicable)",
                                            body: "Periodically inspect wiring, connectors, and switches for looseness. Use only the recommended adapter and voltage rating. Disconnect from power when not in use for extended periods.",
                                        },
                                        {
                                            title: "Handling & Storage",
                                            body: "Handle with care — avoid drops or impact. Store in a cool, dry indoor environment. Keep away from moisture unless specifically rated otherwise.",
                                        },
                                    ].map((card) => (
                                        <div
                                            key={card.title}
                                            className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {card.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full flex-shrink-0" />
                                        <h2 className="text-base font-bold text-orange-800">
                                            Safety Precautions
                                        </h2>
                                    </div>
                                    <ul className="flex flex-col gap-2.5">
                                        {[
                                            "Heat Limits: Do not expose to temperatures above 50–60°C (material dependent).",
                                            "Moisture: Not waterproof unless explicitly mentioned.",
                                            "Power Safety: Do not use damaged cables or incompatible adapters.",
                                            "Modification: Do not open internal housing or modify wiring.",
                                            "Small Parts: Keep away from small children if product contains detachable components.",
                                        ].map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                                                <span className="text-sm text-orange-900 leading-relaxed">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews */}
                {product.reviews?.length > 0 && (
                    <div className="mt-10 border border-gray-200 rounded-2xl bg-white p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={
                                            i < Math.round(Number(avgRating))
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-200"
                                        }
                                    />
                                ))}
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                {avgRating}
                            </span>
                            <span className="text-sm text-gray-400">
                                ({product.reviews.length} review
                                {product.reviews.length !== 1 ? "s" : ""})
                            </span>
                        </div>
                        <div className="flex flex-col gap-5">
                            {product.reviews
                                .slice(0, 5)
                                .map((review: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="pb-5 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">
                                                    {review.userName}
                                                </p>
                                                <div className="flex gap-0.5 mt-1">
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={11}
                                                                className={
                                                                    i <
                                                                    review.rating
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-200"
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(
                                                    review.createdAt,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {similarProducts.length > 0 && (
                    <SimilarProductsCarousel
                        products={similarProducts}
                        category={product.category}
                    />
                )}
            </div>

            {showNotifyModal && (
                <NotifyMeModal
                    product={product}
                    variantId={
                        isVariantOutOfStock ? selectedVariant?.id : undefined
                    }
                    variantLabel={
                        isVariantOutOfStock ? variantLabel : undefined
                    }
                    onClose={() => setShowNotifyModal(false)}
                />
            )}
        </div>
    );
}
