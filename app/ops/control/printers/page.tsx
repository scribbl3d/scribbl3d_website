"use client";

import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroBannerEditor from "../_components/HeroBannerEditor";
import SearchSortControl from "../_components/SearchSortControl";
/* ===================== TYPES ===================== */

type Printer = {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    technology: string;
    brand: string;
    freeInstallation: boolean;
    discount: string | number | null;
    updatedAt: string;
};

type PrintersResponse = {
    printers: Printer[];
    totalPages: number;
};

/* ===================== PAGE ===================== */

export default function AdminPrintersPage() {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(true);

    /* 🔍 Search & Sort state (USED BY SearchSortControl) */
    const [searchField, setSearchField] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("");

    /* 📄 Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* ===================== DATA FETCH ===================== */

    useEffect(() => {
        fetchPrinters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchField, searchTerm, sortOption, currentPage]);

    const fetchPrinters = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                searchField,
                searchTerm,
                sort: sortOption,
                page: currentPage.toString(),
                limit: "10",
            });

            const res = await fetch(`/api/admin/printers?${params}`);
            const data: PrintersResponse = await res.json();

            setPrinters(data.printers || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Error fetching printers:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== DELETE ===================== */

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this printer?")) return;

        try {
            const res = await fetch(`/api/admin/printers/${id}`, {
                method: "DELETE",
            });

            if (res.ok) fetchPrinters();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    /* ===================== UI ===================== */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ===================== HEADER ===================== */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
                    <Link
                        href="/ops/control"
                        className="text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold">Printers</h1>
                </div>
            </div>

            {/* ===================== CONTENT ===================== */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <HeroBannerEditor page="printers" />
                {/* TITLE + ADD */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Printers List</h2>
                    <Link
                        href="/ops/control/printers/new"
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Printer
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
                            { label: "Price", value: "price" },
                            { label: "Technology", value: "technology" },
                            { label: "Brand", value: "brand" },
                        ]}
                        sortOptions={[
                            { label: "Name (A–Z)", value: "name-asc" },
                            { label: "Name (Z–A)", value: "name-desc" },
                            { label: "Price Low → High", value: "price-asc" },
                            { label: "Price High → Low", value: "price-desc" },
                            {
                                label: "Updated (Latest First)",
                                value: "updatedAt-desc",
                            },
                            {
                                label: "Updated (Earliest First)",
                                value: "updatedAt-asc",
                            },
                        ]}
                        suggestionApi="/api/admin/printers/suggestions"
                    />
                </div>

                {/* ===================== TABLE ===================== */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    {[
                                        "Name",
                                        "Price",
                                        "Original Price",
                                        "Technology",
                                        "Brand",
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
                                            colSpan={7}
                                            className="py-12 text-center"
                                        >
                                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
                                        </td>
                                    </tr>
                                ) : printers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center text-gray-500"
                                        >
                                            No printers found
                                        </td>
                                    </tr>
                                ) : (
                                    printers.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                {p.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                ₹
                                                {p.price.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                ₹
                                                {p.originalPrice.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.technology}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.brand}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(
                                                    p.updatedAt,
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
                                                        href={`/ops/control/printers/${p.id}/edit`}
                                                        className="text-black hover:text-blue-700"
                                                    >
                                                        <Edit className="w-5 h-10" />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(p.id)
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
            </div>
        </div>
    );
}
