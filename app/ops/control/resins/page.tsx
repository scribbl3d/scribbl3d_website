"use client";

import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import SearchSortControl from "../_components/SearchSortControl";

/* ===================== TYPES ===================== */

type Resin = {
    id: string;
    name: string;
    brand: string;
    technology: string;
    resolution: string[];
    updatedAt: string;
};

type ResinsResponse = {
    resins: Resin[];
    totalPages: number;
};

/* ===================== PAGE ===================== */

export default function AdminResinsPage() {
    const [resins, setResins] = useState<Resin[]>([]);
    const [loading, setLoading] = useState(true);

    /* 🔍 Search & Sort */
    const [searchField, setSearchField] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("");

    /* 📄 Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* ===================== FETCH ===================== */

    useEffect(() => {
        fetchResins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchField, searchTerm, sortOption, currentPage]);

    const fetchResins = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                searchField,
                searchTerm,
                sort: sortOption,
                page: currentPage.toString(),
                limit: "10",
            });

            const res = await fetch(`/api/admin/resins?${params}`);
            const data: ResinsResponse = await res.json();

            setResins(data.resins || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Error fetching resins:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== DELETE ===================== */

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resin?")) return;

        try {
            const res = await fetch(`/api/admin/resins/${id}`, {
                method: "DELETE",
            });

            if (res.ok) fetchResins();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    /* ===================== UI ===================== */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
                    <Link
                        href="/ops/control"
                        className="text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold">Resins</h1>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* TITLE + ADD */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Resins List</h2>
                    <Link
                        href="/ops/control/resins/new"
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Resin
                    </Link>
                </div>

                {/* SEARCH + SORT */}
                <div className="bg-white border rounded-lg p-4 mb-6">
                    <SearchSortControl
                        searchField={searchField}
                        setSearchField={setSearchField}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        searchOptions={[
                            { label: "Name", value: "name" },
                            { label: "Brand", value: "brand" },
                            { label: "Technology", value: "technology" },
                        ]}
                        sortOptions={[
                            { label: "Name (A–Z)", value: "name-asc" },
                            { label: "Name (Z–A)", value: "name-desc" },
                            {
                                label: "Updated (Latest First)",
                                value: "updatedAt-desc",
                            },
                            {
                                label: "Updated (Earliest First)",
                                value: "updatedAt-asc",
                            },
                        ]}
                        suggestionApi="/api/admin/resins/suggestions"
                    />
                </div>

                {/* TABLE */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {[
                                        "Name",
                                        "Brand",
                                        "Technology",
                                        "Resolution",
                                        "Updated At",
                                        "Actions",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center"
                                        >
                                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
                                        </td>
                                    </tr>
                                ) : resins.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-gray-500"
                                        >
                                            No resins found
                                        </td>
                                    </tr>
                                ) : (
                                    resins.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                {r.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.brand}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.technology}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.resolution?.join(", ")}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(
                                                    r.updatedAt,
                                                ).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/ops/control/resins/${r.id}/edit`}
                                                        className="text-black hover:text-blue-700"
                                                    >
                                                        <Edit className="w-5 h-10" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(r.id)
                                                        }
                                                        className="bg-red-600 hover:bg-red-700 p-2 rounded"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-white" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="border-t px-4 py-3 flex justify-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded ${
                                        page === currentPage
                                            ? "bg-black text-white"
                                            : "border"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
