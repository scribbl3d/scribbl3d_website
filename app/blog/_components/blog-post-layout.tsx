"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    tags: string;
    heroImage?: string;
    coverImage?: string;
    thumbnailImage?: string;
}

interface BlogPostLayoutProps {
    blogId: string;
}

export default function BlogPostLayout({ blogId }: BlogPostLayoutProps) {
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        fetchBlog();
        fetchAllBlogs();

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;
            setScrollProgress((scrollTop / docHeight) * 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [blogId]);

    const fetchBlog = async () => {
        const res = await fetch(`/api/blogs/${blogId}`);
        if (res.ok) {
            setBlog(await res.json());
        }
    };

    const fetchAllBlogs = async () => {
        const res = await fetch("/api/blogs");
        if (res.ok) {
            setAllBlogs(await res.json());
        }
    };

    if (!blog) {
        return <div className="pt-[100px]">Loading…</div>;
    }

    const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
    const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
    const nextBlog =
        currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;

    /* ✅ FINAL, BULLETPROOF IMAGE NORMALIZATION */
    const rawImage =
        blog.heroImage?.trim() ||
        blog.coverImage?.trim() ||
        blog.thumbnailImage?.trim() ||
        null;

    const finalImageSrc = rawImage
        ? "/" +
          rawImage
              .replace(/^\/+/, "") // remove leading slashes
              .replace(/\/+$/, "") // remove trailing slashes
        : null;

    return (
        <div className="flex flex-col min-h-screen bg-background pt-[100px]">
            {/* Scroll Progress */}
            <div className="fixed top-[72px] left-0 right-0 h-1 bg-muted z-50">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-muted/30 sticky top-[172px] h-[calc(100vh-172px)] overflow-y-auto hidden lg:block">
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">
                            All Posts
                        </h2>
                        <nav>
                            {allBlogs.map((b) => (
                                <Link
                                    key={b.id}
                                    href={`/blog/${b.id}`}
                                    className={`block py-2 px-4 rounded-md ${
                                        b.id === blog.id
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    }`}
                                >
                                    {b.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
                        >
                            ← Back to all posts
                        </Link>

                        <article className="prose prose-lg dark:prose-invert max-w-none">
                            <h1 className="text-4xl font-bold mb-4">
                                {blog.title}
                            </h1>

                            <div className="mb-6 text-muted-foreground text-sm">
                                {blog.author} ·{" "}
                                {new Date(blog.createdAt).toLocaleDateString()}
                            </div>

                            {/* ✅ HERO IMAGE */}
                            {finalImageSrc && (
                                <img
                                    src={finalImageSrc}
                                    alt="Blog post hero image"
                                    className="w-full rounded-lg object-cover mb-6"
                                />
                            )}

                            <div
                                dangerouslySetInnerHTML={{
                                    __html: blog.content,
                                }}
                            />

                            {/* Navigation */}
                            <div className="mt-10 flex justify-between">
                                {prevBlog ? (
                                    <Link href={`/blog/${prevBlog.id}`}>
                                        <Button variant="outline">
                                            ← Previous
                                        </Button>
                                    </Link>
                                ) : (
                                    <div />
                                )}

                                {nextBlog ? (
                                    <Link href={`/blog/${nextBlog.id}`}>
                                        <Button>Next →</Button>
                                    </Link>
                                ) : (
                                    <div />
                                )}
                            </div>
                        </article>
                    </div>
                </main>
            </div>
        </div>
    );
}
