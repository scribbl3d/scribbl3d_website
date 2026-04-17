"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import WishlistModal from "@/app/profile/_components/wishlist-modal";
import { WishlistGridItem } from "@/app/profile/_components/wishlist.types";
import ResinCard from "./ResinCard";

/* =====================================================
   TYPES
===================================================== */

interface SimilarResinsCarouselProps {
    currentResinId: string;
    technology: string;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function SimilarResinsCarousel({
    currentResinId,
    technology,
}: SimilarResinsCarouselProps) {
    const [resins, setResins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeItem, setActiveItem] = useState<WishlistGridItem | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    /* =====================================================
       FETCH
    ===================================================== */

    useEffect(() => {
        let ignore = false;

        async function fetchSimilar() {
            try {
                const res = await fetch(
                    `/api/resins/similar?technology=${technology}&exclude=${currentResinId}`,
                );
                const data = await res.json();
                if (!ignore) {
                    setResins(data.resins ?? []);
                }
            } catch (err) {
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        fetchSimilar();
        return () => {
            ignore = true;
        };
    }, [currentResinId, technology]);

    /* =====================================================
       AUTO-SCROLL
    ===================================================== */

    useEffect(() => {
        if (!scrollRef.current || resins.length <= 1) return;
        const container = scrollRef.current;
        container.scrollLeft = 0;
        const interval = setInterval(() => {
            const cardWidth = container.firstElementChild?.clientWidth || 0;
            container.scrollBy({ left: cardWidth, behavior: "smooth" });
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollTo({ left: 0, behavior: "auto" });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [resins]);

    /* =====================================================
       SCROLL
    ===================================================== */

    const scroll = (dir: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({
            left: dir === "left" ? -cardWidth : cardWidth,
            behavior: "smooth",
        });
    };

    /* =====================================================
       GUARDS
    ===================================================== */

    if (loading || resins.length === 0) return null;

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="py-4 sm:py-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">
                Similar Resins
            </h2>

            <div className="relative">
                {/* Arrow buttons — hidden on mobile (swipe), visible on sm+ */}
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

                {/* CAROUSEL */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2 sm:pb-4"
                >
                    {[...resins, ...resins].map((resin, index) => {
                        const weights =
                            resin.weights && resin.weights.length > 0
                                ? resin.weights
                                : [
                                      {
                                          id: "default",
                                          price: 0,
                                          originalPrice: null,
                                      },
                                  ];

                        return (
                            <div
                                key={`${resin.id}-${index}`}
                                className="snap-start flex-shrink-0 w-[48%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
                            >
                                <ResinCard
                                    resin={{ ...resin, weights }}
                                    onSelect={() =>
                                        setActiveItem({
                                            id: resin.id,
                                            itemType: "resin",
                                            title: resin.name,
                                            image: resin.cardImageUrl ?? null,
                                            badge: resin.technology,
                                            slug: resin.slug,

                                            price: weights[0].price,
                                            originalPrice:
                                                weights[0].originalPrice ??
                                                null,

                                            requiresOptions: true,

                                            cartPayload: {
                                                resinId: resin.id,
                                            },

                                            resinColours:
                                                resin.colours?.map(
                                                    (c: any) => ({
                                                        id: c.id,
                                                        name: c.name,
                                                        hex:
                                                            c.hexCode ??
                                                            "#E5E7EB",
                                                        image:
                                                            c.images?.[0]
                                                                ?.url ?? null,
                                                    }),
                                                ) ?? [],

                                            resinWeights: weights.map(
                                                (w: any) => ({
                                                    id: w.id,
                                                    label: w.weightInGrams
                                                        ? `${w.weightInGrams} g`
                                                        : "Default",
                                                    price: w.price,
                                                    originalPrice:
                                                        w.originalPrice ?? null,
                                                }),
                                            ),
                                        })
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL */}
            {activeItem && (
                <WishlistModal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                />
            )}
        </div>
    );
}