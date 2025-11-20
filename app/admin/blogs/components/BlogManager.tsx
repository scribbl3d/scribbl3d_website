"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Blog } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SearchSortControl from "../../_components/SearchSortControl";

export default function BlogManager() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const router = useRouter();

    /* ----------------------------------------------
     SEARCH + SORT STATES
  ---------------------------------------------- */
    const [searchField, setSearchField] = useState("title");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("");

    /* ----------------------------------------------
     SEARCH OPTIONS FOR BLOGS
  ---------------------------------------------- */
    const searchOptions = [
        { label: "Title", value: "title" },
        { label: "Description", value: "description" },
    ];

    /* ----------------------------------------------
     SORT OPTIONS
  ---------------------------------------------- */
    const sortOptions = [
        { label: "Newest First", value: "newest" },
        { label: "Oldest First", value: "oldest" },
        { label: "A → Z", value: "az" },
        { label: "Z → A", value: "za" },
    ];

    /* ----------------------------------------------
     FETCH BLOGS
  ---------------------------------------------- */
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        const response = await fetch("/api/admin/blogs");
        if (response.ok) {
            const data = await response.json();
            setBlogs(data);
            setFilteredBlogs(data);
        } else {
            console.error("Failed to fetch blogs");
        }
    };

    /* ----------------------------------------------
     DELETE BLOG
  ---------------------------------------------- */
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

    /* ----------------------------------------------
     FILTER + SORT LOGIC
  ---------------------------------------------- */
    useEffect(() => {
        let temp = [...blogs];

        // --- SEARCH ---
        if (searchTerm.trim()) {
            temp = temp.filter((b) =>
                b[searchField]?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // --- SORT ---
        if (sortOption === "newest") {
            temp.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        } else if (sortOption === "oldest") {
            temp.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );
        } else if (sortOption === "az") {
            temp.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === "za") {
            temp.sort((a, b) => b.title.localeCompare(a.title));
        }

        setFilteredBlogs(temp);
    }, [searchTerm, sortOption, searchField, blogs]);

    /* ----------------------------------------------
     RENDER
  ---------------------------------------------- */
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Blogs</h2>
                <Button onClick={() => router.push("/admin/blogs/new")}>
                    Create New Blog
                </Button>
            </div>

            {/* SEARCH + SORT */}
            <div className="mb-4">
                <SearchSortControl
                    searchField={searchField}
                    setSearchField={setSearchField}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    searchOptions={searchOptions}
                    sortOptions={sortOptions}
                    suggestionApi="" // no suggestions needed for blogs
                />
            </div>

            {/* TABLE */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {filteredBlogs.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center py-6 text-gray-500 "
                            >
                                No blog posts found. Add your first blog!
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredBlogs.map((blog) => (
                            <TableRow key={blog.id}>
                                <TableCell>{blog.title}</TableCell>
                                <TableCell>{blog.description}</TableCell>
                                <TableCell>
                                    {new Date(
                                        blog.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mr-2"
                                        onClick={() =>
                                            router.push(
                                                `/admin/blogs/edit/${blog.id}`
                                            )
                                        }
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
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
