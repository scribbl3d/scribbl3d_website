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
            if (!material) {
                setLoading(false);
                return;
            }
            
            const res = await fetch(
                `/api/filaments/similar?material=${encodeURIComponent(material)}&exclude=${currentFilamentId}`
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
                                <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                                    {/* IMAGE */}
                                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                                        {filament.images?.[0] && (
                                            <img
                                                src={filament.images[0]}
                                                alt={filament.name}
                                                className="w-full h-full object-contain"
                                            />
                                        )}
                                        {/* Badge - Out of Stock or Finish Type */}
                                        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-[2]">
                                            {!filament.inStock ? (
                                                <span className="bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                                    Out of Stock
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[7px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full text-gray-700 bg-gray-100">
                                                    {filament.finishType}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="px-2.5 pt-2 pb-0 sm:px-5 sm:pt-4 sm:pb-0">
                                        <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                                            {filament.name}
                                        </h3>
                                        <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                                            {filament.shortDescription}
                                        </p>
                                    </div>

                                    {/* FOOTER */}
                                    <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                                        <hr className="hidden sm:block my-3" />
                                        
                                        {/* Price */}
                                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                                            <span className="text-base sm:text-lg font-black text-gray-900">₹{filament.price.toLocaleString("en-IN")}</span>
                                            {filament.originalPrice && filament.originalPrice > filament.price && (
                                                <>
                                                    <span className="text-[11px] sm:text-sm text-gray-400 line-through">₹{filament.originalPrice.toLocaleString("en-IN")}</span>
                                                    <span className="text-[9px] sm:text-[11px] font-bold text-green-600">{filament.discount}% OFF</span>
                                                </>
                                            )}
                                        </div>

                                        <button className="w-full mt-2 sm:mt-3 h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900">
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
