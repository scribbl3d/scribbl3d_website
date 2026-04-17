"use client";

import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ProductSkeleton } from "@/components/shared/ProductSkeleton";
import { useAuthToast } from "@/hooks/useAuthToast";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";
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

interface WishlistItem {
    productId: string;
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
    const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const { data: session } = useSession();
    const { showAuthToast } = useAuthToast();

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
    }, [searchTerm, sortBy, apiCategory]);

    useEffect(() => {
        async function fetchWishlistItems() {
            if (session) {
                try {
                    const response = await fetch("/api/wishlist");
                    if (response.ok) {
                        const json = await response.json();
                        const items: WishlistItem[] = json.items ?? [];

                        setWishlistItems(
                            new Set(items.map((item) => item.productId))
                        );
                    }
                } catch (error) {
                }
            }
        }
        fetchWishlistItems();
    }, [session]);

    const handleWishlistToggle = async (productId: string) => {
        if (!session) {
            showAuthToast("add items to your wishlist");
            return;
        }

        try {
            const method = wishlistItems.has(productId) ? "DELETE" : "POST";
            const response = await fetch("/api/wishlist", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, isPrebuilt: false }),
            });

            if (!response.ok) throw new Error("Failed to update wishlist");

            setWishlistItems((prev) => {
                const newSet = new Set(prev);
                method === "DELETE"
                    ? newSet.delete(productId)
                    : newSet.add(productId);
                return newSet;
            });

            toast({
                title:
                    method === "DELETE"
                        ? "Removed from Wishlist"
                        : "Added to Wishlist",
                description: `Product has been ${
                    method === "DELETE" ? "removed from" : "added to"
                } your wishlist.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        }
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
                                    <ProductTileA
                                        {...product}
                                        isInWishlist={wishlistItems.has(
                                            product.id
                                        )}
                                        onWishlistToggle={() =>
                                            handleWishlistToggle(product.id)
                                        }
                                    />
                                ) : (
                                    <ProductTileB
                                        {...product}
                                        isInWishlist={wishlistItems.has(
                                            product.id
                                        )}
                                        onWishlistToggle={() =>
                                            handleWishlistToggle(product.id)
                                        }
                                    />
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
