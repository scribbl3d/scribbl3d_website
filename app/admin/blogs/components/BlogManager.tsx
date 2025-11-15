"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Blog } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const response = await fetch("/api/admin/blogs");
    if (response.ok) {
      const data = await response.json();
      setBlogs(data);
    } else {
      console.error("Failed to fetch blogs");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchBlogs();
      } else {
        console.error("Failed to delete blog post");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Blogs</h2>
        <Button onClick={() => router.push("/admin/blogs/new")}>
          Create New Blog
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Short Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell>{blog.title}</TableCell>
              <TableCell>{blog.description}</TableCell>
              <TableCell>
                {new Date(blog.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => router.push(`/admin/blogs/edit/${blog.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(blog.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
