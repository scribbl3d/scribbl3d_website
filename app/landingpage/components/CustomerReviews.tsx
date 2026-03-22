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

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
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
        <section className="w-full bg-white py-12 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            </div>
        </section>
    );
}
