"use client";

import Loader from "@/components/Loader";
import PrebuiltHero from "@/components/prebuilt-products/PrebuiltHero";
import PrebuiltProductGrid from "@/components/prebuilt-products/PrebuiltProductGrid";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useEffect, useState } from "react";

export default function PrebuiltPageClient() {
    const isInitialLoading = useAutoImageLoader();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/prebuilt-products");
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <main className="w-full min-h-screen bg-gray-50">
            {isInitialLoading && <Loader />}

            <div
                className="min-h-screen transition-opacity duration-700"
                style={{
                    opacity: isInitialLoading ? 0 : 1,
                    visibility: isInitialLoading ? "hidden" : "visible",
                }}
            >
                <PrebuiltHero />

                <div className="container mx-auto px-4 pt-6 pb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                            <p className="mt-4 text-gray-600">
                                Loading Prebuilt Products...
                            </p>
                        </div>
                    ) : (
                        <PrebuiltProductGrid products={products} />
                    )}
                </div>
            </div>
        </main>
    );
}
