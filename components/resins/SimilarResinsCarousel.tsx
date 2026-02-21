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
                    `/api/resins/similar?technology=${technology}&exclude=${currentResinId}`
                );
                const data = await res.json();
                if (!ignore) {
                    setResins(data.resins ?? []);
                }
            } catch (err) {
                console.error("Failed to fetch similar resins", err);
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
       SCROLL
    ===================================================== */

    const scrollLeft = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: -el.clientWidth, behavior: "smooth" });
    };

    const scrollRight = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
    };

    /* =====================================================
       GUARDS
    ===================================================== */

    if (loading || resins.length === 0) return null;

    /**
     * 🔑 DUPLICATION RULE
     * - Only duplicate if screen can show MORE cards than we have
     * - Desktop ≈ 4 cards
     */
    const shouldDuplicate = resins.length < 4;
    const carouselItems = shouldDuplicate ? [...resins, ...resins] : resins;

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="py-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Similar Resins
            </h2>

            <div className="relative">
                {/* LEFT ARROW */}
                {carouselItems.length > 1 && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-10
                                   w-10 h-10 rounded-full bg-white shadow
                                   flex items-center justify-center hover:bg-gray-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {/* RIGHT ARROW */}
                {carouselItems.length > 1 && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-10
                                   w-10 h-10 rounded-full bg-white shadow
                                   flex items-center justify-center hover:bg-gray-100"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* CAROUSEL */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth
                               scrollbar-hide snap-x snap-mandatory pb-4"
                >
                    {carouselItems.map((resin, index) => {
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
                                className="snap-start flex-shrink-0
                                           w-[85%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
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

                                            // 👇 ALWAYS FROM weights[0]
                                            price: weights[0].price,
                                            originalPrice:
                                                weights[0].originalPrice ??
                                                null,

                                            requiresOptions: true,

                                            cartPayload: {
                                                resinId: resin.id,
                                            },

                                            // ✅ COLORS (THIS FIXES COLOR ISSUE)
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
                                                    })
                                                ) ?? [],

                                            // ✅ WEIGHTS
                                            resinWeights: weights.map(
                                                (w: any) => ({
                                                    id: w.id,
                                                    label: w.weightInGrams
                                                        ? `${w.weightInGrams} g`
                                                        : "Default",
                                                    price: w.price,
                                                    originalPrice:
                                                        w.originalPrice ?? null,
                                                })
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
