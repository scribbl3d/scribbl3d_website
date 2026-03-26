"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TestimonialItem {
    id: string;
    quote: string;
    name: string;
    role: string;
    initials: string;
    rating: number;
}

interface CustomerReviewsProps {
    testimonials: TestimonialItem[];
}

function StarRating({
    count,
    size = "normal",
}: {
    count: number;
    size?: "small" | "normal";
}) {
    const cls = size === "small" ? "w-3 h-3" : "w-4 h-4";
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`${cls} ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                />
            ))}
        </div>
    );
}

/* ── Review card — used in both views ── */
function ReviewCard({ t, compact }: { t: TestimonialItem; compact?: boolean }) {
    if (compact) {
        return (
            <div className="bg-[#f9f9f9] rounded-xl border border-gray-100 p-4 flex gap-3 w-[280px] flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#4f46e5] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                    {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-900">
                                {t.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                                {t.role}
                            </p>
                        </div>
                        <StarRating count={t.rating} size="small" />
                    </div>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed italic line-clamp-3">
                        &ldquo;{t.quote}&rdquo;
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f9f9f9] rounded-2xl border border-gray-100 p-6 w-[380px] flex-shrink-0">
            <StarRating count={t.rating} />
            <p className="mt-4 text-sm text-gray-700 leading-relaxed italic line-clamp-4">
                &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-5">
                <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center text-xs font-bold text-white">
                    {t.initials}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                </div>
            </div>
        </div>
    );
}

/* ── Auto-scrolling carousel ── */
function ReviewCarousel({
    testimonials,
    compact,
}: {
    testimonials: TestimonialItem[];
    compact?: boolean;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Triple the items for seamless infinite scroll
    const tripled = [...testimonials, ...testimonials, ...testimonials];

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || testimonials.length <= 1) return;

        const speed = 0.5; // px per frame
        let animationId: number;

        const scroll = () => {
            if (!isPaused && container) {
                container.scrollLeft += speed;
                // Reset to middle third when we've scrolled past the first third
                const oneThird = container.scrollWidth / 3;
                if (container.scrollLeft >= oneThird * 2) {
                    container.scrollLeft -= oneThird;
                }
            }
            animationId = requestAnimationFrame(scroll);
        };

        // Start from the middle third
        container.scrollLeft = container.scrollWidth / 3;
        animationId = requestAnimationFrame(scroll);

        return () => cancelAnimationFrame(animationId);
    }, [isPaused, testimonials.length]);

    return (
        <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
        >
            {tripled.map((t, i) => (
                <ReviewCard key={`${t.id}-${i}`} t={t} compact={compact} />
            ))}
        </div>
    );
}

export default function CustomerReviews({
    testimonials,
}: CustomerReviewsProps) {
    if (!testimonials?.length) return null;

    return (
        <section className="w-full bg-white py-8 sm:py-12 px-0 sm:px-0 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    What Our Customers Say
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Trusted by makers, engineers, and creators worldwide.
                </p>
            </div>

            {/* Desktop carousel */}
            <div className="hidden md:block">
                <ReviewCarousel testimonials={testimonials} />
            </div>

            {/* Mobile carousel */}
            <div className="md:hidden">
                <ReviewCarousel testimonials={testimonials} compact />
            </div>
        </section>
    );
}
