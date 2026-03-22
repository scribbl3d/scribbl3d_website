"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface NewArrivalItem {
    id: string;
    name: string;
    price: number;
    originalPrice?: number | null;
    description?: string | null;
    image?: string | null;
    type: "printer" | "filament" | "resin" | "prebuilt";
    href: string;
}

interface NewArrivalsProps {
    items: NewArrivalItem[];
}

function formatPrice(price: number) {
    return `₹${price.toLocaleString("en-IN")}`;
}

export default function NewArrivals({ items }: NewArrivalsProps) {
    const [active, setActive] = useState(0);

    if (!items.length) return null;

    const current = items[active];

    return (
        <section className="w-full bg-[#f5f5f5] py-16 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <SplitText className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">
                        New Arrivals
                    </SplitText>
                    <AnimatedSubtext className="mt-2 text-sm text-gray-500">
                        The latest breakthroughs in 3D technology.
                    </AnimatedSubtext>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-4 items-center">
                    {/* ── Spotlight Image (left — 3/5) ── */}
                    <Link
                        href={current.href}
                        className="lg:col-span-3 relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 group h-[350px] sm:h-[400px] lg:h-[430px]"
                    >
                        {/* Image — object-contain, anchored to top so bottom stays clear for text */}
                        <AnimatePresence initial={false}>
                            <motion.img
                                key={current.id + "_img"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                src={current.image || ""}
                                alt={current.name}
                                className="absolute inset-0 w-full h-full object-contain object-top pt-4 px-4"
                            />
                        </AnimatePresence>

                        {/* Solid dark strip at bottom for text readability */}
                        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[#111] via-[#111]/95 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={current.id + "_text"}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={{
                                        hidden: {},
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.07,
                                                delayChildren: 0.15,
                                            },
                                        },
                                    }}
                                >
                                    {/* Name — word-by-word wave */}
                                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 overflow-hidden">
                                        {current.name
                                            .split(" ")
                                            .map((word, i) => (
                                                <motion.span
                                                    key={i}
                                                    className="inline-block mr-[0.25em]"
                                                    variants={{
                                                        hidden: {
                                                            y: 40,
                                                            opacity: 0,
                                                        },
                                                        visible: {
                                                            y: 0,
                                                            opacity: 1,
                                                            transition: {
                                                                type: "spring",
                                                                damping: 15,
                                                                stiffness: 100,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {word}
                                                </motion.span>
                                            ))}
                                    </h3>

                                    {/* Description — fade up */}
                                    {current.description && (
                                        <motion.p
                                            className="text-white/70 text-sm max-w-sm mb-5 line-clamp-2"
                                            variants={{
                                                hidden: { y: 20, opacity: 0 },
                                                visible: {
                                                    y: 0,
                                                    opacity: 1,
                                                    transition: {
                                                        duration: 0.5,
                                                        ease: "easeOut",
                                                    },
                                                },
                                            }}
                                        >
                                            {current.description}
                                        </motion.p>
                                    )}

                                    {/* Button — slide from left */}
                                    <motion.span
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] transition-colors"
                                        variants={{
                                            hidden: { x: -30, opacity: 0 },
                                            visible: {
                                                x: 0,
                                                opacity: 1,
                                                transition: {
                                                    type: "spring",
                                                    damping: 18,
                                                    stiffness: 90,
                                                },
                                            },
                                        }}
                                    >
                                        View Details{" "}
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Link>

                    {/* ── Selection List (right — 2/5) ── */}
                    <div className="lg:col-span-2 flex flex-col justify-center gap-3">
                        {items.map((item, index) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                onMouseEnter={() => setActive(index)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                                    active === index
                                        ? "bg-white border-[#4f46e5]/40 shadow-md"
                                        : "bg-white/60 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm"
                                }`}
                            >
                                {/* Thumbnail */}
                                <div
                                    className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors bg-gray-100 ${
                                        active === index
                                            ? "border-[#4f46e5]/50"
                                            : "border-gray-200"
                                    }`}
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-[10px] text-gray-400">
                                                No img
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-0.5">
                                        <h4
                                            className={`text-sm font-bold transition-colors truncate ${
                                                active === index
                                                    ? "text-[#4f46e5]"
                                                    : "text-gray-900"
                                            }`}
                                        >
                                            {item.name}
                                        </h4>
                                        <span className="text-sm font-bold text-[#4f46e5] font-mono flex-shrink-0">
                                            {formatPrice(item.price)}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-xs text-gray-500 truncate">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                {/* Arrow */}
                                <div
                                    className={`transition-all duration-300 flex-shrink-0 ${
                                        active === index
                                            ? "translate-x-0 opacity-100"
                                            : "-translate-x-3 opacity-0"
                                    }`}
                                >
                                    <ChevronRight className="w-5 h-5 text-[#4f46e5]" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
