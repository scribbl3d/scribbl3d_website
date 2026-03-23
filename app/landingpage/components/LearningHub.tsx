"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface BlogItem {
    id: string;
    title: string;
    description?: string | null;
    keywords: string;
    thumbnailImage?: string | null;
    createdAt: string;
}

interface LearningHubProps {
    blogs: BlogItem[];
}

function getBlogCategory(keywords: string): string {
    const kw = keywords.toLowerCase();
    if (kw.includes("tutorial") || kw.includes("guide") || kw.includes("how"))
        return "TUTORIAL";
    if (
        kw.includes("material") ||
        kw.includes("filament") ||
        kw.includes("resin")
    )
        return "MATERIALS SCIENCE";
    if (
        kw.includes("case study") ||
        kw.includes("aerospace") ||
        kw.includes("industry")
    )
        return "CASE STUDY";
    if (kw.includes("news") || kw.includes("update")) return "NEWS";
    if (kw.includes("review") || kw.includes("comparison")) return "REVIEW";
    return "ARTICLE";
}

const cardVariants = [
    {
        hidden: { opacity: 0, x: -60 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, type: "tween", ease: "easeOut" },
        },
    },
    {
        hidden: { opacity: 0, y: 60 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                type: "tween",
                ease: "easeOut",
                delay: 0.15,
            },
        },
    },
    {
        hidden: { opacity: 0, x: 60 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.7,
                type: "tween",
                ease: "easeOut",
                delay: 0.3,
            },
        },
    },
];

export default function LearningHub({ blogs }: LearningHubProps) {
    if (!blogs.length) return null;

    return (
        <section className="w-full bg-[#f5f5f5] py-10 sm:py-16 px-4 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-5 sm:mb-8">
                    <div>
                        <SplitText className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            Learning Hub
                        </SplitText>
                        <AnimatedSubtext className="mt-1 text-xs sm:text-sm text-gray-500">
                            Master the art of additive manufacturing.
                        </AnimatedSubtext>
                    </div>
                    <Link
                        href="/blog"
                        className="hidden sm:flex items-center justify-center px-6 py-3 text-sm font-bold text-[#4f46e5] border-2 border-[#4f46e5] rounded-xl hover:bg-[#4f46e5] hover:text-white transition-all"
                    >
                        Read All Guides
                    </Link>
                </div>

                {/* Desktop: 3-col grid with animations */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {blogs.map((blog, index) => {
                        const category = getBlogCategory(blog.keywords);
                        const variant = cardVariants[index] || cardVariants[1];

                        return (
                            <motion.div
                                key={blog.id}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ margin: "-50px" }}
                                variants={variant}
                            >
                                <Link
                                    href={`/blog/${blog.id}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-200">
                                        {blog.thumbnailImage ? (
                                            <img
                                                src={blog.thumbnailImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-sm text-gray-400">
                                                    No image
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-4 text-xs font-semibold tracking-wider text-[#4f46e5] uppercase">
                                        {category}
                                    </p>
                                    <h3 className="mt-2 text-lg font-bold text-gray-900 leading-snug group-hover:text-[#4f46e5] transition-colors">
                                        {blog.title}
                                    </h3>
                                    {blog.description && (
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                            {blog.description}
                                        </p>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile: compact vertical stack — thumbnail left, text right */}
                <div className="md:hidden flex flex-col gap-3">
                    {blogs.map((blog) => {
                        const category = getBlogCategory(blog.keywords);
                        return (
                            <Link
                                key={blog.id}
                                href={`/blog/${blog.id}`}
                                className="flex gap-3 bg-white rounded-xl overflow-hidden border border-gray-100 active:scale-[0.99] transition-transform"
                            >
                                {/* Thumbnail */}
                                <div className="w-28 flex-shrink-0 bg-gray-200">
                                    {blog.thumbnailImage ? (
                                        <img
                                            src={blog.thumbnailImage}
                                            alt={blog.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300" />
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 py-3 pr-3">
                                    <p className="text-[10px] font-semibold tracking-wider text-[#4f46e5] uppercase">
                                        {category}
                                    </p>
                                    <h3 className="text-sm font-bold text-gray-900 leading-snug mt-1 line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    {blog.description && (
                                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                                            {blog.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile button */}
                <Link
                    href="/blog"
                    className="flex sm:hidden items-center justify-center mt-5 px-5 py-2.5 text-xs font-bold text-[#4f46e5] border-2 border-[#4f46e5] rounded-xl hover:bg-[#4f46e5] hover:text-white transition-all"
                >
                    Read All Guides
                </Link>
            </div>
        </section>
    );
}
