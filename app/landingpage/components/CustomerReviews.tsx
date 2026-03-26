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

/* ── Auto-scrolling carousel with smooth pause/resume + drag/swipe ── */
function ReviewCarousel({
    testimonials,
    compact,
}: {
    testimonials: TestimonialItem[];
    compact?: boolean;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPausedRef = useRef(false);
    const speedRef = useRef(0.5); // current animated speed (eases to 0 on pause)
    const targetSpeedRef = useRef(0.5); // what we're easing toward
    const animationRef = useRef<number>(0);

    // Drag / swipe state
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const dragVelocityRef = useRef(0);
    const lastDragXRef = useRef(0);
    const lastDragTimeRef = useRef(0);

    const BASE_SPEED = 0.5;
    const EASE_FACTOR = 0.03; // how fast speed ramps up/down (lower = smoother)

    // Triple the items for seamless infinite scroll
    const tripled = [...testimonials, ...testimonials, ...testimonials];

    const resetScrollIfNeeded = useCallback((container: HTMLDivElement) => {
        const oneThird = container.scrollWidth / 3;
        if (container.scrollLeft >= oneThird * 2) {
            container.scrollLeft -= oneThird;
        } else if (container.scrollLeft <= 0) {
            container.scrollLeft += oneThird;
        }
    }, []);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || testimonials.length <= 1) return;

        // Start from the middle third
        const oneThird = container.scrollWidth / 3;
        container.scrollLeft = oneThird;

        const animate = () => {
            if (!container) return;

            // Smoothly ease current speed toward target
            const target =
                isPausedRef.current || isDraggingRef.current ? 0 : BASE_SPEED;
            targetSpeedRef.current = target;
            speedRef.current +=
                (targetSpeedRef.current - speedRef.current) * EASE_FACTOR;

            // Apply momentum from drag release
            if (
                !isDraggingRef.current &&
                Math.abs(dragVelocityRef.current) > 0.1
            ) {
                container.scrollLeft -= dragVelocityRef.current;
                dragVelocityRef.current *= 0.95; // friction
            } else {
                dragVelocityRef.current = 0;
            }

            // Only scroll if speed is meaningful
            if (Math.abs(speedRef.current) > 0.01) {
                container.scrollLeft += speedRef.current;
            }

            resetScrollIfNeeded(container);
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationRef.current);
    }, [testimonials.length, resetScrollIfNeeded]);

    /* ── Hover handlers ── */
    const handleMouseEnter = () => {
        isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
        if (!isDraggingRef.current) {
            isPausedRef.current = false;
        }
    };

    /* ── Drag (mouse) handlers ── */
    const handleMouseDown = (e: React.MouseEvent) => {
        const container = scrollRef.current;
        if (!container) return;

        isDraggingRef.current = true;
        dragStartXRef.current = e.pageX;
        dragScrollLeftRef.current = container.scrollLeft;
        lastDragXRef.current = e.pageX;
        lastDragTimeRef.current = Date.now();
        dragVelocityRef.current = 0;
        container.style.cursor = "grabbing";
        container.style.userSelect = "none";
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        const container = scrollRef.current;
        if (!container) return;

        e.preventDefault();
        const x = e.pageX;
        const walk = x - dragStartXRef.current;
        container.scrollLeft = dragScrollLeftRef.current - walk;

        // Track velocity for momentum
        const now = Date.now();
        const dt = now - lastDragTimeRef.current;
        if (dt > 0) {
            dragVelocityRef.current = ((x - lastDragXRef.current) / dt) * 16; // normalize to ~per frame
        }
        lastDragXRef.current = x;
        lastDragTimeRef.current = now;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        const container = scrollRef.current;
        if (container) {
            container.style.cursor = "grab";
            container.style.userSelect = "";
        }
    };

    /* ── Touch (swipe) handlers ── */
    const handleTouchStart = (e: React.TouchEvent) => {
        const container = scrollRef.current;
        if (!container) return;

        isPausedRef.current = true;
        isDraggingRef.current = true;
        dragStartXRef.current = e.touches[0].pageX;
        dragScrollLeftRef.current = container.scrollLeft;
        lastDragXRef.current = e.touches[0].pageX;
        lastDragTimeRef.current = Date.now();
        dragVelocityRef.current = 0;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDraggingRef.current) return;
        const container = scrollRef.current;
        if (!container) return;

        const x = e.touches[0].pageX;
        const walk = x - dragStartXRef.current;
        container.scrollLeft = dragScrollLeftRef.current - walk;

        // Track velocity
        const now = Date.now();
        const dt = now - lastDragTimeRef.current;
        if (dt > 0) {
            dragVelocityRef.current = ((x - lastDragXRef.current) / dt) * 16;
        }
        lastDragXRef.current = x;
        lastDragTimeRef.current = now;
    };

    const handleTouchEnd = () => {
        isDraggingRef.current = false;
        // Resume auto-scroll after a short delay
        setTimeout(() => {
            isPausedRef.current = false;
        }, 2000);
    };

    return (
        <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden"
            style={{ cursor: "grab" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={(e) => {
                handleMouseUp();
                handleMouseLeave();
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
