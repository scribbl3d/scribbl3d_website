"use client";

import Loader from "@/components/Loader";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Bell, Check, ChevronLeft, Heart, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    Cosplay:
        "High-detail cosplay props and accessories crafted for accuracy, durability, and convention-ready performance.",
    Figurine:
        "Premium 3D printed figurines designed with sharp detailing and smooth finishes — perfect for collectors and enthusiasts.",
    "Home Essentials":
        "Smart, minimal, and practical 3D printed products designed to simplify and elevate everyday living.",
    "Household Utilities":
        "Functional and durable utility products engineered to solve real household problems efficiently.",
    Keychains:
        "Compact, creative, and customizable keychains — ideal for gifting, branding, and everyday carry.",
    Kits: "Curated DIY and learning kits designed to combine creativity, engineering, and hands-on exploration.",
    Lamps: "Aesthetic 3D printed lamps that blend modern design with warm, ambient lighting.",
    "New Launch":
        "Discover our latest product innovations — freshly designed and now available.",
    Personalised:
        "Custom-designed 3D printed products tailored to your name, brand, or unique idea.",
    Statues:
        "Elegant decorative statues crafted with precision detailing and premium surface finish.",
    "The Latest":
        "Trending and recently added products — stay updated with what's new at Scribbl3D.",
    Utilities:
        "Purpose-built 3D printed tools and accessories designed for functionality and long-term use.",
    "Wall Decor":
        "Modern 3D printed wall décor pieces that add depth, texture, and character to your space.",
};

/* ── Notify Me Modal (whole product OOS) ── */
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
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                            <Bell size={16} className="text-orange-500" />
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
                            <p className="text-sm text-gray-500">
                                We'll notify you on{" "}
                                <span className="font-semibold text-gray-700">
                                    {email}
                                </span>{" "}
                                and{" "}
                                <span className="font-semibold text-gray-700">
                                    {phone}
                                </span>
                                .
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
                            <p className="text-xs text-gray-500">
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
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
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

/* ── Variant-level Notify Me Modal ── */
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
                            <p className="text-sm text-gray-500">
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
                            <p className="text-xs text-gray-500">
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
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
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

/* ── Variant Modal with full OOS logic ── */
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
            return {
                ...c,
                isOOS:
                    allForColour.length > 0 &&
                    allForColour.every((v) => v.inStock === false),
            };
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
            toast({
                title: "Added to cart",
                description: `${fullProduct.name} × ${quantity} added.`,
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

                                {/* Colours */}
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
                                                    onClick={() => {
                                                        setSelectedColor(
                                                            c.name,
                                                        );
                                                        setSelectedSize(null);
                                                    }}
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

                                {/* Sizes */}
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
                                                        {sizeOOS &&
                                                            !isColourOOS && (
                                                                <span className="ml-1 text-[9px] text-red-400"></span>
                                                            )}
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
                                        className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2  border-blue-200 text-blue-500 hover:text-blue-700  transition-all flex items-center justify-center gap-2"
                                    >
                                        <Bell size={15} /> Notify Me When Back
                                        in Stock
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

/* ── Category Listing Page ── */
export default function CategoryListingPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = (params.category as string).replace(/-/g, " ");
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/prebuilt-products?category=${params.category}`)
            .then((r) => r.json())
            .then((data) => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [params.category]);

    if (loading) return <Loader />;

    const categoryDescription =
        CATEGORY_DESCRIPTIONS[categoryName] ||
        `Discover our collection of ${categoryName.toLowerCase()} and interactive 3D printed models.`;

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-6 pt-24">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to All Products
                </button>
                <div
                    className="w-full rounded-[24px] p-10 lg:p-16 text-white mb-10 shadow-xl"
                    style={{
                        background: `linear-gradient(135deg, #372AAC 0%, #1D4ED8 50%, #4A5565 100%)`,
                        minHeight: "262.5px",
                    }}
                >
                    <h1 className="text-[48px] font-black leading-tight mb-4 tracking-tight">
                        {categoryName?.charAt(0).toUpperCase() +
                            categoryName?.slice(1)}
                    </h1>
                    <p className="max-w-2xl text-[18px] font-normal opacity-90 leading-[29.25px] mb-8">
                        {categoryDescription}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2 border border-white/10">
                        <span className="text-sm font-black">
                            {products.length}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-widest">
                            Products
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 border-b border-gray-100 pb-6">
                    <span className="text-sm font-medium text-gray-500">
                        Showing{" "}
                        <span className="text-black font-bold">
                            {products.length}
                        </span>{" "}
                        products
                    </span>
                    <select className="appearance-none border border-gray-200 rounded-xl px-6 py-3 pr-10 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm">
                        <option>Sort by: Popularity</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products.map((product) => (
                        <CategoryProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

/* ── Category Product Card ── */
function CategoryProductCard({ product }: { product: any }) {
    const { data: session } = useSession();
    const router = useRouter();
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // ← VariantModal
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
        ).values(),
    ) as any;
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
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden w-full h-full transition-all hover:shadow-lg hover:border-gray-200 cursor-pointer"
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
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-400 shadow-sm backdrop-blur-md hover:text-red-500"
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
                            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-medium text-[#372AAC] border-2 border-[#A3B3FF] bg-white">
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
                    {product.inStock === false && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotifyModal(true);
                            }}
                            className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2  border-blue-200 text-blue-500 hover:text-blue-700  transition-all flex items-center justify-center gap-2"
                        >
                            <Bell size={13} /> Notify Me When Back in Stock
                        </button>
                    )}
                </div>
            </div>

            {/* VariantModal — was missing, now renders with full OOS logic */}
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
