"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { clsx, type ClassValue } from "clsx";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ProductTileA, ProductTileB } from "./ProductTiles";

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    images: string[];
    color: string;
    category: string;
    tileType: string;
}

interface CategoryProps {
    searchTerm: string;
    sortBy: { field: string; order: "asc" | "desc" };
    categoryName: string;
    apiCategory: string;
    limit?: number;
    showViewAll?: boolean;
    viewAllHref?: string;
    isStandalone?: boolean;
}

// Loading skeleton for products
const ProductSkeleton = () => (
    <div className="w-full">
        <div className="w-[300px] h-[470px] bg-white rounded-lg overflow-hidden mx-auto">
            <Skeleton className="w-full h-[340px]" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
);

const CategoryBase: React.FC<CategoryProps> = ({
    searchTerm,
    sortBy,
    categoryName,
    apiCategory,
    limit,
    showViewAll,
    viewAllHref,
    isStandalone,
}) => {
    const [products, setProducts] = useState<Product[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();

    useEffect(() => {
        async function fetchProducts() {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/products?category=${apiCategory}&search=${searchTerm}&sortBy=${sortBy.field}&order=${sortBy.order}${
                        limit ? `&limit=${limit}` : ""
                    }`
                );

                if (!response.ok) throw new Error("Failed to fetch products");

                const data = await response.json();

                // ⭐ FIX: extract product array from paginated response
                const productArray = Array.isArray(data)
                    ? data
                    : data.products || [];

                setProducts(productArray);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    title: "Error",
                    description: "Failed to load products. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, [searchTerm, sortBy, apiCategory, limit]);

    const cn = (...inputs: ClassValue[]) => {
        return twMerge(clsx(inputs));
    };

    return (
        <section
            id={categoryName}
            className={cn(
                "flex flex-col items-center pb-8 sm:pb-12 md:pb-16",
                isStandalone ? "pt-24 sm:pt-28 md:pt-32" : "pt-8"
            )}
        >
            {isStandalone && (
                <div className="w-full max-w-[1400px] px-4 mb-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
                    >
                        ← Back to Filaments
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between w-full max-w-[1400px] px-4 mb-8 sm:mb-12">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-lato">
                    {categoryName}
                </h2>

                {showViewAll && viewAllHref && (
                    <a
                        href={viewAllHref}
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        View All →
                    </a>
                )}
            </div>

            <div className="w-full max-w-[1400px] px-4 mx-auto">
                {isLoading ? (
                    // Loading state with skeletons
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {[...Array(8)].map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    // Product grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="flex justify-center"
                            >
                                {product.tileType === "A" ? (
                                    <ProductTileA {...product} />
                                ) : (
                                    <ProductTileB {...product} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategoryBase;
