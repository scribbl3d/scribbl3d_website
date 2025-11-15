"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string;
  coverImage: string;
  thumbnailImage?: string; // New
  heroImage?: string; // New
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
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(scrollPercent * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [blogId]);

  const fetchBlog = async () => {
    const response = await fetch(`/api/blogs/${blogId}`);
    if (response.ok) {
      const data = await response.json();
      setBlog(data);
    } else {
      console.error("Failed to fetch blog");
    }
  };

  const fetchAllBlogs = async () => {
    const response = await fetch("/api/blogs");
    if (response.ok) {
      const data = await response.json();
      setAllBlogs(data);
    } else {
      console.error("Failed to fetch all blogs");
    }
  };

  if (!blog) {
    return <div className="pt-[100px]">Loading...</div>;
  }

  const currentIndex = allBlogs.findIndex((b) => b.id === blog.id);
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextBlog =
    currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;

  return (
    <div className="flex flex-col min-h-screen bg-background pt-[100px]">
      <div className="fixed top-[72px] left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/30 sticky top-[172px] self-start h-[calc(100vh-172px)] overflow-y-auto hidden lg:block">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">All Posts</h2>
            <nav>
              {allBlogs.map((b) => (
                <Link
                  key={b.id}
                  href={`/blog/${b.id}`}
                  className={`block py-2 px-4 rounded-md transition-colors ${
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

        <main className="flex-1 min-h-[calc(100vh-172px)] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to all posts
            </Link>

            <article className="prose prose-lg dark:prose-invert max-w-none">
              <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

              <div className="flex items-center space-x-4 mb-6 text-muted-foreground">
                <div>
                  <p className="text-sm font-medium">{blog.author}</p>
                  <div className="flex items-center text-xs">
                    <time dateTime={blog.createdAt}>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </div>

              <Image
                src={blog.heroImage || blog.coverImage}
                alt="Blog post hero image"
                width={800}
                height={400}
                className="rounded-lg object-cover mb-6"
                unoptimized={true} // Key prop
              />

              <div dangerouslySetInnerHTML={{ __html: blog.content }} />

              <div className="mt-8 flex justify-between items-center">
                {prevBlog ? (
                  <Link href={`/blog/${prevBlog.id}`}>
                    <Button variant="outline">← Previous</Button>
                  </Link>
                ) : (
                  <div></div>
                )}
                {nextBlog ? (
                  <Link href={`/blog/${nextBlog.id}`}>
                    <Button>Next →</Button>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
