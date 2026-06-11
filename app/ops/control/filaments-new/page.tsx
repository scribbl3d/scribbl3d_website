"use client";

import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchSortControl from "../_components/SearchSortControl";

/* ===================== TYPES ===================== */

type Filament = {
    id: string;
    name: string;
    slug: string | null;
    material: string | null;
    finishType: string | null;
    brand: string | null;
    colorName: string | null;
    hexCode: string | null;
    inStock: boolean;
    updatedAt: string;
    _count?: {
        variants: number;
    };
};

type FilamentsResponse = {
    filaments: Filament[];
    totalPages: number;
};

/* ===================== PAGE ===================== */

export default function AdminFilamentsNewPage() {
    const [filaments, setFilaments] = useState<Filament[]>([]);
    const [loading, setLoading] = useState(true);

    /* 🔍 Search & Sort state */
    const [searchField, setSearchField] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("");

    /* 📄 Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* ===================== DATA FETCH ===================== */

    useEffect(() => {
        fetchFilaments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchField, searchTerm, sortOption, currentPage]);

    const fetchFilaments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                searchField,
                searchTerm,
                sort: sortOption,
                page: currentPage.toString(),
                limit: "10",
            });

            const res = await fetch(`/api/admin/filaments?${params}`);
            const data: FilamentsResponse = await res.json();

            setFilaments(data.filaments || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Error fetching filaments:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== DELETE ===================== */

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this filament?")) return;

        try {
            const res = await fetch(`/api/admin/filaments/${id}`, {
                method: "DELETE",
            });

            if (res.ok) fetchFilaments();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    /* ===================== UI ===================== */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ===================== HEADER ===================== */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex items-center gap-3 sm:gap-4">
                    <Link
                        href="/ops/control"
                        className="text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold">Filament New</h1>
                </div>
            </div>

            {/* ===================== CONTENT ===================== */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                {/* TITLE + ADD */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">Filaments List</h2>
                    <Link
                        href="/ops/control/filaments-new/new"
                        className="w-full sm:w-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Add New Filament
                    </Link>
                </div>

                {/* 🔍 SEARCH + SORT */}
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
                            { label: "Material", value: "material" },
                            { label: "Brand", value: "brand" },
                            { label: "Color", value: "colorName" },
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
                        suggestionApi="/api/admin/filaments/suggestions"
                    />
                </div>

                {/* ===================== TABLE - Desktop ===================== */}
                <div className="bg-white border rounded-lg overflow-hidden hidden md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {[
                                        "Name",
                                        "Material",
                                        "Finish",
                                        "Brand",
                                        "Color",
                                        "Variants",
                                        "Stock",
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
                                            colSpan={9}
                                            className="py-12 text-center"
                                        >
                                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
                                        </td>
                                    </tr>
                                ) : filaments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-12 text-center text-gray-500"
                                        >
                                            No filaments found
                                        </td>
                                    </tr>
                                ) : (
                                    filaments.map((f) => (
                                        <tr
                                            key={f.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                {f.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {f.material || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {f.finishType || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {f.brand || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {f.hexCode && (
                                                        <div
                                                            className="w-5 h-5 rounded border"
                                                            style={{ backgroundColor: f.hexCode }}
                                                        />
                                                    )}
                                                    <span>{f.colorName || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {f._count?.variants || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${f.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {f.inStock ? "In Stock" : "Out of Stock"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(
                                                    f.updatedAt,
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
                                                        href={`/ops/control/filaments-new/${f.id}/edit`}
                                                        className="text-black hover:text-blue-700"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(f.id)
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

                    {/* ===================== PAGINATION ===================== */}
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

                {/* ===================== MOBILE CARDS ===================== */}
                <div className="md:hidden space-y-3">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
                        </div>
                    ) : filaments.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 bg-white rounded-lg border">
                            No filaments found
                        </div>
                    ) : (
                        filaments.map((f) => (
                            <div
                                key={f.id}
                                className="bg-white border rounded-lg p-4 space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">
                                            {f.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {f.brand || "No brand"}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/ops/control/filaments-new/${f.id}/edit`}
                                            className="text-black hover:text-blue-700"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(f.id)}
                                            className="bg-red-600 hover:bg-red-700 p-2 rounded"
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Material:</span>
                                        <p className="font-medium">{f.material || "-"}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Finish:</span>
                                        <p className="font-medium">{f.finishType || "-"}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Color:</span>
                                        <div className="flex items-center gap-1">
                                            {f.hexCode && (
                                                <div
                                                    className="w-4 h-4 rounded border"
                                                    style={{ backgroundColor: f.hexCode }}
                                                />
                                            )}
                                            <p className="font-medium">{f.colorName || "-"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Variants:</span>
                                        <p className="font-medium">{f._count?.variants || 0}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 pt-2 border-t">
                                    Updated:{" "}
                                    {new Date(f.updatedAt).toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {/* MOBILE PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-sm">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
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
