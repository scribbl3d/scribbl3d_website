"use client";

import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Calendar,
    ChevronDown,
    ImageIcon,
    Search,
    TrendingUp,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FourPointStar } from "./icons/four-point-star";

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
            <ImageIcon className="w-8 h-8 text-[#C4B89A]" />
        </div>
    );
}

// Compact horizontal card — thumbnail left, text right. Used on mobile when list is long.
function PostCardCompact({ post }: { post: BlogPost }) {
    const src = post.thumbnailImage || post.heroImage;
    const [failed, setFailed] = useState(false);
    const date = new Date(
        post.publishedAt || post.createdAt,
    ).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return (
        <Link
            href={`/blog/${post.slug || post.id}`}
            className="block group active:scale-[0.99]"
        >
            <article
                style={{
                    background: "#fff",
                    border: "1.5px solid #E8E3D9",
                    borderRadius: 18,
                    overflow: "hidden",
                    display: "flex",
                    transition: "box-shadow .2s",
                }}
                className="hover:shadow-md"
            >
                {/* Square thumbnail */}
                <div
                    className="relative flex-shrink-0"
                    style={{ width: 96, height: 96 }}
                >
                    {src && !failed ? (
                        <Image
                            src={src}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                            onError={() => setFailed(true)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full w-full bg-[#F0EDE8]">
                            <ImageIcon className="w-6 h-6 text-[#C4B89A]" />
                        </div>
                    )}
                </div>
                {/* Text */}
                <div
                    style={{
                        padding: "13px 15px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <div>
                        <span
                            style={{
                                display: "inline-block",
                                fontSize: 8,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                color: "#4f46e5",
                                marginBottom: 4,
                                fontStyle: "italic",
                            }}
                        >
                            {post.keywords.split(",")[0].trim()}
                        </span>
                        <h3
                            className="line-clamp-2 group-hover:text-[#4f46e5] transition-colors"
                            style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#111",
                                lineHeight: 1.35,
                            }}
                        >
                            {post.title}
                        </h3>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <time
                            style={{
                                fontSize: 10,
                                color: "#aaa",
                                fontWeight: 600,
                            }}
                        >
                            {date}
                        </time>
                        <div
                            className="flex items-center gap-0.5 font-bold group-hover:gap-1.5 transition-all"
                            style={{ fontSize: 10, color: "#4f46e5" }}
                        >
                            Read <ArrowRight size={10} />
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}

const PAGE_SIZE = 6;
const KEYWORD_PREVIEW = 5;

export default function BlogList() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [visiblePosts, setVisiblePosts] = useState(PAGE_SIZE);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeKeyword, setActiveKeyword] = useState("All");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [showAllKeywords, setShowAllKeywords] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        fetch("/api/blogs")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setBlogs)
            .catch(console.error);
    }, []);

    // Reset pagination when filter/search changes
    useEffect(() => {
        setVisiblePosts(PAGE_SIZE);
    }, [activeKeyword, searchQuery]);

    const publishedBlogs = blogs.filter((b) => b.published === true);
    const allKeywords = getAllKeywords(publishedBlogs);
    const hasMoreKeywords = allKeywords.length > KEYWORD_PREVIEW + 1;
    const visibleKeywords = showAllKeywords
        ? allKeywords
        : allKeywords.slice(0, KEYWORD_PREVIEW + 1);

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

    const explicitFeatured = filtered.find((b) => b.featured === true);
    const featured = explicitFeatured || filtered[0];
    const rest = filtered.filter((b) => b.id !== featured?.id);
    const visibleRest = rest.slice(0, visiblePosts);
    const hasMore = visiblePosts < rest.length;

    // When there are >6 non-featured posts, mobile uses compact list view
    const useMobileList = rest.length > 6;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    const formatDateShort = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

    return (
        <div
            className="min-h-screen"
            style={{ fontFamily: "'Lato', sans-serif", background: "#FAFAF7" }}
        >
            {/* ── HERO HEADER ── */}
            <div
                className="px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-0"
                style={{ borderBottom: "2px solid #E8E3D9" }}
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
                    <div>
                        <p
                            className="uppercase tracking-[0.35em] text-xs mb-2"
                            style={{ color: "#4f46e5", fontWeight: 700 }}
                        >
                            Our Editorial
                        </p>
                        <h1
                            className="leading-none tracking-tighter"
                            style={{
                                fontFamily: "'Lato', sans-serif",
                                fontSize: "clamp(40px, 10vw, 96px)",
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
                                fontSize: 14,
                                marginTop: 8,
                                maxWidth: 480,
                                lineHeight: 1.5,
                            }}
                        >
                            Thoughts, insights, and ideas — freshly curated for
                            curious minds.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80 flex-shrink-0 mb-2 md:mb-0">
                        <Search
                            size={15}
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            style={{
                                color: searchFocused ? "#4f46e5" : "#aaa",
                                transition: "color .2s",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search articles…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            style={{
                                width: "100%",
                                paddingLeft: 40,
                                paddingRight: searchQuery ? 40 : 20,
                                paddingTop: 13,
                                paddingBottom: 13,
                                border: searchFocused
                                    ? "1.5px solid #4f46e5"
                                    : "1.5px solid #E8E3D9",
                                borderRadius: 14,
                                background: "#fff",
                                fontSize: 14,
                                color: "#111",
                                outline: "none",
                                transition: "border-color .2s",
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                style={{ color: "#aaa" }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── MOBILE KEYWORD PILLS — wraps, never overflows ── */}
                <div className="lg:hidden pt-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {visibleKeywords.map((kw) => (
                            <button
                                key={kw}
                                onClick={() => setActiveKeyword(kw)}
                                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                                style={{
                                    background:
                                        activeKeyword === kw
                                            ? "#4f46e5"
                                            : "#fff",
                                    color:
                                        activeKeyword === kw ? "#fff" : "#555",
                                    border:
                                        activeKeyword === kw
                                            ? "1.5px solid #4f46e5"
                                            : "1.5px solid #E8E3D9",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {kw}
                            </button>
                        ))}
                        {hasMoreKeywords && (
                            <button
                                onClick={() => setShowAllKeywords((v) => !v)}
                                className="px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{
                                    background: "#F0EDE8",
                                    color: "#888",
                                    border: "1.5px solid #E8E3D9",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {showAllKeywords
                                    ? "Less ↑"
                                    : `+${allKeywords.length - KEYWORD_PREVIEW - 1} more`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MOBILE FILTER BOTTOM SHEET ── */}
            {mobileFilterOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 lg:hidden"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                        onClick={() => setMobileFilterOpen(false)}
                    />
                    <div
                        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                        style={{
                            background: "#fff",
                            borderRadius: "28px 28px 0 0",
                            padding: "24px 24px 40px",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <p
                                className="font-black text-base"
                                style={{ color: "#111" }}
                            >
                                Filter by Topic
                            </p>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                style={{
                                    background: "#F0EDE8",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={14} style={{ color: "#666" }} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allKeywords.map((kw) => (
                                <button
                                    key={kw}
                                    onClick={() => {
                                        setActiveKeyword(kw);
                                        setMobileFilterOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                                    style={{
                                        background:
                                            activeKeyword === kw
                                                ? "#4f46e5"
                                                : "#FAFAF7",
                                        color:
                                            activeKeyword === kw
                                                ? "#fff"
                                                : "#444",
                                        border:
                                            activeKeyword === kw
                                                ? "1.5px solid #4f46e5"
                                                : "1.5px solid #E8E3D9",
                                    }}
                                >
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── MAIN LAYOUT ── */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 pb-16 sm:pb-20">
                {/* ── SIDEBAR (desktop only) ── */}
                <aside className="hidden lg:block lg:w-[260px] flex-shrink-0">
                    <div className="sticky top-28 space-y-6">
                        <div
                            style={{
                                background: "#fff",
                                border: "1.5px solid #E8E3D9",
                                borderRadius: 24,
                                padding: 24,
                            }}
                        >
                            <p
                                className="uppercase tracking-widest text-xs mb-4 font-bold"
                                style={{ color: "#4f46e5" }}
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
                                        padding: "11px 40px 11px 16px",
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

                        {publishedBlogs.length > 0 && (
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1.5px solid #E8E3D9",
                                    borderRadius: 24,
                                    padding: 24,
                                }}
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <TrendingUp
                                        size={14}
                                        style={{ color: "#4f46e5" }}
                                    />
                                    <p
                                        className="uppercase tracking-widest text-xs font-bold"
                                        style={{ color: "#4f46e5" }}
                                    >
                                        Trending
                                    </p>
                                </div>
                                <div className="space-y-5">
                                    {publishedBlogs
                                        .slice(0, 4)
                                        .map((post, idx) => (
                                            <Link
                                                key={post.id}
                                                href={`/blog/${post.slug || post.id}`}
                                                className="flex gap-3 group"
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 24,
                                                        fontWeight: 900,
                                                        lineHeight: 1,
                                                        color: "#E8E3D9",
                                                        flexShrink: 0,
                                                        transition: "color .2s",
                                                    }}
                                                    className="group-hover:text-[#4f46e5]"
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
                                                        className="group-hover:text-[#4f46e5] transition-colors line-clamp-2"
                                                    >
                                                        {post.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#aaa",
                                                            marginTop: 3,
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

                {/* ── CONTENT ── */}
                <div className="flex-1 min-w-0">
                    {/* ── MOBILE TRENDING — compact horizontal scroll, max 3 ── */}
                    {publishedBlogs.length > 0 && (
                        <div className="lg:hidden mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp
                                    size={13}
                                    style={{ color: "#4f46e5" }}
                                />
                                <p
                                    className="uppercase tracking-widest text-xs font-bold"
                                    style={{ color: "#4f46e5" }}
                                >
                                    Trending
                                </p>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                                {publishedBlogs.slice(0, 3).map((post, idx) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug || post.id}`}
                                        className="flex-shrink-0 group"
                                        style={{
                                            width: 185,
                                            background: "#fff",
                                            border: "1.5px solid #E8E3D9",
                                            borderRadius: 16,
                                            padding: "13px 14px",
                                            display: "flex",
                                            gap: 10,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 21,
                                                fontWeight: 900,
                                                lineHeight: 1,
                                                color: "#E8E3D9",
                                                flexShrink: 0,
                                                transition: "color .2s",
                                            }}
                                            className="group-hover:text-[#4f46e5]"
                                        >
                                            0{idx + 1}
                                        </span>
                                        <div>
                                            <p
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    lineHeight: 1.4,
                                                    color: "#222",
                                                }}
                                                className="group-hover:text-[#4f46e5] transition-colors line-clamp-2"
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
                                                {formatDateShort(
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

                    {/* ── FEATURED POST ── */}
                    {featured && (
                        <Link
                            href={`/blog/${featured.slug || featured.id}`}
                            className="block mb-7 sm:mb-10"
                        >
                            <div
                                className="relative overflow-hidden group"
                                style={{
                                    borderRadius: "clamp(18px, 4vw, 32px)",
                                    height: "clamp(240px, 48vw, 460px)",
                                    background: "#E8E3D9",
                                }}
                            >
                                <div className="absolute inset-0">
                                    <PostImage
                                        blog={featured}
                                        className="group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background:
                                            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                                    }}
                                />
                                <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                                    <span
                                        style={{
                                            background: "#4f46e5",
                                            color: "#fff",
                                            borderRadius: 8,
                                            padding: "5px 12px",
                                            fontSize: 9,
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
                                <div
                                    className="absolute bottom-0 left-0 right-0"
                                    style={{
                                        padding: "clamp(16px, 4vw, 40px)",
                                    }}
                                >
                                    <h2
                                        style={{
                                            color: "#fff",
                                            fontSize:
                                                "clamp(17px, 3.5vw, 36px)",
                                            fontWeight: 900,
                                            lineHeight: 1.2,
                                            letterSpacing: "-0.02em",
                                            marginBottom: 8,
                                            maxWidth: 680,
                                        }}
                                    >
                                        {featured.title}
                                    </h2>
                                    <p
                                        style={{
                                            color: "rgba(255,255,255,0.7)",
                                            fontSize:
                                                "clamp(11px, 1.5vw, 14px)",
                                            marginBottom: 12,
                                            maxWidth: 560,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {featured.description}
                                    </p>
                                    <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                                        <div
                                            className="flex items-center gap-1.5"
                                            style={{
                                                color: "rgba(255,255,255,0.6)",
                                                fontSize: 11,
                                            }}
                                        >
                                            <Calendar size={11} />
                                            {formatDateShort(
                                                featured.publishedAt ||
                                                    featured.createdAt,
                                            )}
                                        </div>
                                        <div className="hidden sm:flex gap-2">
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
                                            className="ml-auto flex items-center gap-1.5 font-bold group-hover:gap-2.5 transition-all"
                                            style={{
                                                color: "#fff",
                                                fontSize:
                                                    "clamp(11px, 1.5vw, 14px)",
                                                background:
                                                    "rgba(79, 70, 229, 0.75)",
                                                backdropFilter: "blur(8px)",
                                                WebkitBackdropFilter:
                                                    "blur(8px)",
                                                padding: "7px 16px",
                                                borderRadius: 10,
                                                border: "1px solid rgba(255,255,255,0.15)",
                                            }}
                                        >
                                            Read Article{" "}
                                            <ArrowRight size={13} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* ── RESULT COUNT BAR (appears when filtering or many posts) ── */}
                    {(searchQuery ||
                        activeKeyword !== "All" ||
                        filtered.length > 6) &&
                        filtered.length > 0 && (
                            <div
                                className="flex items-center justify-between mb-5"
                                style={{
                                    borderBottom: "1px solid #F0EDE8",
                                    paddingBottom: 14,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#999",
                                        fontWeight: 600,
                                    }}
                                >
                                    {searchQuery
                                        ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${searchQuery}"`
                                        : activeKeyword !== "All"
                                          ? `${filtered.length} article${filtered.length !== 1 ? "s" : ""} in "${activeKeyword}"`
                                          : `${filtered.length} articles total`}
                                </p>
                                {(searchQuery || activeKeyword !== "All") && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveKeyword("All");
                                        }}
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#4f46e5",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                    {/* ── EMPTY STATE ── */}
                    {filtered.length === 0 && (
                        <div className="text-center py-20">
                            <div
                                style={{
                                    fontSize: 40,
                                    marginBottom: 16,
                                    opacity: 0.3,
                                }}
                            >
                                ◎
                            </div>
                            <p
                                style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "#111",
                                    marginBottom: 6,
                                }}
                            >
                                No articles found
                            </p>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "#999",
                                    marginBottom: 20,
                                }}
                            >
                                Try a different search or topic
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveKeyword("All");
                                }}
                                style={{
                                    border: "2px solid #4f46e5",
                                    color: "#4f46e5",
                                    background: "transparent",
                                    borderRadius: 12,
                                    padding: "10px 24px",
                                    fontWeight: 800,
                                    fontSize: 13,
                                    cursor: "pointer",
                                }}
                            >
                                Clear filters
                            </button>
                        </div>
                    )}

                    {/* ── GRID (desktop always; mobile only when ≤6 rest posts) ── */}
                    {rest.length > 0 && (
                        <div
                            className={
                                useMobileList ? "hidden sm:grid" : "grid"
                            }
                            style={{
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(260px, 1fr))",
                                gap: "clamp(14px, 2vw, 24px)",
                            }}
                        >
                            {visibleRest.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug || post.id}`}
                                    className="block group"
                                >
                                    <article
                                        style={{
                                            background: "#fff",
                                            border: "1.5px solid #E8E3D9",
                                            borderRadius: 20,
                                            overflow: "hidden",
                                            transition:
                                                "box-shadow .25s, transform .25s",
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                        }}
                                        className="hover:shadow-xl hover:-translate-y-1 active:scale-[0.99]"
                                    >
                                        <div
                                            className="relative overflow-hidden"
                                            style={{ aspectRatio: "16/9" }}
                                        >
                                            <PostImage
                                                blog={post}
                                                className="group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-3 left-3">
                                                {post.keywords.split(
                                                    ",",
                                                )[0] && (
                                                    <span
                                                        style={{
                                                            background:
                                                                "#eef2ff",
                                                            border: "1px solid #4f46e5",
                                                            color: "#6366f1",
                                                            borderRadius: 6,
                                                            padding: "4px 9px",
                                                            fontSize: 8,
                                                            fontWeight: 700,
                                                            textTransform:
                                                                "uppercase",
                                                            letterSpacing:
                                                                "0.12em",
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
                                        <div
                                            style={{
                                                padding: "18px 18px 16px",
                                                flexGrow: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                        >
                                            <h3
                                                className="group-hover:text-[#4f46e5] transition-colors line-clamp-2"
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 800,
                                                    color: "#111",
                                                    lineHeight: 1.35,
                                                    marginBottom: 7,
                                                }}
                                            >
                                                {post.title}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: 12,
                                                    color: "#7C7C7C",
                                                    lineHeight: 1.6,
                                                    flexGrow: 1,
                                                }}
                                                className="line-clamp-3"
                                            >
                                                {post.description ||
                                                    "No description available"}
                                            </p>
                                            <div
                                                style={{
                                                    marginTop: 14,
                                                    paddingTop: 12,
                                                    borderTop:
                                                        "1px solid #F0EDE8",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                    }}
                                                >
                                                    <FourPointStar className="w-3 h-3 text-indigo-400" />
                                                    <time
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#aaa",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {formatDateShort(
                                                            post.publishedAt ||
                                                                post.createdAt,
                                                        )}
                                                    </time>
                                                </div>
                                                <div
                                                    className="flex items-center gap-1 font-bold text-xs group-hover:gap-2 transition-all"
                                                    style={{ color: "#4f46e5" }}
                                                >
                                                    Read{" "}
                                                    <ArrowRight size={11} />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* ── MOBILE COMPACT LIST (only when >6 rest posts, hidden on sm+) ── */}
                    {useMobileList && rest.length > 0 && (
                        <div className="sm:hidden space-y-3">
                            {visibleRest.map((post, idx) => (
                                <div key={post.id}>
                                    {/* Subtle section break every 6 items */}
                                    {idx > 0 && idx % 6 === 0 && (
                                        <div
                                            className="flex items-center gap-3 my-5"
                                            style={{ opacity: 0.45 }}
                                        >
                                            <div
                                                style={{
                                                    flex: 1,
                                                    height: 1,
                                                    background: "#E8E3D9",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 800,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.2em",
                                                    color: "#bbb",
                                                }}
                                            >
                                                More reads
                                            </span>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    height: 1,
                                                    background: "#E8E3D9",
                                                }}
                                            />
                                        </div>
                                    )}
                                    <PostCardCompact post={post} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── LOAD MORE with progress bar ── */}
                    {hasMore && (
                        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
                            <div className="w-full max-w-xs">
                                <div
                                    style={{
                                        height: 3,
                                        background: "#E8E3D9",
                                        borderRadius: 99,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            background: "#4f46e5",
                                            borderRadius: 99,
                                            width: `${(Math.min(visiblePosts, rest.length) / rest.length) * 100}%`,
                                            transition: "width .4s ease",
                                        }}
                                    />
                                </div>
                                <p
                                    className="text-center mt-2"
                                    style={{
                                        fontSize: 11,
                                        color: "#aaa",
                                        fontWeight: 600,
                                    }}
                                >
                                    Showing{" "}
                                    {Math.min(visiblePosts, rest.length)} of{" "}
                                    {rest.length} articles
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setVisiblePosts((v) => v + PAGE_SIZE)
                                }
                                style={{
                                    border: "2px solid #4f46e5",
                                    color: "#4f46e5",
                                    background: "transparent",
                                    borderRadius: 14,
                                    padding: "13px 32px",
                                    fontWeight: 800,
                                    fontSize: 13,
                                    letterSpacing: "0.05em",
                                    cursor: "pointer",
                                    transition: "background .2s, color .2s",
                                    width: "100%",
                                    maxWidth: 320,
                                }}
                                onMouseEnter={(e) => {
                                    (
                                        e.target as HTMLButtonElement
                                    ).style.background = "#4f46e5";
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
                                    ).style.color = "#4f46e5";
                                }}
                            >
                                Load More Articles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── NEWSLETTER BANNER ── */}
            <div
                style={{
                    margin: "0 12px 32px",
                    background: "#111",
                    borderRadius: "clamp(20px, 5vw, 40px)",
                    padding: "clamp(32px, 6vw, 64px) clamp(20px, 5vw, 56px)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        right: "clamp(16px, 5vw, 56px)",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "clamp(80px, 20vw, 200px)",
                        color: "rgba(79,70,229,0.08)",
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
                            color: "#a5b4fc",
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.3em",
                            marginBottom: 10,
                        }}
                    >
                        Stay in the loop
                    </p>
                    <h2
                        style={{
                            color: "#fff",
                            fontSize: "clamp(22px, 5vw, 52px)",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            marginBottom: 12,
                        }}
                    >
                        NEVER MISS A{" "}
                        <span style={{ color: "#818cf8" }}>GREAT READ.</span>
                    </h2>
                    <p
                        style={{
                            color: "rgba(255,255,255,0.5)",
                            fontSize: "clamp(13px, 2vw, 15px)",
                            marginBottom: 24,
                            lineHeight: 1.5,
                        }}
                    >
                        Get the latest articles delivered straight to your
                        inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            style={{
                                flexGrow: 1,
                                background: "rgba(255,255,255,0.07)",
                                border: "1.5px solid rgba(255,255,255,0.12)",
                                borderRadius: 14,
                                padding: "13px 18px",
                                color: "#fff",
                                fontSize: 14,
                                outline: "none",
                                width: "100%",
                            }}
                        />
                        <button
                            style={{
                                background: "#4f46e5",
                                color: "#fff",
                                border: "none",
                                borderRadius: 14,
                                padding: "13px 28px",
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                            }}
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
