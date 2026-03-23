"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

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

const cardVariants = [
    {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.6, type: "tween", ease: "easeOut" },
        },
    },
    {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                type: "tween",
                ease: "easeOut",
                delay: 0.15,
            },
        },
    },
    {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                type: "tween",
                ease: "easeOut",
                delay: 0.3,
            },
        },
    },
];

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

export default function CustomerReviews({
    testimonials,
}: CustomerReviewsProps) {
    if (!testimonials?.length) return null;

    return (
        <section className="w-full bg-white py-8 sm:py-12 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Desktop: 3-col grid with animations */}
                <div className="hidden md:grid md:grid-cols-3 gap-5">
                    {testimonials.map((t, index) => {
                        const variant =
                            cardVariants[index % cardVariants.length];
                        return (
                            <motion.div
                                key={t.id}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ margin: "-50px" }}
                                variants={variant}
                                className="bg-[#f9f9f9] rounded-2xl border border-gray-100 p-6"
                            >
                                <StarRating count={t.rating} />
                                <p className="mt-4 text-sm text-gray-700 leading-relaxed italic">
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
                                        <p className="text-xs text-gray-500">
                                            {t.role}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile: compact vertical stack */}
                <div className="md:hidden flex flex-col gap-3">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className="bg-[#f9f9f9] rounded-xl border border-gray-100 p-4 flex gap-3"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-[#4f46e5] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                                {t.initials}
                            </div>
                            {/* Content */}
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
                    ))}
                </div>
            </div>
        </section>
    );
}
