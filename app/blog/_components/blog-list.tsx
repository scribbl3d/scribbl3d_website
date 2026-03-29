"use client";

import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Calendar,
    ChevronDown,
    ImageIcon,
    Search,
    TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FourPointStar } from "./icons/four-point-star";

// 1. Ensure published and featured are in the interface
interface BlogPost {
    id: string;
    slug?: string | null;
    title: string;
    createdAt: string;
    publishedAt?: string | null;
    keywords: string;
    description?: string | null;
    heroImage?: string | null;
    thumbnailImage?: string | null;
    published?: boolean;
    featured?: boolean;
}

function getAllKeywords(blogs: BlogPost[]): string[] {
    const set = new Set<string>(["All"]);
    blogs.forEach((b) =>
        b.keywords.split(",").forEach((k) => set.add(k.trim())),
    );
    return Array.from(set);
}

function PostImage({
    blog,
    className = "",
}: {
    blog: BlogPost;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    const src = blog.thumbnailImage || blog.heroImage;

    if (src && !failed) {
        return (
            <Image
                src={src}
                alt={blog.title}
                fill
                className={`object-cover ${className}`}
                unoptimized
                onError={() => setFailed(true)}
            />
        );
    }
    return (
        <div className="flex items-center justify-center h-full w-full bg-[#F0EDE8]">
            <ImageIcon className="w-10 h-10 text-[#C4B89A]" />
        </div>
    );
}

export default function BlogList() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [visiblePosts, setVisiblePosts] = useState(6);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeKeyword, setActiveKeyword] = useState("All");

    useEffect(() => {
        fetch("/api/blogs")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setBlogs)
            .catch(console.error);
    }, []);

    // ── LOGIC 1: Only show PUBLISHED blogs to public users ──
    const publishedBlogs = blogs.filter((b) => b.published === true);

    const allKeywords = getAllKeywords(publishedBlogs);

    const filtered = publishedBlogs.filter((b) => {
        const matchKw =
            activeKeyword === "All" ||
            b.keywords
                .split(",")
                .map((k) => k.trim())
                .includes(activeKeyword);
        const matchSearch =
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.description || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        return matchKw && matchSearch;
    });

    // ── LOGIC 2: Find the explicit FEATURED post (fallback to the newest one) ──
    const explicitFeatured = filtered.find((b) => b.featured === true);
    const featured = explicitFeatured || filtered[0];

    // ── LOGIC 3: The grid gets the rest of the posts (excluding the featured one) ──
    const rest = filtered
        .filter((b) => b.id !== featured?.id)
        .slice(0, visiblePosts);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div
            className="min-h-screen"
            style={{ fontFamily: "'Lato', sans-serif", background: "#FAFAF7" }}
        >
            {/* ── HERO HEADER ─────────────────────────────────────── */}
            <div
                className="px-6 md:px-12 pt-12 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8"
                style={{ borderBottom: "2px solid #E8E3D9" }}
            >
                <div>
                    <p
                        className="uppercase tracking-[0.35em] text-xs mb-3"
                        style={{ color: "#F5A524", fontWeight: 700 }}
                    >
                        Our Editorial
                    </p>
                    <h1
                        className="leading-none tracking-tighter"
                        style={{
                            fontFamily: "'Lato', sans-serif",
                            fontSize: "clamp(52px, 8vw, 96px)",
                            fontWeight: 900,
                            color: "#111",
                            letterSpacing: "-0.03em",
                        }}
                    >
                        THE BLOG.
                    </h1>
                    <p
                        style={{
                            color: "#7C7C7C",
                            fontSize: 16,
                            marginTop: 12,
                            maxWidth: 480,
                        }}
                    >
                        Thoughts, insights, and ideas — freshly curated for
                        curious minds.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80 flex-shrink-0">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: "#aaa" }}
                    />
                    <input
                        type="text"
                        placeholder="Search articles…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            paddingLeft: 40,
                            paddingRight: 20,
                            paddingTop: 14,
                            paddingBottom: 14,
                            border: "1.5px solid #E8E3D9",
                            borderRadius: 16,
                            background: "#fff",
                            fontSize: 14,
                            color: "#111",
                            outline: "none",
                        }}
                    />
                </div>
            </div>

            {/* ── MAIN LAYOUT ─────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-12 px-6 md:px-12 pt-12 pb-20">
                {/* ── SIDEBAR ─── */}
                <aside className="lg:w-[260px] flex-shrink-0">
                    <div className="sticky top-28 space-y-8">
                        {/* Filter */}
                        <div
                            style={{
                                background: "#fff",
                                border: "1.5px solid #E8E3D9",
                                borderRadius: 24,
                                padding: 28,
                            }}
                        >
                            <p
                                className="uppercase tracking-widest text-xs mb-5 font-bold"
                                style={{ color: "#F5A524" }}
                            >
                                Filter by Topic
                            </p>
                            <div className="relative">
                                <select
                                    value={activeKeyword}
                                    onChange={(e) =>
                                        setActiveKeyword(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        appearance: "none",
                                        background: "#FAFAF7",
                                        border: "1.5px solid #E8E3D9",
                                        borderRadius: 12,
                                        padding: "12px 40px 12px 16px",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "#333",
                                        cursor: "pointer",
                                        outline: "none",
                                    }}
                                >
                                    {allKeywords.map((kw) => (
                                        <option key={kw} value={kw}>
                                            {kw}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={15}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: "#aaa" }}
                                />
                            </div>
                        </div>

                        {/* Trending */}
                        {publishedBlogs.length > 0 && (
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1.5px solid #E8E3D9",
                                    borderRadius: 24,
                                    padding: 28,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp
                                        size={15}
                                        style={{ color: "#F5A524" }}
                                    />
                                    <p
                                        className="uppercase tracking-widest text-xs font-bold"
                                        style={{ color: "#F5A524" }}
                                    >
                                        Trending
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    {publishedBlogs
                                        .slice(0, 4)
                                        .map((post, idx) => (
                                            <Link
                                                key={post.id}
                                                href={`/blog/${post.slug || post.id}`}
                                                className="flex gap-4 group"
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 28,
                                                        fontWeight: 900,
                                                        lineHeight: 1,
                                                        color: "#E8E3D9",
                                                        transition: "color .2s",
                                                        flexShrink: 0,
                                                    }}
                                                    className="group-hover:text-[#F5A524]"
                                                >
                                                    0{idx + 1}
                                                </span>
                                                <div>
                                                    <p
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            lineHeight: 1.4,
                                                            color: "#222",
                                                        }}
                                                        className="group-hover:text-[#F5A524] transition-colors line-clamp-2"
                                                    >
                                                        {post.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#aaa",
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        {formatDate(
                                                            post.publishedAt ||
                                                                post.createdAt,
                                                        )}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── CONTENT ─── */}
                <div className="flex-1 min-w-0">
                    {/* Featured post */}
                    {featured && (
                        <Link
                            href={`/blog/${featured.slug || featured.id}`}
                            className="block mb-12"
                        >
                            <div
                                className="relative overflow-hidden group"
                                style={{
                                    borderRadius: 32,
                                    height: 460,
                                    background: "#E8E3D9",
                                }}
                            >
                                <div className="absolute inset-0">
                                    <PostImage
                                        blog={featured}
                                        className="group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                {/* Gradient */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
                                    }}
                                />
                                {/* Badge */}
                                <div className="absolute top-6 left-6">
                                    <span
                                        style={{
                                            background: "#F5A524",
                                            color: "#fff",
                                            borderRadius: 8,
                                            padding: "5px 14px",
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                        }}
                                    >
                                        {featured.featured
                                            ? "Featured"
                                            : "Latest"}
                                    </span>
                                </div>
                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-10">
                                    <h2
                                        style={{
                                            color: "#fff",
                                            fontSize: "clamp(22px, 3vw, 36px)",
                                            fontWeight: 900,
                                            lineHeight: 1.2,
                                            letterSpacing: "-0.02em",
                                            marginBottom: 12,
                                            maxWidth: 680,
                                        }}
                                    >
                                        {featured.title}
                                    </h2>
                                    <p
                                        style={{
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize: 14,
                                            marginBottom: 16,
                                            maxWidth: 560,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {featured.description}
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <div
                                            className="flex items-center gap-2"
                                            style={{
                                                color: "rgba(255,255,255,0.6)",
                                                fontSize: 12,
                                            }}
                                        >
                                            <Calendar size={13} />
                                            {formatDate(
                                                featured.publishedAt ||
                                                    featured.createdAt,
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {featured.keywords
                                                .split(",")
                                                .slice(0, 2)
                                                .map((kw, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="bg-transparent border-white/30 text-white/70 uppercase"
                                                        style={{
                                                            fontSize: 8,
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        {kw.trim()}
                                                    </Badge>
                                                ))}
                                        </div>
                                        <div
                                            className="ml-auto flex items-center gap-2 font-bold text-sm group-hover:gap-3 transition-all"
                                            style={{ color: "#F5A524" }}
                                        >
                                            Read Article{" "}
                                            <ArrowRight size={15} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rest.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug || post.id}`}
                                className="block group"
                            >
                                <article
                                    style={{
                                        background: "#fff",
                                        border: "1.5px solid #E8E3D9",
                                        borderRadius: 24,
                                        overflow: "hidden",
                                        transition:
                                            "box-shadow .25s, transform .25s",
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                    }}
                                    className="hover:shadow-xl hover:-translate-y-1"
                                >
                                    {/* Image */}
                                    <div
                                        className="relative overflow-hidden"
                                        style={{ aspectRatio: "16/10" }}
                                    >
                                        <PostImage
                                            blog={post}
                                            className="group-hover:scale-105 transition-transform duration-700"
                                        />
                                        {/* Category chip */}
                                        <div className="absolute top-3 left-3">
                                            {post.keywords.split(",")[0] && (
                                                <span
                                                    style={{
                                                        background: "#FFFDF7",
                                                        border: "1px solid #F5A524",
                                                        color: "#7F7F7F",
                                                        borderRadius: 6,
                                                        padding: "4px 10px",
                                                        fontSize: 8,
                                                        fontWeight: 700,
                                                        textTransform:
                                                            "uppercase",
                                                        letterSpacing: "0.12em",
                                                        fontStyle: "italic",
                                                    }}
                                                >
                                                    {post.keywords
                                                        .split(",")[0]
                                                        .trim()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div
                                        style={{
                                            padding: "22px 22px 18px",
                                            flexGrow: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <h3
                                            className="group-hover:text-[#F5A524] transition-colors line-clamp-2"
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 800,
                                                color: "#111",
                                                lineHeight: 1.35,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {post.title}
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                color: "#7C7C7C",
                                                lineHeight: 1.6,
                                                flexGrow: 1,
                                            }}
                                            className="line-clamp-3"
                                        >
                                            {post.description ||
                                                "No description available"}
                                        </p>

                                        {/* Footer */}
                                        <div
                                            style={{
                                                marginTop: 16,
                                                paddingTop: 14,
                                                borderTop: "1px solid #F0EDE8",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <FourPointStar className="w-3.5 h-3.5 text-yellow-400" />
                                                <time
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#aaa",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {new Date(
                                                        post.publishedAt ||
                                                            post.createdAt,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </time>
                                            </div>
                                            <div
                                                className="flex items-center gap-1 font-bold text-xs group-hover:gap-2 transition-all"
                                                style={{ color: "#F5A524" }}
                                            >
                                                Read <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>

                    {/* Load More */}
                    {visiblePosts + 1 < filtered.length && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={() => setVisiblePosts((v) => v + 6)}
                                style={{
                                    border: "2px solid #F5A524",
                                    color: "#F5A524",
                                    background: "transparent",
                                    borderRadius: 14,
                                    padding: "14px 40px",
                                    fontWeight: 800,
                                    fontSize: 14,
                                    letterSpacing: "0.05em",
                                    cursor: "pointer",
                                    transition: "background .2s, color .2s",
                                }}
                                onMouseEnter={(e) => {
                                    (
                                        e.target as HTMLButtonElement
                                    ).style.background = "#F5A524";
                                    (
                                        e.target as HTMLButtonElement
                                    ).style.color = "#fff";
                                }}
                                onMouseLeave={(e) => {
                                    (
                                        e.target as HTMLButtonElement
                                    ).style.background = "transparent";
                                    (
                                        e.target as HTMLButtonElement
                                    ).style.color = "#F5A524";
                                }}
                            >
                                Load More Articles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── NEWSLETTER BANNER ──────────────────────────────── */}
            <div
                style={{
                    margin: "0 24px 48px",
                    background: "#111",
                    borderRadius: 40,
                    padding: "64px 56px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative star */}
                <div
                    style={{
                        position: "absolute",
                        right: 56,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 200,
                        color: "rgba(245,165,36,0.06)",
                        fontWeight: 900,
                        pointerEvents: "none",
                        userSelect: "none",
                        lineHeight: 1,
                    }}
                >
                    ✦
                </div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: 600 }}>
                    <p
                        style={{
                            color: "#F5A524",
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.3em",
                            marginBottom: 12,
                        }}
                    >
                        Stay in the loop
                    </p>
                    <h2
                        style={{
                            color: "#fff",
                            fontSize: "clamp(28px, 4vw, 52px)",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            marginBottom: 16,
                        }}
                    >
                        NEVER MISS A{" "}
                        <span style={{ color: "#F5A524" }}>GREAT READ.</span>
                    </h2>
                    <p
                        style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: 15,
                            marginBottom: 28,
                        }}
                    >
                        Get the latest articles delivered straight to your
                        inbox.
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            style={{
                                flexGrow: 1,
                                minWidth: 220,
                                background: "rgba(255,255,255,0.07)",
                                border: "1.5px solid rgba(255,255,255,0.12)",
                                borderRadius: 14,
                                padding: "14px 20px",
                                color: "#fff",
                                fontSize: 14,
                                outline: "none",
                            }}
                        />
                        <button
                            style={{
                                background: "#F5A524",
                                color: "#fff",
                                border: "none",
                                borderRadius: 14,
                                padding: "14px 28px",
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
