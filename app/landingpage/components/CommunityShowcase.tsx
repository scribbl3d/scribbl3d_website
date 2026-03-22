"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface CommunityImageItem {
    id: string;
    imageUrl: string;
    altText?: string | null;
    linkPath?: string | null;
}

interface CommunityShowcaseProps {
    images: CommunityImageItem[];
}

export default function CommunityShowcase({ images }: CommunityShowcaseProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll carousel
    useEffect(() => {
        if (!scrollRef.current || !images?.length || images.length <= 3) return;

        const container = scrollRef.current;
        const interval = setInterval(() => {
            const cardWidth = container.firstElementChild?.clientWidth || 0;
            const gap = 16; // gap-4 = 16px
            container.scrollBy({ left: cardWidth + gap, behavior: "smooth" });

            // Reset to start when reaching the duplicated half
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollTo({ left: 0, behavior: "auto" });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [images]);

    const scrollLeft = () => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({ left: -(cardWidth + 16), behavior: "smooth" });
    };

    const scrollRight = () => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({ left: cardWidth + 16, behavior: "smooth" });
    };

    if (!images?.length) return null;

    // Duplicate for infinite scroll effect
    const displayImages = images.length > 3 ? [...images, ...images] : images;

    return (
        <section className="w-full bg-white pt-16 pb-8 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 justify-center">
                        Printed by You.
                    </SplitText>
                    <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 justify-center">
                        Powered by Scribbl3D.
                    </SplitText>
                    <AnimatedSubtext className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
                        Join thousands of makers worldwide pushing the limits of
                        desktop manufacturing.
                    </AnimatedSubtext>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Left arrow */}
                    {images.length > 3 && (
                        <button
                            onClick={scrollLeft}
                            className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    {/* Right arrow */}
                    {images.length > 3 && (
                        <button
                            onClick={scrollRight}
                            className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
                    >
                        {displayImages.map((img, index) => {
                            const card = (
                                <div className="snap-start flex-shrink-0 w-[220px] sm:w-[240px] lg:w-[260px] aspect-square rounded-2xl overflow-hidden bg-gray-200 group cursor-pointer">
                                    <img
                                        src={img.imageUrl}
                                        alt={img.altText || "Community print"}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            );

                            return img.linkPath ? (
                                <Link
                                    key={`${img.id}-${index}`}
                                    href={img.linkPath}
                                    className="flex-shrink-0"
                                >
                                    {card}
                                </Link>
                            ) : (
                                <div
                                    key={`${img.id}-${index}`}
                                    className="flex-shrink-0"
                                >
                                    {card}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
