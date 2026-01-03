"use client";

import EnhancedProductTile from "@/components/enhanced-product-tile";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useInView } from "react-intersection-observer";

interface ProductGridProps {
    title: string | ReactNode;
    viewAllLink: string;
    products: any; // backend can send array or wrapped object
    isLoading: boolean;
    error: string | null;
    className?: string;
    titleClassName?: string;
    totalCount?: number | null;
}

function ProductGrid({
    title,
    viewAllLink,
    products,
    isLoading,
    error,
    className = "",
    titleClassName = "",
    totalCount = null,
}: ProductGridProps) {
    /** 🟢 Normalize products to array */
    const safeProducts = Array.isArray(products)
        ? products
        : Array.isArray(products?.products)
          ? products.products
          : [];

    const safeTotal = totalCount ?? safeProducts.length;

    const { ref } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });
    console.log("🧨 EnhancedProductTile id:", products.id);

    return (
        <section
            className={`w-full h-full pt-4 sm:pt-8 pb-8 sm:pb-16 max-w-[100vw] overflow-x-hidden ${className}`}
        >
            <div className="container mx-auto px-4 sm:px-6 h-full max-w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    {typeof title === "string" ? (
                        <div className="flex items-center gap-2">
                            <h2
                                className={`text-[#333] font-lato text-2xl sm:text-3xl font-bold leading-[120%] pl-2 sm:pl-[60px] ${titleClassName}`}
                            >
                                {title}
                            </h2>
                            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                {safeTotal}{" "}
                                {safeTotal === 1 ? "Product" : "Products"}
                            </span>
                        </div>
                    ) : (
                        title
                    )}

                    <Link
                        href={viewAllLink}
                        className="text-blue-600 hover:text-blue-800 pr-2 sm:pr-[60px] text-sm sm:text-base active:scale-95 transition-transform"
                    >
                        View All
                    </Link>
                </div>

                {/* Grid */}
                <div className="h-full -mx-4 px-4 overflow-y-auto overscroll-y-contain">
                    <ErrorBoundary fallback={<div>Something went wrong</div>}>
                        <div
                            ref={ref}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 place-items-center"
                        >
                            {/* Loading */}
                            {isLoading &&
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full max-w-[300px] aspect-[3/4] rounded-lg overflow-hidden"
                                    >
                                        <Skeleton className="w-full h-full" />
                                    </div>
                                ))}

                            {/* Error */}
                            {!isLoading && error && (
                                <div className="col-span-full text-center py-8 px-4 rounded-lg bg-red-50 text-red-600">
                                    {error}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="block mx-auto mt-2 text-sm underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}

                            {/* Products */}
                            {!isLoading &&
                                !error &&
                                safeProducts.map((product: any) => (
                                    <div
                                        key={product.id}
                                        className="w-full max-w-[300px] flex justify-center transition-transform active:scale-[0.98]"
                                    >
                                        <EnhancedProductTile
                                            id={product.id} // ✅ Prisma cuid
                                            name={product.name}
                                            price={product.price}
                                            originalPrice={
                                                product.originalPrice
                                            }
                                            images={product.images}
                                            description={product.description}
                                            isPrebuilt={true}
                                            isCustomizable={
                                                product.isCustomizable ?? false
                                            }
                                            availableSizes={
                                                product.availableSizes ?? []
                                            }
                                        />
                                    </div>
                                ))}
                        </div>
                    </ErrorBoundary>
                </div>
            </div>
        </section>
    );
}

export default ProductGrid;
