"use client";

import { toast } from "@/components/ui/use-toast";
import { getCardImageUrl } from "@/lib/cloudinary-url";
import { useCart } from "@/providers/CartProvider";
import { Bell, Check, Heart, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
    products: any[];
}

/* ─────────────────────────────────────────────────────────
   Notify Me Modal (whole product OOS)
───────────────────────────────────────────────────────── */
function NotifyMeModal({
    product,
    onClose,
}: {
    product: any;
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
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                            <Bell size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Notify Me When Back
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {product.name}
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

/* ─────────────────────────────────────────────────────────
   Variant-level Notify Me Modal
───────────────────────────────────────────────────────── */
function VariantNotifyModal({
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
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
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
                                as soon as this variant is back.
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
                                {variantLabel
                                    ? `${variantLabel} is`
                                    : "This variant is"}{" "}
                                currently out of stock. Leave your details and
                                we'll notify you the moment it's available.
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

/* ─────────────────────────────────────────────────────────
   Inline Variant Modal
───────────────────────────────────────────────────────── */
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

    const [fullProduct, setFullProduct] = useState<any>(product);
    const [fetching, setFetching] = useState(false);
    const [showVariantNotify, setShowVariantNotify] = useState(false);

    useEffect(() => {
        const hasVariants = product.variants?.some(
            (v: any) => v.isActive && v.price > 0,
        );
        if (hasVariants) return;
        if (!product.slug) return;
        setFetching(true);
        fetch(`/api/prebuilt-products/${product.slug}`)
            .then((r) => r.json())
            .then((data) => setFullProduct(data))
            .catch(() => {})
            .finally(() => setFetching(false));
    }, [product.slug, product.variants]);

    const variants: any[] =
        fullProduct.variants?.filter((v: any) => v.isActive) ?? [];

    const uniqueColors: { name: string; hex: string | null; isOOS: boolean }[] =
        Array.from(
            new Map(
                variants
                    .filter((v) => v.colorName)
                    .map((v) => [
                        v.colorName,
                        { name: v.colorName, hex: v.colorHex },
                    ]),
            ).values(),
        ).map((c) => {
            const allForColour = variants.filter((v) => v.colorName === c.name);
            const isOOS =
                allForColour.length > 0 &&
                allForColour.every((v) => v.inStock === false);
            return { ...c, isOOS };
        });

    const [selectedColor, setSelectedColor] = useState<string | null>(
        uniqueColors.find((c) => !c.isOOS)?.name ??
            uniqueColors[0]?.name ??
            null,
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const colors = Array.from(
            new Map(
                (
                    fullProduct.variants?.filter(
                        (v: any) => v.isActive && v.colorName,
                    ) ?? []
                ).map((v: any) => [v.colorName, v.colorName]),
            ).keys(),
        );
        if (colors.length > 0 && !selectedColor)
            setSelectedColor(colors[0] as string);
    }, [fullProduct]);

    const validSizes: { name: string; isOOS: boolean }[] = Array.from(
        new Set(
            variants
                .filter(
                    (v) =>
                        v.sizeName &&
                        (!selectedColor || v.colorName === selectedColor),
                )
                .map((v) => v.sizeName),
        ),
    ).map((size) => {
        const v = variants.find(
            (v) => v.colorName === selectedColor && v.sizeName === size,
        );
        return { name: size as string, isOOS: v?.inStock === false };
    });

    const selectedVariant =
        variants.find(
            (v) => v.colorName === selectedColor && v.sizeName === selectedSize,
        ) ??
        variants.find((v) => v.colorName === selectedColor) ??
        null;

    const isColourOOS =
        uniqueColors.find((c) => c.name === selectedColor)?.isOOS ?? false;
    const isVariantOOS = !isColourOOS && selectedVariant?.inStock === false;
    const isAnyOOS =
        fullProduct.inStock === false || isColourOOS || isVariantOOS;

    const notifyVariantId = isColourOOS
        ? selectedVariant?.id
        : isVariantOOS
          ? selectedVariant?.id
          : undefined;
    const notifyVariantLabel = isColourOOS
        ? (selectedColor ?? undefined)
        : isVariantOOS
          ? [selectedColor, selectedSize].filter(Boolean).join(", ")
          : undefined;

    const displayPrice = selectedVariant?.price ?? variants[0]?.price ?? 0;
    const originalPrice = selectedVariant?.originalPrice ?? 0;
    const discount =
        originalPrice > displayPrice && originalPrice > 0
            ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
            : 0;

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        setSelectedSize(null);
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
        if (!selectedVariant) return;
        setIsAdding(true);
        try {
            await addToCart({
                prebuiltProductId: fullProduct.id,
                prebuiltVariantId: selectedVariant.id,
                quantity,
            });
            const label = [selectedColor, selectedSize]
                .filter(Boolean)
                .join(", ");
            toast({
                title: "Added to cart",
                description: `${fullProduct.name}${label ? ` (${label})` : ""} × ${quantity} added.`,
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
        <>
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                    <div className="flex gap-4 p-5 relative">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {(fullProduct.images?.find((i: any) => i.isMain)
                                ?.url ??
                                fullProduct.images?.[0]?.url) && (
                                <Image
                                    src={
                                        fullProduct.images?.find(
                                            (i: any) => i.isMain,
                                        )?.url ?? fullProduct.images?.[0]?.url
                                    }
                                    alt={fullProduct.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-semibold pr-6 leading-snug">
                                {fullProduct.name}
                            </h2>
                            {fullProduct.category && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
                                    {fullProduct.category}
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
                        {fetching ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-baseline gap-3 mb-1">
                                    <span className="text-xl font-bold text-gray-900">
                                        ₹{displayPrice.toLocaleString("en-IN")}
                                    </span>
                                    {originalPrice > displayPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                            ₹
                                            {originalPrice.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    )}
                                    {discount > 0 && (
                                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                            {discount}% off
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    (incl. GST)
                                </p>

                                {uniqueColors.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2">
                                            Color:{" "}
                                            <span className="font-normal text-gray-500">
                                                {selectedColor ?? "Select"}
                                            </span>
                                            {isColourOOS && (
                                                <span className="ml-2 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {uniqueColors.map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() =>
                                                        handleColorChange(
                                                            c.name,
                                                        )
                                                    }
                                                    title={
                                                        c.isOOS
                                                            ? `${c.name} — Out of Stock`
                                                            : c.name
                                                    }
                                                    className={`relative w-9 h-9 rounded-full border-2 transition-all ring-offset-1 ${selectedColor === c.name ? "ring-2 ring-gray-900 scale-110" : "border-transparent hover:ring-1 hover:ring-gray-400"} ${c.isOOS ? "opacity-40" : ""}`}
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

                                {validSizes.length > 0 && (
                                    <div className="mb-4">
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
                                                            !isColourOOS &&
                                                            setSelectedSize(
                                                                size,
                                                            )
                                                        }
                                                        disabled={
                                                            sizeOOS ||
                                                            isColourOOS
                                                        }
                                                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${selectedSize === size ? "border-gray-900 bg-gray-900 text-white" : sizeOOS || isColourOOS ? "border-gray-100 text-gray-300 cursor-not-allowed line-through" : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {isVariantOOS && (
                                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">
                                        This colour + size combination is out of
                                        stock.
                                    </p>
                                )}

                                {!isAnyOOS && (
                                    <div className="mb-6">
                                        <p className="text-sm font-medium mb-2">
                                            Quantity
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    setQuantity((q) =>
                                                        Math.max(1, q - 1),
                                                    )
                                                }
                                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                                            >
                                                −
                                            </button>
                                            <div className="flex-1 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-semibold">
                                                {quantity}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setQuantity((q) => q + 1)
                                                }
                                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isAnyOOS && (
                                    <button
                                        disabled={!selectedVariant || isAdding}
                                        onClick={handleAddToCart}
                                        className="w-full h-12 font-semibold rounded-xl transition flex items-center justify-center gap-2 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isAdding ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "Add to Cart"
                                        )}
                                    </button>
                                )}

                                {isAnyOOS && (
                                    <button
                                        onClick={() =>
                                            setShowVariantNotify(true)
                                        }
                                        className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2 border-blue-200 text-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Bell size={15} />
                                        Notify Me When Back in Stock
                                        {notifyVariantLabel && (
                                            <span className="text-xs font-normal opacity-75">
                                                ({notifyVariantLabel})
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (fullProduct.slug)
                                            router.push(
                                                `/prebuilt-products/${fullProduct.slug}`,
                                            );
                                        onClose();
                                    }}
                                    className="w-full text-sm mt-3 text-gray-500 hover:text-black"
                                >
                                    View full details →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showVariantNotify && (
                <VariantNotifyModal
                    product={fullProduct}
                    variantId={notifyVariantId}
                    variantLabel={notifyVariantLabel}
                    onClose={() => setShowVariantNotify(false)}
                />
            )}
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Product Card  (matches PrinterCard layout + image zoom)
───────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: any }) {
    const { data: session } = useSession();

    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];

    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishLoading, setIsWishLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const isOutOfStock = product.inStock === false;

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
        if (isWishLoading) return;
        setIsWishLoading(true);
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
                description: `${product.name} has been ${was ? "removed from" : "added to"} your wishlist.`,
            });
        } catch {
            setIsFavorite(was);
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsWishLoading(false);
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
    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    const uniqueColors: { hex: string; name: string }[] = Array.from(
        new Map<string, { hex: string; name: string }>(
            product.variants
                ?.filter((v: any) => v.colorHex)
                .map((v: any) => [
                    v.colorHex,
                    { hex: v.colorHex, name: v.colorName },
                ]),
        ).values(),
    );

    return (
        <>
            <div className="group bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                <Link
                    href={`/prebuilt-products/${product.slug}`}
                    className="flex flex-col h-full"
                >
                    {/* IMAGE — square, zoom on hover */}
                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                        {mainImage && (
                            <img
                                src={getCardImageUrl(mainImage)}
                                alt={product.name}
                                className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                                loading="eager"
                            />
                        )}
                        {isOutOfStock && (
                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full z-[1]">
                                Out of Stock
                            </div>
                        )}
                        {product.highlighted && (
                            <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 z-[1]">
                                <span
                                    className="inline-block rounded-full px-1.5 py-0.5 sm:px-3 sm:py-1 text-[7px] sm:text-[10px] font-medium border-2 bg-white text-[#372AAC]"
                                    style={{ borderColor: "#A3B3FF" }}
                                >
                                    Trending Now
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleToggleWishlist}
                            disabled={isWishLoading}
                            className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center z-[1]"
                        >
                            {isWishLoading ? (
                                <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-3 h-3 sm:w-5 sm:h-5 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                            )}
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="px-2.5 pt-2 pb-0 sm:px-5 sm:pt-4 sm:pb-0">
                        {product.category && (
                            <span className="inline-block mb-1 sm:mb-2 px-1.5 py-px sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                                {product.category}
                            </span>
                        )}

                        <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                            {product.name}
                        </h3>

                        {product.shortDescription && (
                            <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                                {product.shortDescription}
                            </p>
                        )}

                        <div className="hidden sm:block text-[13px] text-gray-700 mt-1.5 space-y-0.5">
                            <div>
                                <strong>Sizes:</strong> {sizeString}
                            </div>
                            {uniqueColors.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <strong>Colours:</strong>
                                    <span className="inline-flex items-center gap-1">
                                        {uniqueColors
                                            .slice(0, 5)
                                            .map((c, i) => (
                                                <span
                                                    key={i}
                                                    title={c.name}
                                                    className="inline-block w-3.5 h-3.5 rounded-full border border-gray-300"
                                                    style={{
                                                        backgroundColor: c.hex,
                                                    }}
                                                />
                                            ))}
                                        {uniqueColors.length > 5 && (
                                            <span className="text-[10px] text-gray-400">
                                                +{uniqueColors.length - 5}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                {/* FOOTER — outside Link */}
                <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                    <hr className="hidden sm:block my-3" />

                    <div className="flex items-baseline gap-3 sm:gap-0 sm:justify-start mt-1">
                        <span className="text-[13px] sm:text-[16px] font-bold text-[#101828]">
                            ₹{variant?.price?.toLocaleString("en-IN")}
                        </span>
                        {variant?.originalPrice > variant?.price && (
                            <span className="sm:ml-3 text-[10px] sm:text-[14px] font-normal line-through text-[#99A1AF]">
                                ₹
                                {variant?.originalPrice?.toLocaleString(
                                    "en-IN",
                                )}
                            </span>
                        )}
                        {discount > 0 && (
                            <span className="hidden sm:inline-flex sm:ml-2 h-[22px] px-2 items-center rounded-full text-[12px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-2.5 mb-0.5 sm:mb-2.5 sm:justify-start">
                        <p className="text-[9px] sm:text-[13px] text-[#667085]">
                            (incl. GST)
                        </p>
                        {discount > 0 && (
                            <span className="sm:hidden h-[14px] px-1 inline-flex items-center rounded-full text-[8px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {!isOutOfStock && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                        >
                            Select Variants
                        </button>
                    )}

                    {isOutOfStock && (
                        <button
                            onClick={() => setShowNotifyModal(true)}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center gap-1.5 border-2 border-blue-200 text-blue-500 hover:text-blue-700"
                        >
                            <Bell
                                size={12}
                                className="sm:w-[14px] sm:h-[14px]"
                            />
                            Notify Me
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

/* ─────────────────────────────────────────────────────────
   Grid  (2 cols mobile → 3 tablet → 4 desktop)
───────────────────────────────────────────────────────── */
export default function PrebuiltProductGrid({ products = [] }: Props) {
    const router = useRouter();
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const checkBodyLock = () => {
            const bodyOverflow = window.getComputedStyle(
                document.body,
            ).overflow;
            const htmlOverflow = window.getComputedStyle(
                document.documentElement,
            ).overflow;
            setNavOpen(bodyOverflow === "hidden" || htmlOverflow === "hidden");
        };
        const observer = new MutationObserver(checkBodyLock);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["style", "class"],
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["style", "class"],
        });
        return () => observer.disconnect();
    }, []);

    if (!Array.isArray(products)) return null;
    const categories = Array.from(new Set(products.map((p) => p.category)));

    return (
        <div className="space-y-20">
            {categories.map((category) => {
                const categoryProducts = products.filter(
                    (p) => p.category === category,
                );
                const previewProducts = categoryProducts.slice(0, 8);
                const Header = () => (
                    <div className="flex items-end justify-between border-b border-gray-100 pb-5">
                        <div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                                {category}
                            </h2>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                                {categoryProducts.length} PRODUCTS IN THIS
                                COLLECTION
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                router.push(
                                    `/prebuilt-products/category/${category.toLowerCase().replace(/\s+/g, "-")}`,
                                )
                            }
                            className="group flex items-center gap-1 text-sm font-bold text-blue-600 transition-all hover:gap-2"
                        >
                            View All <span className="text-lg">›</span>
                        </button>
                    </div>
                );
                return (
                    <section key={category} className="space-y-8">
                        <div
                            className="lg:hidden sticky top-0 bg-white -mx-4 px-4 py-4"
                            style={{ zIndex: navOpen ? 1 : 50 }}
                        >
                            <Header />
                        </div>
                        <div className="hidden lg:block">
                            <Header />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                            {previewProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
