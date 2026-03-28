"use client";

import { Star } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

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

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-3 h-3 ${
                        i < count
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                    }`}
                />
            ))}
        </div>
    );
}

function ReviewCard({ t }: { t: TestimonialItem }) {
    return (
        <div className="bg-[#f9f9f9] rounded-xl border border-gray-100 p-4 flex gap-3 w-[260px] sm:w-[280px] md:w-[300px] flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#4f46e5] flex items-center justify-center text-[10px] font-bold text-white">
                {t.initials}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-900">
                            {t.name}
                        </p>
                        <p className="text-[10px] text-gray-500">{t.role}</p>
                    </div>
                    <StarRating count={t.rating} />
                </div>

                <p className="mt-2 text-xs text-gray-600 italic line-clamp-3">
                    &ldquo;{t.quote}&rdquo;
                </p>
            </div>
        </div>
    );
}

function ReviewCarousel({ testimonials }: { testimonials: TestimonialItem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);

    const tripled = [...testimonials, ...testimonials, ...testimonials];

    const resetScroll = useCallback((el: HTMLDivElement) => {
        const third = el.scrollWidth / 3;
        if (el.scrollLeft >= third * 2) el.scrollLeft -= third;
        if (el.scrollLeft <= 0) el.scrollLeft += third;
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        el.scrollLeft = el.scrollWidth / 3;

        const animate = () => {
            el.scrollLeft += 0.5;
            resetScroll(el);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationRef.current);
    }, [resetScroll]);

    return (
        <div ref={scrollRef} className="flex gap-4 overflow-x-hidden">
            {tripled.map((t, i) => (
                <ReviewCard key={`${t.id}-${i}`} t={t} />
            ))}
        </div>
    );
}

export default function CustomerReviews({
    testimonials,
}: CustomerReviewsProps) {
    if (!testimonials?.length) return null;

    return (
        <section className="w-full bg-white py-10 sm:py-16 lg:py-24 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-10 lg:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        What Our Customers Say
                    </h2>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base text-gray-500">
                        Trusted by makers, engineers, and creators worldwide.
                    </p>
                </div>

                {/* Carousel */}
                <ReviewCarousel testimonials={testimonials} />
            </div>
        </section>
    );
}
