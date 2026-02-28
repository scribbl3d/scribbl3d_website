"use client";

import { toast } from "@/components/ui/use-toast";
import { Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
    products: any[];
}

export default function PrebuiltProductGrid({ products = [] }: Props) {
    const router = useRouter();

    // Safety check to prevent "map is not a function" error
    if (!Array.isArray(products)) return null;

    const categories = Array.from(new Set(products.map((p) => p.category)));

    return (
        <div className="space-y-20">
            {categories.map((category) => {
                const categoryProducts = products.filter(
                    (p) => p.category === category,
                );
                // Desktop: Show 8 products (2 rows of 4)
                // Mobile: Show only 5 products
                const previewProducts = categoryProducts.slice(0, 8);
                const mobileProducts = categoryProducts.slice(0, 5);
                const shouldShowViewAll = categoryProducts.length > 5;

                return (
                    <section key={category} className="space-y-8">
                        {/* Sticky Header - Only on Mobile */}
                        <div className="lg:hidden sticky top-0 z-50 bg-white -mx-4 px-4 py-4">
                            <div className="flex items-end justify-between border-b border-gray-100 pb-5">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                                        {category}
                                    </h2>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                                        {categoryProducts.length} PRODUCTS IN
                                        THIS COLLECTION
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
                                    View All
                                    <span className="text-lg">›</span>
                                </button>
                            </div>
                        </div>

                        {/* Regular Header - Only on Desktop */}
                        <div className="hidden lg:block">
                            <div className="flex items-end justify-between border-b border-gray-100 pb-5">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                                        {category}
                                    </h2>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                                        {categoryProducts.length} PRODUCTS IN
                                        THIS COLLECTION
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
                                    View All
                                    <span className="text-lg">›</span>
                                </button>
                            </div>
                        </div>

                        {/* Grid - Desktop shows 8 products, Mobile shows 5 */}
                        {/* Mobile: Show 5 products */}
                        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                            {mobileProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>

                        {/* Desktop: Show 8 products */}
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

function ProductCard({ product }: { product: any }) {
    const { data: session } = useSession();
    const router = useRouter();

    // Image and Variant Logic
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];

    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Wishlist check on mount
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
        } catch (err) {
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
        if (product.slug) {
            router.push(`/prebuilt-products/${product.slug}`);
        }
    };

    const discount = variant?.originalPrice
        ? Math.round(
              ((variant.originalPrice - variant.price) /
                  variant.originalPrice) *
                  100,
          )
        : 0;

    // Logic for Sizes
    const sizes = Array.from(
        new Set(product.variants?.map((v: any) => v.sizeName).filter(Boolean)),
    );
    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    // ✅ UNIQUE COLORS LOGIC: Extracts hex and name
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
        <div
            onClick={handleCardClick}
            className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden w-full cursor-pointer transition-all hover:shadow-lg hover:border-gray-200"
        >
            {/* Container for Image */}
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

            {/* Content Section */}
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

                {/* Sizes and Colors Section */}
                <div className="mb-4 pb-4 border-b border-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-[#6A7282]">
                            Available Sizes:
                        </span>
                        <span className="text-xs font-medium text-[#364153]">
                            {sizeString}
                        </span>
                    </div>

                    {/* ✅ UPDATED COLOUR OPTIONS (Concentric Circles) */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-[#6A7282]">
                            Colours:
                        </span>

                        <div className="flex items-center gap-2">
                            {uniqueColors.length > 0 ? (
                                uniqueColors
                                    .slice(0, 5)
                                    .map((color: any, index) => {
                                        const isActive = index === 0;

                                        return (
                                            <div
                                                key={index}
                                                title={color.name}
                                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all
              ${isActive ? "border-black" : "border-gray-300"}
            `}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            color.hex,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })
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

                {/* Pricing Area */}
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
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-[10px] bg-[#1E1E1E] py-2.5 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.97]"
                >
                    Select Variants
                </button>
            </div>
        </div>
    );
}
