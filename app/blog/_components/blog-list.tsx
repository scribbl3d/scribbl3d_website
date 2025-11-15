"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon } from "lucide-react";
import { FourPointStar } from "./icons/four-point-star";
interface BlogPost {
  id: string;
  title: string;
  createdAt: string;
  keywords: string;
  coverImage: string;
  description: string;
  thumbnailImage?: string; // New
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const loadMore = () => {
    setVisiblePosts((prevVisible) => Math.min(prevVisible + 4, blogs.length));
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1440px] mx-auto">
      {blogs.slice(0, visiblePosts).map((blog) => (
        <Link href={`/blog/${blog.id}`} key={blog.id}>
          <Card className="flex overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-[230px] w-[700px] max-w-full rounded-none">
            <div className="flex-1 flex flex-col p-6">
              <h2
                className="mb-3 line-clamp-2"
                style={{
                  color: "#000",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                {blog.title}
              </h2>
              <p
                className="mb-auto line-clamp-3"
                style={{
                  color: "#7C7C7C",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "14px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                {blog.description || "No description available"}
              </p>
              <div className="flex items-center gap-3 mt-3 h-[18px]">
                <div className="flex items-center flex-shrink-0">
                  <FourPointStar className="w-4 h-4 text-yellow-400 mr-2" />
                  <time
                    style={{
                      color: "#6B6B6B",
                      fontFamily: "Lato, sans-serif",
                      fontSize: "12px",
                      fontStyle: "normal",
                      fontWeight: 400,
                      lineHeight: "normal",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex gap-2 overflow-hidden h-[18px] items-center">
                  {blog.keywords
                    .split(",")
                    .slice(0, 2)
                    .map((keyword, index) => (
                      <Badge
                        key={`${blog.id}-${index}`}
                        variant="outline"
                        className="bg-[#FFFDF7] border-[#F5A524] text-[#7F7F7F] uppercase h-[18px] flex items-center justify-center whitespace-nowrap"
                        style={{
                          fontFamily: "Lato, sans-serif",
                          fontSize: "8px",
                          fontStyle: "italic",
                          fontWeight: 400,
                          lineHeight: "normal",
                        }}
                      >
                        {keyword.trim()}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center w-[230px] p-6">
              <div className="relative w-[180px] h-[180px]  overflow-hidden">
                {blog.thumbnailImage && !failedImages.has(blog.id) ? (
                  <Image
                    src={blog.thumbnailImage || "/placeholder.svg"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    unoptimized={true} // Key prop
                    onError={() => handleImageError(blog.id)}
                  />
                ) : blog.coverImage && !failedImages.has(blog.id) ? (
                  <Image
                    src={blog.coverImage || "/placeholder.svg"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    unoptimized={true} // Key prop
                    onError={() => handleImageError(blog.id)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
      {visiblePosts < blogs.length && (
        <button
          onClick={loadMore}
          className="col-span-full mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 mx-auto block"
        >
          Load More
        </button>
      )}
    </div>
  );
}
