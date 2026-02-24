"use client";

import Loader from "@/components/Loader";
import { ChevronLeft, Heart } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CategoryListingPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = (params.category as string).replace(/-/g, " ");

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const res = await fetch(
                    `/api/prebuilt-products-new?category=${params.category}`,
                );
                const data = await res.json();
                // Safety: Ensure data is an array to fix ".map is not a function"
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryProducts();
    }, [params.category]);

    if (loading) return <Loader />;

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-6">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to All Products
                </button>

                {/* HERO SECTION - Matching Figma Specs */}
                <div
                    className="w-full rounded-[24px] p-10 lg:p-16 text-white mb-10 shadow-xl"
                    style={{
                        background: `linear-gradient(135deg, #372AAC 0%, #1D4ED8 50%, #4A5565 100%)`,
                        minHeight: "262.5px",
                    }}
                >
                    <h1 className="text-[48px] font-black leading-tight mb-4 tracking-tight">
                        {categoryName}
                    </h1>
                    <p className="max-w-2xl text-[18px] font-normal opacity-90 leading-[29.25px] mb-8">
                        Discover our collection of {categoryName.toLowerCase()}{" "}
                        and interactive 3D printed models, perfect for display
                        or as unique fidget toys.
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

                {/* TOOLBAR */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 border-b border-gray-100 pb-6">
                    <span className="text-sm font-medium text-gray-500">
                        Showing{" "}
                        <span className="text-black font-bold">
                            {products.length}
                        </span>{" "}
                        products
                    </span>
                    <div className="flex items-center gap-4">
                        <select className="appearance-none border border-gray-200 rounded-xl px-6 py-3 pr-10 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm">
                            <option>Sort by: Popularity</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* PRODUCT GRID - 4 Columns */}
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

function CategoryProductCard({ product }: { product: any }) {
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
