"use client";

import Loader from "@/components/Loader";
import PrebuiltHero from "@/components/prebuilt-products/PrebuiltHero";
import PrebuiltProductGrid from "@/components/prebuilt-products/PrebuiltProductGrid";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useEffect, useState } from "react";

interface Props {
    initialProducts?: any[];
}

export default function PrebuiltPageClient({
    initialProducts = [],
}: Props) {
    const isInitialLoading = useAutoImageLoader();
    const [loading, setLoading] = useState(initialProducts.length === 0);
    const [products, setProducts] = useState(initialProducts);

    useEffect(() => {
        if (initialProducts.length > 0) return;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    {/* Breadcrumb Navigation */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
                        <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">3D Printed Products</span>
                    </nav>

                    {/* SEO H1 - Hidden visually but present for crawlers */}
                    <h1 className="sr-only">3D Printed Products Online India - Custom Keychains, Lamps, Decor, Figurines</h1>

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
