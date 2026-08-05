"use client";

import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Calendar,
    ChevronRight,
    ImageIcon,
    List,
    Share2,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface BlogPost {
    id: string;
    slug?: string | null;
    title: string;
    content: string;
    description?: string | null;
    keywords: string;
    thumbnailImage?: string | null;
    heroImage?: string | null;
    published: boolean;
    publishedAt?: string | null;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BlogPostLayoutProps {
    slug: string;
}

function parseToc(html: string) {
    const entries: { id: string; text: string; level: number }[] = [];
    const re = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
        entries.push({
            level: Number(m[1]),
            id: m[2],
            text: m[3].replace(/<[^>]+>/g, ""),
        });
    }
    return entries;
}

function HeroImage({ src, alt }: { src: string | null; alt: string }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "#E8E3D9" }}
            >
                <ImageIcon className="w-16 h-16" style={{ color: "#C4B89A" }} />
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setFailed(true)}
        />
    );
}

export default function BlogPostLayout({ slug }: BlogPostLayoutProps) {
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSection, setActiveSection] = useState<string>("");
    const [mobileTocOpen, setMobileTocOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/blogs/${slug}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setBlog)
            .catch(console.error);
        fetch("/api/blogs")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setAllBlogs)
            .catch(console.error);
    }, [slug]);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;
            setScrollProgress(
                docHeight > 0 ? (scrollTop / docHeight) * 100 : 0,
            );
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id);
                });
            },
            { rootMargin: "-100px 0px -60% 0px" },
        );
        const headers = document.querySelectorAll("h2, h3");
        headers.forEach((h) => observer.observe(h));
        return () => observer.disconnect();
    }, [blog?.content]);

    const toc = useMemo(
        () => (blog?.content ? parseToc(blog.content) : []),
        [blog?.content],
    );

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({ title: blog?.title || "", url: window.location.href })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    if (!blog) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: "#FAFAF7",
                    fontFamily: "'Lato', sans-serif",
                }}
            >
                <div className="text-center">
                    <p
                        style={{
                            fontSize: 14,
                            color: "#aaa",
                            marginBottom: 16,
                        }}
                    >
                        Loading article…
                    </p>
                    <div
                        style={{
                            width: 48,
                            height: 3,
                            background: "#4f46e5",
                            borderRadius: 99,
                            margin: "0 auto",
                            animation: "pulse 1.4s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>
        );
    }

    const publishedBlogs = allBlogs.filter((b) => b.published);
    const currentIndex = publishedBlogs.findIndex((b) => b.id === blog.id);
    const prevBlog = currentIndex > 0 ? publishedBlogs[currentIndex - 1] : null;
    const nextBlog =
        currentIndex < publishedBlogs.length - 1
            ? publishedBlogs[currentIndex + 1]
            : null;

    const heroSrc = blog.heroImage || blog.thumbnailImage || null;
    const keywordArray = (blog.keywords || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
    const relatedPosts = publishedBlogs
        .filter((b) => b.id !== blog.id)
        .slice(0, 2);

    const estimatedReadTime = Math.max(
        1,
        Math.ceil(
            blog.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 200,
        ),
    );

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#FAFAF7",
                fontFamily: "'Lato', sans-serif",
            }}
        >
            {/* ── READING PROGRESS BAR ── */}
            <div
                className="fixed top-0 left-0 right-0 z-[100]"
                style={{ height: 3, background: "rgba(0,0,0,0.06)" }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${scrollProgress}%`,
                        background: "#4f46e5",
                        transition: "width 0.15s ease",
                        borderRadius: "0 99px 99px 0",
                    }}
                />
            </div>

            {/* ── MOBILE STICKY HEADER (appears after scroll) ── */}
            <div
                className="fixed top-0 left-0 right-0 z-50 lg:hidden"
                style={{
                    background: "rgba(250,250,247,0.96)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #E8E3D9",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transform:
                        scrollProgress > 3
                            ? "translateY(0)"
                            : "translateY(-100%)",
                    transition: "transform .3s ease",
                }}
            >
                <Link
                    href="/blog"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#888",
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        textDecoration: "none",
                        flexShrink: 0,
                    }}
                >
                    <ArrowLeft size={13} />
                </Link>
                <p
                    className="line-clamp-1"
                    style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#111",
                        letterSpacing: "-0.01em",
                    }}
                >
                    {blog.title}
                </p>
                {toc.length > 0 && (
                    <button
                        onClick={() => setMobileTocOpen(true)}
                        style={{
                            background: "none",
                            border: "1.5px solid #E8E3D9",
                            borderRadius: 8,
                            padding: "5px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            color: "#666",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        <List size={12} /> Contents
                    </button>
                )}
            </div>

            {/* ── MOBILE TOC DRAWER ── */}
            {mobileTocOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 lg:hidden"
                        style={{ background: "rgba(0,0,0,0.45)" }}
                        onClick={() => setMobileTocOpen(false)}
                    />
                    <div
                        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                        style={{
                            background: "#fff",
                            borderRadius: "24px 24px 0 0",
                            padding: "24px 20px 40px",
                            boxShadow: "0 -8px 40px rgba(0,0,0,0.14)",
                            maxHeight: "75vh",
                            overflow: "auto",
                        }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <p
                                style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3em",
                                    color: "#4f46e5",
                                }}
                            >
                                Contents
                            </p>
                            <button
                                onClick={() => setMobileTocOpen(false)}
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
                        <nav
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            {toc.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMobileTocOpen(false);
                                        setTimeout(() => {
                                            document
                                                .getElementById(item.id)
                                                ?.scrollIntoView({
                                                    behavior: "smooth",
                                                    block: "start",
                                                });
                                        }, 200);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "11px 12px",
                                        borderRadius: 12,
                                        fontSize: item.level === 3 ? 13 : 15,
                                        fontWeight: 700,
                                        paddingLeft: item.level === 3 ? 28 : 12,
                                        color:
                                            activeSection === item.id
                                                ? "#4f46e5"
                                                : "#333",
                                        background:
                                            activeSection === item.id
                                                ? "#eef2ff"
                                                : "transparent",
                                        textDecoration: "none",
                                        borderLeft:
                                            activeSection === item.id
                                                ? "3px solid #4f46e5"
                                                : "3px solid transparent",
                                    }}
                                >
                                    <ChevronRight
                                        size={12}
                                        style={{
                                            opacity:
                                                activeSection === item.id
                                                    ? 1
                                                    : 0.3,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span>{item.text}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                </>
            )}

            {/* ── HERO ── */}
            <div
                className="relative w-full overflow-hidden"
                style={{ height: "clamp(320px, 65vw, 78vh)", minHeight: 320 }}
            >
                <HeroImage src={heroSrc} alt={blog.title} />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)",
                    }}
                />

                {/* Hero content */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                        padding:
                            "clamp(16px, 4vw, 56px) clamp(16px, 4vw, 40px)",
                    }}
                >
                    <div style={{ maxWidth: 900, margin: "0 auto" }}>
                        {/* Back link — large tap target on mobile */}
                        <Link
                            href="/blog"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                color: "rgba(255,255,255,0.7)",
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.2em",
                                marginBottom: "clamp(16px, 3vw, 28px)",
                                textDecoration: "none",
                                padding: "8px 0",
                            }}
                            className="hover:text-white transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to Blog
                        </Link>

                        {/* Keywords */}
                        {keywordArray.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 6,
                                    marginBottom: "clamp(12px, 2vw, 18px)",
                                    flexWrap: "wrap",
                                }}
                            >
                                {keywordArray.slice(0, 3).map((kw) => (
                                    <span
                                        key={kw}
                                        style={{
                                            background: "#4f46e5",
                                            color: "#fff",
                                            borderRadius: 6,
                                            padding: "4px 11px",
                                            fontSize: 9,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                        }}
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1
                            style={{
                                color: "#fff",
                                fontSize: "clamp(22px, 5vw, 60px)",
                                fontWeight: 900,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                                marginBottom: "clamp(14px, 2vw, 24px)",
                                maxWidth: 820,
                            }}
                        >
                            {blog.title}
                        </h1>

                        {/* Meta row */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    color: "rgba(255,255,255,0.75)",
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                <Calendar size={14} />
                                {new Date(
                                    blog.publishedAt || blog.createdAt,
                                ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    color: "rgba(255,255,255,0.5)",
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}
                            >
                                <span
                                    style={{
                                        width: 3,
                                        height: 3,
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.4)",
                                        display: "inline-block",
                                    }}
                                />
                                {estimatedReadTime} min read
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE: Floating TOC button (visible while reading) ── */}
            {toc.length > 0 && (
                <div
                    className="lg:hidden"
                    style={{
                        position: "sticky",
                        top: 48,
                        zIndex: 30,
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "100%",
                            padding: "10px 16px",
                            display: "flex",
                            justifyContent: "flex-end",
                            pointerEvents: "none",
                        }}
                    >
                        <button
                            onClick={() => setMobileTocOpen(true)}
                            style={{
                                pointerEvents: "auto",
                                background: "#111",
                                color: "#fff",
                                border: "none",
                                borderRadius: 40,
                                padding: "9px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                                letterSpacing: "0.03em",
                                opacity:
                                    scrollProgress > 5 && scrollProgress < 95
                                        ? 1
                                        : 0,
                                transform:
                                    scrollProgress > 5 && scrollProgress < 95
                                        ? "translateY(0) scale(1)"
                                        : "translateY(4px) scale(0.95)",
                                transition: "opacity .3s, transform .3s",
                            }}
                        >
                            <List size={13} />
                            Contents
                            <span
                                style={{
                                    background: "#4f46e5",
                                    borderRadius: 99,
                                    padding: "1px 7px",
                                    fontSize: 10,
                                    fontWeight: 900,
                                }}
                            >
                                {toc.length}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── BODY ── */}
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding:
                        "clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px) 80px",
                }}
            >
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                    {/* ── ARTICLE ── */}
                    <article className="lg:w-[65%] min-w-0">
                        <div
                            ref={contentRef}
                            className="blog-content"
                            style={{
                                color: "#333",
                                fontSize: "clamp(15px, 1.8vw, 17px)",
                                lineHeight: 1.85,
                            }}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* ── POST FOOTER ── */}
                        <div
                            style={{
                                marginTop: 56,
                                paddingTop: 28,
                                borderTop: "1.5px solid #E8E3D9",
                            }}
                        >
                            {/* Tags */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                    marginBottom: 20,
                                }}
                            >
                                {keywordArray.slice(0, 5).map((kw) => (
                                    <span
                                        key={kw}
                                        style={{
                                            padding: "7px 14px",
                                            background: "#F0EDE8",
                                            borderRadius: 8,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#7C7C7C",
                                            cursor: "pointer",
                                        }}
                                    >
                                        #{kw}
                                    </span>
                                ))}
                            </div>

                            {/* Share row */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.2em",
                                        color: "#aaa",
                                    }}
                                >
                                    Share
                                </span>
                                <button
                                    onClick={handleShare}
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: "50%",
                                        border: "1.5px solid #E8E3D9",
                                        background: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "#888",
                                        transition: "all .2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.background = "#4f46e5";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.color = "#fff";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.borderColor = "#4f46e5";
                                    }}
                                    onMouseLeave={(e) => {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.background = "#fff";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.color = "#888";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.borderColor = "#E8E3D9";
                                    }}
                                >
                                    <Share2 size={16} />
                                </button>
                                <button
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: "50%",
                                        border: "1.5px solid #E8E3D9",
                                        background: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        color: "#888",
                                        transition: "all .2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.background = "#4f46e5";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.color = "#fff";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.borderColor = "#4f46e5";
                                    }}
                                    onMouseLeave={(e) => {
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.background = "#fff";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.color = "#888";
                                        (
                                            e.currentTarget as HTMLButtonElement
                                        ).style.borderColor = "#E8E3D9";
                                    }}
                                >
                                    <Bookmark size={16} />
                                </button>
                                {copied && (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#4f46e5",
                                        }}
                                    >
                                        Link copied!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── PREV / NEXT ── */}
                        <div
                            style={{
                                marginTop: 40,
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                            className="sm:grid sm:grid-cols-2"
                        >
                            {prevBlog && prevBlog.slug ? (
                                <Link
                                    href={`/blog/${prevBlog.slug}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div
                                        style={{
                                            border: "1.5px solid #E8E3D9",
                                            borderRadius: 20,
                                            padding: "18px 20px",
                                            background: "#fff",
                                            cursor: "pointer",
                                            transition: "all .2s",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 6,
                                        }}
                                        className="hover:border-[#4f46e5] hover:shadow-md"
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            <ArrowLeft
                                                size={12}
                                                style={{
                                                    color: "#aaa",
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <p
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.2em",
                                                    color: "#aaa",
                                                }}
                                            >
                                                Previous
                                            </p>
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 800,
                                                color: "#111",
                                                lineHeight: 1.4,
                                            }}
                                            className="line-clamp-2"
                                        >
                                            {prevBlog.title}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <div className="hidden sm:block" />
                            )}

                            {nextBlog && nextBlog.slug ? (
                                <Link
                                    href={`/blog/${nextBlog.slug}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div
                                        style={{
                                            border: "1.5px solid #E8E3D9",
                                            borderRadius: 20,
                                            padding: "18px 20px",
                                            background: "#fff",
                                            cursor: "pointer",
                                            transition: "all .2s",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 6,
                                        }}
                                        className="hover:border-[#4f46e5] hover:shadow-md sm:text-right"
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                justifyContent: "flex-end",
                                            }}
                                            className="sm:justify-end"
                                        >
                                            <p
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.2em",
                                                    color: "#aaa",
                                                }}
                                            >
                                                Next
                                            </p>
                                            <ArrowRight
                                                size={12}
                                                style={{
                                                    color: "#aaa",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 800,
                                                color: "#111",
                                                lineHeight: 1.4,
                                            }}
                                            className="line-clamp-2"
                                        >
                                            {nextBlog.title}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <div className="hidden sm:block" />
                            )}
                        </div>

                        {/* ── MOBILE: Related + More Articles (inline after article) ── */}
                        <div className="lg:hidden mt-12 space-y-8">
                            {relatedPosts.length > 0 && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.3em",
                                            color: "#4f46e5",
                                            marginBottom: 14,
                                        }}
                                    >
                                        Related Articles
                                    </p>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 12,
                                        }}
                                    >
                                        {relatedPosts.filter(r => r.slug).map((related) => {
                                            const relSrc =
                                                related.thumbnailImage ||
                                                related.heroImage ||
                                                null;
                                            return (
                                                <Link
                                                    key={related.id}
                                                    href={`/blog/${related.slug}`}
                                                    style={{
                                                        textDecoration: "none",
                                                    }}
                                                    className="group"
                                                >
                                                    <div
                                                        style={{
                                                            borderRadius: 14,
                                                            overflow: "hidden",
                                                            aspectRatio: "16/9",
                                                            background:
                                                                "#E8E3D9",
                                                            position:
                                                                "relative",
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        {relSrc ? (
                                                            <img
                                                                src={relSrc}
                                                                alt={
                                                                    related.title
                                                                }
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                    transition:
                                                                        "transform .4s",
                                                                }}
                                                                className="group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <ImageIcon
                                                                    style={{
                                                                        color: "#C4B89A",
                                                                        width: 24,
                                                                        height: 24,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: 12,
                                                            fontWeight: 800,
                                                            color: "#111",
                                                            lineHeight: 1.35,
                                                        }}
                                                        className="group-hover:text-[#4f46e5] transition-colors line-clamp-2"
                                                    >
                                                        {related.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#aaa",
                                                            marginTop: 3,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {new Date(
                                                            related.publishedAt ||
                                                                related.createdAt,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                            },
                                                        )}
                                                    </p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* More articles mini-list on mobile */}
                            {publishedBlogs.length > 1 && (
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1.5px solid #E8E3D9",
                                        borderRadius: 20,
                                        padding: "20px 18px",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.3em",
                                            color: "#4f46e5",
                                            marginBottom: 14,
                                        }}
                                    >
                                        More Articles
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                        }}
                                    >
                                        {publishedBlogs.filter(b => b.slug).slice(0, 5).map((b) => (
                                            <Link
                                                key={b.id}
                                                href={`/blog/${b.slug}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "10px 10px",
                                                    borderRadius: 10,
                                                    background:
                                                        b.id === blog.id
                                                            ? "#eef2ff"
                                                            : "transparent",
                                                    border:
                                                        b.id === blog.id
                                                            ? "1.5px solid #4f46e5"
                                                            : "1.5px solid transparent",
                                                    textDecoration: "none",
                                                    transition: "all .2s",
                                                }}
                                                className="group hover:bg-[#eef2ff]"
                                            >
                                                <div
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background:
                                                            b.id === blog.id
                                                                ? "#4f46e5"
                                                                : "#E8E3D9",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight:
                                                            b.id === blog.id
                                                                ? 800
                                                                : 600,
                                                        color:
                                                            b.id === blog.id
                                                                ? "#4f46e5"
                                                                : "#444",
                                                        lineHeight: 1.35,
                                                    }}
                                                    className="line-clamp-1 group-hover:text-[#4f46e5] transition-colors"
                                                >
                                                    {b.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href="/blog"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            marginTop: 14,
                                            paddingTop: 14,
                                            borderTop: "1px solid #F0EDE8",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: "#4f46e5",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                            textDecoration: "none",
                                        }}
                                    >
                                        View all posts <ArrowRight size={12} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </article>

                    {/* ── SIDEBAR (desktop only) ── */}
                    <aside className="hidden lg:block lg:w-[35%]">
                        <div className="sticky top-24 space-y-8">
                            {toc.length > 0 && (
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1.5px solid #E8E3D9",
                                        borderRadius: 24,
                                        padding: 28,
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.3em",
                                            color: "#4f46e5",
                                            marginBottom: 18,
                                        }}
                                    >
                                        Table of Contents
                                    </p>
                                    <nav
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                        }}
                                    >
                                        {toc.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document
                                                        .getElementById(item.id)
                                                        ?.scrollIntoView({
                                                            behavior: "smooth",
                                                        });
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    padding: "8px 10px",
                                                    borderRadius: 10,
                                                    fontSize:
                                                        item.level === 3
                                                            ? 11
                                                            : 13,
                                                    fontWeight: 700,
                                                    paddingLeft:
                                                        item.level === 3
                                                            ? 24
                                                            : 10,
                                                    color:
                                                        activeSection ===
                                                        item.id
                                                            ? "#4f46e5"
                                                            : "#555",
                                                    background:
                                                        activeSection ===
                                                        item.id
                                                            ? "#eef2ff"
                                                            : "transparent",
                                                    textDecoration: "none",
                                                    transition: "all .2s",
                                                    borderLeft:
                                                        activeSection ===
                                                        item.id
                                                            ? "3px solid #4f46e5"
                                                            : "3px solid transparent",
                                                }}
                                            >
                                                <ChevronRight
                                                    size={11}
                                                    style={{
                                                        opacity:
                                                            activeSection ===
                                                            item.id
                                                                ? 1
                                                                : 0,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <span className="line-clamp-1">
                                                    {item.text}
                                                </span>
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {publishedBlogs.length > 0 && (
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1.5px solid #E8E3D9",
                                        borderRadius: 24,
                                        padding: 28,
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.3em",
                                            color: "#4f46e5",
                                            marginBottom: 18,
                                        }}
                                    >
                                        More Articles
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4,
                                        }}
                                    >
                                        {publishedBlogs.filter(b => b.slug).slice(0, 6).map((b) => (
                                            <Link
                                                key={b.id}
                                                href={`/blog/${b.slug}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    background:
                                                        b.id === blog.id
                                                            ? "#eef2ff"
                                                            : "transparent",
                                                    border:
                                                        b.id === blog.id
                                                            ? "1.5px solid #4f46e5"
                                                            : "1.5px solid transparent",
                                                    textDecoration: "none",
                                                    transition: "all .2s",
                                                }}
                                                className="group hover:bg-[#eef2ff]"
                                            >
                                                <div
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background:
                                                            b.id === blog.id
                                                                ? "#4f46e5"
                                                                : "#E8E3D9",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight:
                                                            b.id === blog.id
                                                                ? 800
                                                                : 600,
                                                        color:
                                                            b.id === blog.id
                                                                ? "#4f46e5"
                                                                : "#444",
                                                        lineHeight: 1.35,
                                                    }}
                                                    className="line-clamp-2 group-hover:text-[#4f46e5] transition-colors"
                                                >
                                                    {b.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link
                                        href="/blog"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 6,
                                            marginTop: 16,
                                            paddingTop: 16,
                                            borderTop: "1px solid #F0EDE8",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: "#4f46e5",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                            textDecoration: "none",
                                        }}
                                    >
                                        View all posts <ArrowRight size={12} />
                                    </Link>
                                </div>
                            )}

                            {relatedPosts.length > 0 && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.3em",
                                            color: "#4f46e5",
                                            marginBottom: 18,
                                        }}
                                    >
                                        Related Articles
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 16,
                                        }}
                                    >
                                        {relatedPosts.filter(r => r.slug).map((related) => {
                                            const relSrc =
                                                related.thumbnailImage ||
                                                related.heroImage ||
                                                null;
                                            return (
                                                <Link
                                                    key={related.id}
                                                    href={`/blog/${related.slug}`}
                                                    style={{
                                                        textDecoration: "none",
                                                    }}
                                                    className="group"
                                                >
                                                    <div
                                                        style={{
                                                            borderRadius: 18,
                                                            overflow: "hidden",
                                                            aspectRatio: "16/9",
                                                            background:
                                                                "#E8E3D9",
                                                            position:
                                                                "relative",
                                                            marginBottom: 10,
                                                        }}
                                                    >
                                                        {relSrc ? (
                                                            <img
                                                                src={relSrc}
                                                                alt={
                                                                    related.title
                                                                }
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                    transition:
                                                                        "transform .4s",
                                                                }}
                                                                className="group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <ImageIcon
                                                                    style={{
                                                                        color: "#C4B89A",
                                                                        width: 32,
                                                                        height: 32,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 800,
                                                            color: "#111",
                                                            lineHeight: 1.4,
                                                        }}
                                                        className="group-hover:text-[#4f46e5] transition-colors line-clamp-2"
                                                    >
                                                        {related.title}
                                                    </p>
                                                    <p
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#aaa",
                                                            marginTop: 4,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {new Date(
                                                            related.publishedAt ||
                                                                related.createdAt,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── PROSE STYLES ── */}
            <style>{`
                .blog-content h1,
                .blog-content h2,
                .blog-content h3,
                .blog-content h4 {
                    font-weight: 900;
                    letter-spacing: -0.025em;
                    color: #111;
                    margin-top: 2.5em;
                    margin-bottom: 0.75em;
                    line-height: 1.2;
                    scroll-margin-top: 80px;
                }
                .blog-content h1 { font-size: clamp(1.5rem, 4vw, 2.2rem); }
                .blog-content h2 { font-size: clamp(1.25rem, 3vw, 1.75rem); }
                .blog-content h3 { font-size: clamp(1.1rem, 2.5vw, 1.35rem); }
                .blog-content p {
                    margin-bottom: 1.6em !important;
                    color: inherit;
                }
                .blog-content a {
                    color: #4f46e5;
                    font-weight: 700;
                    text-decoration: underline;
                    text-decoration-color: rgba(79,70,229,0.35);
                    text-underline-offset: 3px;
                    transition: text-decoration-color .2s;
                }
                .blog-content a:hover { text-decoration-color: #4f46e5; }
                .blog-content blockquote {
                    margin: 2.5em 0 !important;
                    padding: 0 0 0 clamp(16px, 3vw, 28px) !important;
                    border-left: 4px solid #4f46e5 !important;
                    font-size: clamp(1.1rem, 2.5vw, 1.3rem);
                    font-weight: 900;
                    font-style: italic;
                    color: #111;
                    letter-spacing: -0.02em;
                    line-height: 1.35;
                }
                .blog-content ul {
                    list-style-type: disc !important;
                    padding-left: clamp(1.4em, 4vw, 2em) !important;
                    margin-bottom: 1.6em !important;
                }
                .blog-content ol {
                    list-style-type: decimal !important;
                    padding-left: clamp(1.4em, 4vw, 2em) !important;
                    margin-bottom: 1.6em !important;
                }
                .blog-content li {
                    margin-bottom: 0.5em !important;
                    line-height: 1.7;
                    display: list-item !important;
                }
                .blog-content li p {
                    margin-bottom: 0 !important;
                    display: inline;
                }
                .blog-content img {
                    width: 100%;
                    border-radius: clamp(12px, 3vw, 20px);
                    margin: 2.5em 0 !important;
                    display: block;
                }
                .blog-content pre {
                    background: #111 !important;
                    color: #f8f4ec !important;
                    border-radius: clamp(12px, 3vw, 16px);
                    padding: clamp(18px, 3vw, 28px) !important;
                    overflow-x: auto;
                    font-size: clamp(12px, 1.5vw, 14px);
                    line-height: 1.7;
                    margin: 2em 0 !important;
                }
                .blog-content code {
                    background: #F0EDE8;
                    color: #c0392b;
                    border-radius: 5px;
                    padding: 2px 7px;
                    font-size: 0.88em;
                    font-family: 'JetBrains Mono', monospace;
                    word-break: break-word;
                }
                .blog-content pre code {
                    background: transparent !important;
                    color: inherit !important;
                    padding: 0 !important;
                    word-break: normal;
                }
                .blog-content strong { font-weight: 900; color: inherit; }
                .blog-content hr {
                    border: none;
                    border-top: 2px solid #E8E3D9 !important;
                    margin: 3em 0 !important;
                }
                .blog-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 2em 0 !important;
                    font-size: clamp(12px, 1.5vw, 14px);
                    display: block;
                    overflow-x: auto;
                }
                .blog-content th {
                    background: #111 !important;
                    color: #fff !important;
                    padding: 10px 14px !important;
                    text-align: left;
                    font-weight: 800;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    white-space: nowrap;
                }
                .blog-content td {
                    padding: 10px 14px !important;
                    border-bottom: 1px solid #E8E3D9 !important;
                    color: inherit;
                }
                .blog-content tr:nth-child(even) td { background: #FAFAF7 !important; }
            `}</style>
        </div>
    );
}
