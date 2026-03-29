"use client";

import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Calendar,
    ChevronRight,
    ImageIcon,
    Share2,
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

// CHANGED: Now accepts slug instead of blogId
interface BlogPostLayoutProps {
    slug: string;
}

/* ─── Table-of-Contents parser ─── */
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

/* ─── Hero image with fallback ─── */
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
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // CHANGED: Fetching by slug instead of blogId
        fetch(`/api/blogs/${slug}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setBlog)
            .catch(console.error);

        fetch("/api/blogs")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => {
                setAllBlogs(data);
            })
            .catch(console.error);
    }, [slug]);

    /* Scroll progress */
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

    /* Active TOC section */
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
                            background: "#F5A524",
                            borderRadius: 99,
                            margin: "0 auto",
                            animation: "pulse 1.4s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>
        );
    }

    const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
    const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
    const nextBlog =
        currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;

    const heroSrc = blog.heroImage || blog.thumbnailImage || null;

    const keywordArray = (blog.keywords || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

    const relatedPosts = allBlogs.filter((b) => b.id !== blog.id).slice(0, 2);

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
                        background: "#F5A524",
                        transition: "width 0.2s ease",
                        borderRadius: "0 99px 99px 0",
                    }}
                />
            </div>

            {/* ── HERO ── */}
            <div
                className="relative w-full overflow-hidden"
                style={{ height: "78vh", minHeight: 480 }}
            >
                <HeroImage src={heroSrc} alt={blog.title} />

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
                    }}
                />

                {/* Hero content */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ padding: "0 40px 56px" }}
                >
                    <div style={{ maxWidth: 900, margin: "0 auto" }}>
                        {/* Back link */}
                        <Link
                            href="/blog"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                color: "rgba(255,255,255,0.65)",
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.2em",
                                marginBottom: 24,
                                transition: "color .2s",
                                textDecoration: "none",
                            }}
                            className="hover:text-white"
                        >
                            <ArrowLeft size={14} /> Back to Blog
                        </Link>

                        {/* Keywords (Tags) */}
                        {keywordArray.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    marginBottom: 18,
                                    flexWrap: "wrap",
                                }}
                            >
                                {keywordArray.slice(0, 3).map((kw) => (
                                    <span
                                        key={kw}
                                        style={{
                                            background: "#F5A524",
                                            color: "#fff",
                                            borderRadius: 6,
                                            padding: "4px 12px",
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
                                fontSize: "clamp(26px, 4.5vw, 60px)",
                                fontWeight: 900,
                                lineHeight: 1.08,
                                letterSpacing: "-0.03em",
                                marginBottom: 24,
                                maxWidth: 820,
                            }}
                        >
                            {blog.title}
                        </h1>

                        {/* Meta */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 24,
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    color: "rgba(255,255,255,0.8)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            >
                                <Calendar size={16} />
                                {new Date(
                                    blog.publishedAt || blog.createdAt,
                                ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "64px 32px 80px",
                }}
            >
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* ── ARTICLE ── */}
                    <article className="lg:w-[65%] min-w-0">
                        <div
                            ref={contentRef}
                            className="blog-content"
                            style={{
                                color: "#333",
                                fontSize: 17,
                                lineHeight: 1.85,
                            }}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* ── POST FOOTER ── */}
                        <div
                            style={{
                                marginTop: 64,
                                paddingTop: 32,
                                borderTop: "1.5px solid #E8E3D9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 20,
                            }}
                        >
                            {/* Share */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
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
                                {[Share2, Bookmark].map((Icon, i) => (
                                    <button
                                        key={i}
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
                                            ).style.background = "#F5A524";
                                            (
                                                e.currentTarget as HTMLButtonElement
                                            ).style.color = "#fff";
                                            (
                                                e.currentTarget as HTMLButtonElement
                                            ).style.borderColor = "#F5A524";
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
                                        <Icon size={16} />
                                    </button>
                                ))}
                            </div>

                            {/* Keywords / Tags Footer */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                }}
                            >
                                {keywordArray.slice(0, 4).map((kw) => (
                                    <span
                                        key={kw}
                                        style={{
                                            padding: "6px 14px",
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
                        </div>

                        {/* ── PREV / NEXT ── */}
                        <div
                            style={{
                                marginTop: 48,
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 16,
                            }}
                        >
                            {/* CHANGED: href uses prevBlog.slug OR falls back to id if slug is missing */}
                            {prevBlog ? (
                                <Link
                                    href={`/blog/${prevBlog.slug || prevBlog.id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div
                                        style={{
                                            border: "1.5px solid #E8E3D9",
                                            borderRadius: 20,
                                            padding: "20px 24px",
                                            background: "#fff",
                                            cursor: "pointer",
                                            transition: "all .2s",
                                        }}
                                        className="hover:border-[#F5A524] hover:shadow-md"
                                    >
                                        <p
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 800,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.2em",
                                                color: "#aaa",
                                                marginBottom: 8,
                                            }}
                                        >
                                            ← Previous
                                        </p>
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
                                <div />
                            )}

                            {/* CHANGED: href uses nextBlog.slug */}
                            {nextBlog ? (
                                <Link
                                    href={`/blog/${nextBlog.slug || nextBlog.id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div
                                        style={{
                                            border: "1.5px solid #E8E3D9",
                                            borderRadius: 20,
                                            padding: "20px 24px",
                                            background: "#fff",
                                            cursor: "pointer",
                                            transition: "all .2s",
                                            textAlign: "right",
                                        }}
                                        className="hover:border-[#F5A524] hover:shadow-md"
                                    >
                                        <p
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 800,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.2em",
                                                color: "#aaa",
                                                marginBottom: 8,
                                            }}
                                        >
                                            Next →
                                        </p>
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
                                <div />
                            )}
                        </div>
                    </article>

                    {/* ── SIDEBAR ── */}
                    <aside className="lg:w-[35%]">
                        <div className="sticky top-24 space-y-8">
                            {/* Table of Contents */}
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
                                            color: "#F5A524",
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
                                                            ? "#F5A524"
                                                            : "#555",
                                                    background:
                                                        activeSection ===
                                                        item.id
                                                            ? "#FFFDF7"
                                                            : "transparent",
                                                    textDecoration: "none",
                                                    transition: "all .2s",
                                                    borderLeft:
                                                        activeSection ===
                                                        item.id
                                                            ? "3px solid #F5A524"
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

                            {/* All Posts mini-list */}
                            {allBlogs.length > 0 && (
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
                                            color: "#F5A524",
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
                                        {/* CHANGED: href uses b.slug */}
                                        {allBlogs.slice(0, 6).map((b) => (
                                            <Link
                                                key={b.id}
                                                href={`/blog/${b.slug || b.id}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    background:
                                                        b.id === blog.id
                                                            ? "#FFFDF7"
                                                            : "transparent",
                                                    border:
                                                        b.id === blog.id
                                                            ? "1.5px solid #F5A524"
                                                            : "1.5px solid transparent",
                                                    textDecoration: "none",
                                                    transition: "all .2s",
                                                }}
                                                className="group hover:bg-[#FFFDF7]"
                                            >
                                                <div
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: "50%",
                                                        background:
                                                            b.id === blog.id
                                                                ? "#F5A524"
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
                                                                ? "#F5A524"
                                                                : "#444",
                                                        lineHeight: 1.35,
                                                    }}
                                                    className="line-clamp-2 group-hover:text-[#F5A524] transition-colors"
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
                                            color: "#F5A524",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                            textDecoration: "none",
                                        }}
                                    >
                                        View all posts <ArrowRight size={12} />
                                    </Link>
                                </div>
                            )}

                            {/* Related posts */}
                            {relatedPosts.length > 0 && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 800,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.3em",
                                            color: "#F5A524",
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
                                        {/* CHANGED: href uses related.slug */}
                                        {relatedPosts.map((related) => {
                                            const relSrc =
                                                related.thumbnailImage ||
                                                related.heroImage ||
                                                null;
                                            return (
                                                <Link
                                                    key={related.id}
                                                    href={`/blog/${related.slug || related.id}`}
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
                                                        className="group-hover:text-[#F5A524] transition-colors line-clamp-2"
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

            {/* ── PROSE STYLES (CORRECTED OVERRIDES) ── */}
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
          scroll-margin-top: 100px;
        }
        .blog-content h1 { font-size: 2.2rem; }
        .blog-content h2 { font-size: 1.75rem; }
        .blog-content h3 { font-size: 1.35rem; }
        
        /* FIXED PARAGRAPH SPACING */
        .blog-content p {
          margin-bottom: 1.6em !important; 
          color: inherit;
        }
        
        .blog-content a {
          color: #F5A524;
          font-weight: 700;
          text-decoration: underline;
          text-decoration-color: rgba(245,165,36,0.35);
          text-underline-offset: 3px;
          transition: text-decoration-color .2s;
        }
        .blog-content a:hover {
          text-decoration-color: #F5A524;
        }
        .blog-content blockquote {
          margin: 2.5em 0 !important;
          padding: 0 0 0 28px !important;
          border-left: 4px solid #F5A524 !important;
          font-size: 1.3rem;
          font-weight: 900;
          font-style: italic;
          color: #111;
          letter-spacing: -0.02em;
          line-height: 1.35;
        }
        
        /* FIXED BULLET POINTS & NUMBERED LISTS */
        .blog-content ul {
          list-style-type: disc !important;
          padding-left: 2em !important;
          margin-bottom: 1.6em !important;
          color: inherit;
        }
        .blog-content ol {
          list-style-type: decimal !important;
          padding-left: 2em !important;
          margin-bottom: 1.6em !important;
          color: inherit;
        }
        .blog-content li {
          margin-bottom: 0.5em !important;
          line-height: 1.7;
          display: list-item !important;
        }
        
        /* Tiptap sometimes wraps list text in <p> tags, this prevents double spacing */
        .blog-content li p {
          margin-bottom: 0 !important;
          display: inline;
        }

        .blog-content img {
          width: 100%;
          border-radius: 20px;
          margin: 2.5em 0 !important;
          display: block;
        }
        .blog-content pre {
          background: #111 !important;
          color: #f8f4ec !important;
          border-radius: 16px;
          padding: 28px !important;
          overflow-x: auto;
          font-size: 14px;
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
        }
        .blog-content pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
        }
        .blog-content strong {
          font-weight: 900;
          color: inherit;
        }
        .blog-content hr {
          border: none;
          border-top: 2px solid #E8E3D9 !important;
          margin: 3em 0 !important;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0 !important;
          font-size: 14px;
        }
        .blog-content th {
          background: #111 !important;
          color: #fff !important;
          padding: 12px 16px !important;
          text-align: left;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .blog-content td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #E8E3D9 !important;
          color: inherit;
        }
        .blog-content tr:nth-child(even) td {
          background: #FAFAF7 !important;
        }
      `}</style>
        </div>
    );
}
