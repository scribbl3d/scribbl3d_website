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

// Card animation variants — left, up, right for 3 cards
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
        <section className="w-full bg-[#f5f5f5] py-16 px-6 sm:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <SplitText className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Learning Hub
                        </SplitText>
                        <AnimatedSubtext className="mt-1 text-sm text-gray-500">
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

                {/* Blog cards with staggered directional animations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogs.map((blog, index) => {
                        const category = getBlogCategory(blog.keywords);
                        const variant = cardVariants[index] || cardVariants[1]; // fallback to "up"

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
                                    {/* Thumbnail */}
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

                                    {/* Meta */}
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

                {/* Mobile button */}
                <Link
                    href="/blog"
                    className="flex sm:hidden items-center justify-center mt-8 px-6 py-3 text-sm font-bold text-[#4f46e5] border-2 border-[#4f46e5] rounded-xl hover:bg-[#4f46e5] hover:text-white transition-all"
                >
                    Read All Guides
                </Link>
            </div>
        </section>
    );
}
