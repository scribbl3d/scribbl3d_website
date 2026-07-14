"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface SimilarFilamentsCarouselProps {
    currentFilamentId: string;
    material: string;
}

type Filament = {
    id: string;
    slug: string;
    name: string;
    colorName: string;
    hexCode: string;
    material: string;
    finishType: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images: string[];
    shortDescription?: string;
    inStock?: boolean;
};

export default function SimilarFilamentsCarousel({
    currentFilamentId,
    material,
}: SimilarFilamentsCarouselProps) {
    const [filaments, setFilaments] = useState<Filament[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchSimilarFilaments();
    }, [currentFilamentId, material]);

    const fetchSimilarFilaments = async () => {
        try {
            const res = await fetch(
                `/api/filaments/similar?material=${material}&exclude=${currentFilamentId}`
            );
            const data = await res.json();
            setFilaments(data.filaments || []);
        } catch (err) {
            console.error("Error fetching similar filaments:", err);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (dir: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({
            left: dir === "left" ? -cardWidth : cardWidth,
            behavior: "smooth",
        });
    };

    if (loading || filaments.length === 0) return null;

    return (
        <div className="py-4 sm:py-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">
                Similar Filaments
            </h2>
            <p className="text-sm text-gray-500 mb-4">
                Other {material} filaments you might like
            </p>

            <div className="relative">
                <button
                    onClick={() => scroll("left")}
                    className="hidden sm:flex absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow items-center justify-center hover:bg-gray-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="hidden sm:flex absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow items-center justify-center hover:bg-gray-100"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2 sm:pb-4"
                >
                    {filaments.map((filament) => (
                        <div
                            key={filament.id}
                            className="snap-start flex-shrink-0 w-[48%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
                        >
                            <Link href={`/filament/${filament.slug || filament.id}`}>
                                <div className="bg-white rounded-lg sm:rounded-xl border overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                                    {/* IMAGE */}
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        {filament.images?.[0] && (
                                            <img
                                                src={filament.images[0]}
                                                alt={filament.name}
                                                className="w-full h-full object-contain"
                                            />
                                        )}
                                        <div 
                                            className="absolute inset-0 opacity-20"
                                            style={{ backgroundColor: filament.hexCode || '#cccccc' }}
                                        />
                                        {/* Out of Stock Badge */}
                                        {!filament.inStock && (
                                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full z-10">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="px-2.5 pt-2 sm:p-4 flex-1">
                                        <div className="flex gap-1.5 mb-1 sm:mb-2">
                                            <span className="inline-block px-1.5 py-px sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold text-purple-700 bg-purple-100 rounded-full">
                                                {filament.finishType}
                                            </span>
                                            <span className="inline-block px-1.5 py-px sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold text-blue-700 bg-blue-100 rounded-full">
                                                {filament.material}
                                            </span>
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 sm:line-clamp-2 mb-1">
                                            {filament.name}
                                        </h3>
                                        <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
                                            Color: {filament.colorName}
                                        </p>
                                        <p className="hidden sm:block text-xs text-gray-600 line-clamp-2">
                                            {filament.shortDescription}
                                        </p>
                                    </div>

                                    {/* FOOTER */}
                                    <div className="mt-auto px-2.5 pb-2.5 sm:px-4 sm:pb-4">
                                        <hr className="hidden sm:block mb-3" />
                                        
                                        {/* Price */}
                                        <div className="mb-2">
                                            {filament.originalPrice && filament.originalPrice > filament.price && (
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                                        ₹{filament.originalPrice.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="text-[9px] sm:text-[10px] font-semibold text-green-600 bg-green-100 px-1 py-0.5 rounded">
                                                        {filament.discount}% off
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-base sm:text-xl font-bold text-gray-900">
                                                ₹{filament.price.toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        <button className="w-full h-8 sm:h-10 text-[11px] sm:text-sm bg-black text-white font-semibold rounded-md hover:bg-gray-900 transition">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
