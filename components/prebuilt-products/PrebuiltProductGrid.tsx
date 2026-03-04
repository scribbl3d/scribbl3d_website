"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Check, Heart, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
    products: any[];
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
                prebuiltProductId: product.id,
                prebuiltVariantId: selectedVariant.id,
                quantity,
            });
            const label = [selectedColor, selectedSize]
                .filter(Boolean)
                .join(", ");
            toast({
                title: "Added to cart",
                description: `${product.name}${label ? ` (${label})` : ""} × ${quantity} added.`,
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
                {/* Header */}
                <div className="flex gap-4 p-5 relative">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images?.[0]?.url && (
                            <Image
                                src={
                                    product.images.find((i: any) => i.isMain)
                                        ?.url ?? product.images[0].url
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
                    {/* Price */}
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

                    {/* Colors */}
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
                                            backgroundColor: c.hex ?? "#E5E7EB",
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

                    {/* Sizes */}
                    {validSizes.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {validSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
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

                    {/* Quantity */}
                    <div className="mb-6">
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
                            <div className="flex-1 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-semibold">
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
                    <button
                        disabled={!selectedVariant || isAdding}
                        onClick={handleAddToCart}
                        className="w-full h-12 bg-black text-white font-semibold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {isAdding ? (
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

/* ─────────────────────────────────────────────────────────
   Product Card
───────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: any }) {
    const { data: session } = useSession();
    const router = useRouter();

    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];

    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!session || !product?.id) return;
        async function checkWishlist() {
            try {
                const res = await fetch(
                    `/api/wishlist/check?prebuiltProductId=${product.id}`,
                );
                const data = await res.json();
                setIsFavorite(data.isInWishlist);
            } catch (err) {
                console.error("Wishlist check failed", err);
            }
        }
        checkWishlist();
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
        const wasInWishlist = isFavorite;
        setIsFavorite(!wasInWishlist);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prebuiltProductId: product.id }),
            });
            toast({
                title: wasInWishlist
                    ? "Removed from wishlist"
                    : "Added to wishlist",
                description: `${product.name} has been ${wasInWishlist ? "removed from" : "added to"} your wishlist.`,
            });
        } catch {
            setIsFavorite(wasInWishlist);
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleCardClick = () => {
        if (product.slug) router.push(`/prebuilt-products/${product.slug}`);
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

    const uniqueColors = Array.from(
        new Map(
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
            <div
                onClick={handleCardClick}
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden w-full cursor-pointer transition-all hover:shadow-lg hover:border-gray-200"
            >
                {/* Image */}
                <div
                    className="relative overflow-hidden bg-[#f9f9f9]"
                    style={{ aspectRatio: "1 / 0.9" }}
                >
                    {mainImage && (
                        <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWishlist(e);
                        }}
                        disabled={isWishlistLoading}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-400 shadow-sm backdrop-blur-md transition-colors hover:text-red-500 disabled:opacity-70"
                    >
                        {isWishlistLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                            <Heart
                                size={20}
                                className={`transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {product.highlighted && (
                        <div className="mb-3">
                            <span
                                className="inline-block rounded-full px-3 py-1 text-[10px] font-medium border-2 bg-white text-[#372AAC]"
                                style={{ borderColor: "#A3B3FF" }}
                            >
                                Trending Now
                            </span>
                        </div>
                    )}

                    <h3 className="text-base font-medium text-[#101828] leading-snug mb-2">
                        {product.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#4A5565] line-clamp-2 mb-4 flex-1">
                        {product.shortDescription}
                    </p>

                    {/* Sizes and Colors */}
                    <div className="mb-4 pb-4 border-b border-gray-200 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-normal text-[#6A7282]">
                                Available Sizes:
                            </span>
                            <span className="text-xs font-medium text-[#364153]">
                                {sizeString}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-normal text-[#6A7282]">
                                Colours:
                            </span>
                            <div className="flex items-center gap-2">
                                {uniqueColors.length > 0 ? (
                                    uniqueColors
                                        .slice(0, 5)
                                        .map((color: any, index) => (
                                            <div
                                                key={index}
                                                title={color.name}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${index === 0 ? "border-black" : "border-gray-300"}`}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            color.hex,
                                                    }}
                                                />
                                            </div>
                                        ))
                                ) : (
                                    <span className="text-xs font-normal text-[#364153]">
                                        Standard
                                    </span>
                                )}
                                {uniqueColors.length > 5 && (
                                    <span className="text-[10px] text-gray-400">
                                        +{uniqueColors.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-normal text-[#6A7282]">
                                Starts at
                            </span>
                            <span className="text-base font-semibold text-[#1a1a1a]">
                                ₹{variant?.price?.toLocaleString()}
                            </span>
                            {discount > 0 && (
                                <span className="text-xs text-gray-400 line-through font-normal">
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
                    <span className="text-[10px] text-gray-400 font-normal mb-4">
                        (incl. GST)
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(true);
                        }}
                        className="w-full rounded-[10px] bg-[#1E1E1E] py-2.5 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.97]"
                    >
                        Select Variants
                    </button>
                </div>
            </div>

            {showModal && (
                <VariantModal
                    product={product}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Grid
───────────────────────────────────────────────────────── */
export default function PrebuiltProductGrid({ products = [] }: Props) {
    const router = useRouter();

    // Detect when navbar opens by watching body overflow:hidden (scroll lock).
    // When nav opens → drop z-index so navbar renders on top.
    // When nav closes → restore z-50 so sticky works above product cards.
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
                const mobileProducts = categoryProducts.slice(0, 5);

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
                        {/* z-50 when nav closed (sticky works) → z-[1] when nav open (navbar on top) */}
                        <div
                            className="lg:hidden sticky top-0 bg-white -mx-4 px-4 py-4"
                            style={{ zIndex: navOpen ? 1 : 50 }}
                        >
                            <Header />
                        </div>

                        {/* Desktop header — not sticky, no z-index needed */}
                        <div className="hidden lg:block">
                            <Header />
                        </div>

                        {/* Mobile grid — 5 products */}
                        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                            {mobileProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>

                        {/* Desktop grid — 8 products */}
                        <div className="hidden lg:grid grid-cols-4 gap-x-8 gap-y-12">
                            {previewProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
