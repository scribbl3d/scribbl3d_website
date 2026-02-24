"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
                                            `/prebuilt-products/${category.toLowerCase().replace(/\s+/g, "-")}`,
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
                                            `/prebuilt-products/${category.toLowerCase().replace(/\s+/g, "-")}`,
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
                        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Mobile: Show 5 products */}
                            <div className="lg:hidden col-span-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                                {mobileProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>

                            {/* Desktop: Show 8 products */}
                            <div className="lg:grid col-span-full grid grid-cols-4 gap-x-8 gap-y-12">
                                {previewProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Mobile View All Link */}
                        {shouldShowViewAll && (
                            <div className="lg:hidden flex justify-center">
                                <button
                                    onClick={() =>
                                        router.push(
                                            `/prebuilt-products/${category.toLowerCase().replace(/\s+/g, "-")}`,
                                        )
                                    }
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View all {categoryProducts.length} products
                                    →
                                </button>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

function ProductCard({ product }: { product: any }) {
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];

    const discount = variant?.originalPrice
        ? Math.round(
              ((variant.originalPrice - variant.price) /
                  variant.originalPrice) *
                  100,
          )
        : 0;

    // Get unique sizes and colors from all variants
    const sizes = Array.from(
        new Set(product.variants?.map((v: any) => v.sizeName).filter(Boolean)),
    );
    const colors = Array.from(
        new Set(product.variants?.map((v: any) => v.colorName).filter(Boolean)),
    );

    // Format sizes and colors as comma-separated strings
    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    const colorString =
        colors.length > 0
            ? colors.slice(0, 2).join(", ") +
              (colors.length > 2 ? " & more" : "")
            : "Standard";

    return (
        <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden w-full">
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
                <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-400 shadow-sm backdrop-blur-md transition-colors hover:text-red-500">
                    <Heart size={20} />
                </button>
            </div>

            {/* Content Section - 16px padding */}
            <div className="p-4 flex flex-col flex-1">
                {/* Customizable Badge */}
                <div className="mb-3">
                    <span
                        className={`inline-block rounded-full px-3 py-1 text-[10px] font-medium ${
                            product.isCustomizable
                                ? "border-2 bg-white text-[#372AAC]"
                                : "border border-gray-300 bg-white text-gray-600"
                        }`}
                        style={
                            product.isCustomizable
                                ? { borderColor: "#A3B3FF" }
                                : {}
                        }
                    >
                        {product.isCustomizable
                            ? "Customisable"
                            : "Not Customisable"}
                    </span>
                </div>

                {/* Product Name - 16px, weight 500 */}
                <h3 className="text-base font-medium text-[#101828] leading-snug mb-2">
                    {product.name}
                </h3>

                {/* Short Description - 14px, weight 400, #4A5565 */}
                <p className="text-sm leading-relaxed text-[#4A5565] line-clamp-2 mb-4 flex-1">
                    {product.shortDescription}
                </p>

                {/* Sizes and Colors Section */}
                <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                    {/* Available Sizes - 12px, weight 400 */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-[#6A7282]">
                            Available Sizes:
                        </span>
                        <span className="text-xs font-normal text-[#364153]">
                            {sizeString}
                        </span>
                    </div>

                    {/* Colour Options - 12px, weight 400 */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-[#6A7282]">
                            Colour Options:
                        </span>
                        <span className="text-xs font-normal text-[#364153]">
                            {colorString}
                        </span>
                    </div>
                </div>

                {/* Pricing Area */}
                <div className="flex items-center justify-between mb-3">
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

                {/* Add to Cart Button - 40px height, 10px radius */}
                <button className="w-full rounded-[10px] bg-[#1E1E1E] py-2.5 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.97]">
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
