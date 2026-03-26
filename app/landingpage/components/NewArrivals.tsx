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
        <section className="w-full bg-[#f5f5f5] py-10 sm:py-16 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                    <SplitText className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900">
                        Latest in 3D printing
                    </SplitText>
                    <AnimatedSubtext className="mt-1 sm:mt-1.5 text-xs sm:text-[13px] text-gray-500">
                        Discover new printers, materials, and tools.
                    </AnimatedSubtext>
                </div>

                {/* ── Desktop: spotlight + list ── */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                    {/* ── Spotlight Image (left — 6/12) ── */}
                    <Link
                        href={current.href}
                        className="lg:col-span-6 xl:col-span-7 relative h-[440px] lg:h-[480px] rounded-[32px] lg:rounded-[40px] bg-white border border-black/5 p-3 lg:p-4 group block shadow-sm hover:shadow-lg transition-all duration-500"
                    >
                        <div className="relative w-full h-full rounded-[24px] lg:rounded-[28px] overflow-hidden bg-[#f4f5f7] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                            <AnimatePresence initial={false}>
                                <motion.img
                                    key={current.id + "_img"}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    src={current.image || ""}
                                    alt={current.name}
                                    /* REDUCED Y-AXIS PADDING: Changed from p-8 lg:p-12 to px-8 py-2 lg:px-12 lg:py-4 to make image bigger */
                                    className="absolute inset-0 w-full h-full object-contain px-8 py-2 lg:px-12 lg:py-4 mix-blend-multiply"
                                />
                            </AnimatePresence>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />

                            {/* Text Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 xl:p-10 z-20">
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
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.1,
                                                },
                                            },
                                        }}
                                    >
                                        {/* Name */}
                                        <h3 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-2 lg:mb-3 overflow-hidden leading-tight">
                                            {current.name
                                                .split(" ")
                                                .map((word, i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="inline-block mr-[0.25em]"
                                                        variants={{
                                                            hidden: {
                                                                y: 30,
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

                                        {/* Description */}
                                        {current.description && (
                                            <motion.p
                                                className="text-white/80 text-[13px] lg:text-sm max-w-md mb-5 lg:mb-6 line-clamp-2"
                                                variants={{
                                                    hidden: {
                                                        y: 15,
                                                        opacity: 0,
                                                    },
                                                    visible: {
                                                        y: 0,
                                                        opacity: 1,
                                                        transition: {
                                                            duration: 0.4,
                                                            ease: "easeOut",
                                                        },
                                                    },
                                                }}
                                            >
                                                {current.description}
                                            </motion.p>
                                        )}

                                        {/* Button */}
                                        <motion.span
                                            className="inline-flex items-center gap-2 px-6 py-3 lg:px-7 lg:py-3.5 text-[13px] lg:text-sm font-bold text-white bg-[#4f46e5] rounded-xl lg:rounded-[14px] hover:bg-[#4338ca] transition-colors shadow-lg"
                                            variants={{
                                                hidden: { x: -20, opacity: 0 },
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
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </motion.span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </Link>

                    {/* ── Selection List (right) ── */}
                    <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center gap-2 lg:gap-2.5">
                        {items.map((item, index) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                onMouseEnter={() => setActive(index)}
                                className={`flex items-center gap-4 p-3 lg:p-3.5 rounded-2xl transition-all duration-300 border-2 ${
                                    active === index
                                        ? "bg-white border-[#4f46e5]/40 shadow-md"
                                        : "bg-transparent border-transparent hover:bg-white/50"
                                }`}
                            >
                                {/* Thumbnail */}
                                <div
                                    className={`w-[60px] h-[60px] lg:w-[64px] lg:h-[64px] rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm transition-shadow p-1.5 ${
                                        active === index
                                            ? "shadow-md ring-2 ring-[#4f46e5]/20"
                                            : ""
                                    }`}
                                >
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg">
                                            <span className="text-[9px] text-gray-400">
                                                No img
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-grow min-w-0">
                                    <h4
                                        className={`text-[14px] lg:text-[15px] font-bold transition-colors truncate ${
                                            active === index
                                                ? "text-[#4f46e5]"
                                                : "text-gray-900"
                                        }`}
                                    >
                                        {item.name}
                                    </h4>
                                    {item.description && (
                                        <p className="text-[11px] lg:text-[12px] text-gray-400 line-clamp-1 mt-0.5">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                <span
                                    className={`text-[15px] lg:text-[16px] font-bold flex-shrink-0 ml-2 transition-colors ${
                                        active === index
                                            ? "text-[#4f46e5]"
                                            : "text-[#4f46e5]/70"
                                    }`}
                                >
                                    {formatPrice(item.price)}
                                </span>

                                {/* Arrow */}
                                <div
                                    className={`transition-all duration-300 flex-shrink-0 ${
                                        active === index
                                            ? "translate-x-0 opacity-100"
                                            : "-translate-x-2 opacity-0"
                                    }`}
                                >
                                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 text-[#4f46e5]" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Mobile/Tablet: 2×2 grid (UNTOUCHED) ── */}
                <div className="lg:hidden">
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden group active:scale-[0.98] transition-transform"
                            >
                                {/* Image */}
                                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-[10px] text-gray-400">
                                                No image
                                            </span>
                                        </div>
                                    )}
                                    {/* Type badge */}
                                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white bg-[#4f46e5]/90 rounded-md backdrop-blur-sm">
                                        {item.type}
                                    </span>
                                </div>
                                {/* Info */}
                                <div className="p-3">
                                    <h4 className="text-xs font-bold text-gray-900 truncate">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-xs font-bold text-[#4f46e5]">
                                            {formatPrice(item.price)}
                                        </span>
                                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
