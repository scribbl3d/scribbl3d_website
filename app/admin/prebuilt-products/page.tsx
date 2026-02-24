"use client";

import { ArrowLeft, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchSortControl from "../_components/SearchSortControl";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatPrice(paise: number) {
    return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function PrebuiltProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    /* 🔍 Search & Sort state */
    const [searchField, setSearchField] = useState("name");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("updatedAt-desc");

    /* 📄 Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    /* ─── Data Fetching ─── */
    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchField, searchTerm, sortOption, currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                searchField,
                searchTerm,
                sort: sortOption,
                page: currentPage.toString(),
                limit: "10",
            });

            const res = await fetch(`/api/admin/prebuilt-products?${params}`);
            const data = await res.json();

            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ─── Delete Action ─── */
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`/api/admin/prebuilt-products?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) fetchProducts();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="bg-white border-b border-gray-200 px-8 py-5">
                <div className="max-w-screen-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Prebuilt Products
                            </h1>
                            <p className="text-sm text-gray-500">
                                {totalCount} total products
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/prebuilt-products/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Product
                    </Link>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-8 py-8">
                {/* 🔍 SEARCH + SORT CONTROL */}
                <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
                    <SearchSortControl
                        searchField={searchField}
                        setSearchField={setSearchField}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        searchOptions={[
                            { label: "Name", value: "name" },
                            { label: "Category", value: "category" },
                        ]}
                        sortOptions={[
                            {
                                label: "Updated (Latest First)",
                                value: "updatedAt-desc",
                            },
                            {
                                label: "Updated (Earliest First)",
                                value: "updatedAt-asc",
                            },
                            { label: "Name (A–Z)", value: "name-asc" },
                            { label: "Name (Z–A)", value: "name-desc" },
                        ]}
                        suggestionApi="/api/admin/prebuilt-products/suggestions"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* ── Toolbar ── */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900">
                            Products List
                        </h2>
                        <span className="text-sm text-gray-400">
                            {products.length} entries shown
                        </span>
                    </div>

                    {/* ── Table ── */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {[
                                        "Name",
                                        "Price",
                                        "Category",
                                        "Variants",
                                        "Customizable",
                                        "Updated At",
                                        "Actions",
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-16 text-center"
                                        >
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-16 text-center text-gray-400 text-base"
                                        >
                                            No products found.{" "}
                                            <Link
                                                href="/admin/prebuilt-products/new"
                                                className="text-blue-500 underline"
                                            >
                                                Add a product
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const v = product.variants?.[0];
                                        return (
                                            <tr
                                                key={product.id}
                                                className="hover:bg-gray-50/80 transition-colors"
                                            >
                                                {/* Name */}
                                                <td className="px-5 py-4 max-w-[280px]">
                                                    <p className="font-semibold text-gray-900 leading-snug">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                        {
                                                            product.shortDescription
                                                        }
                                                    </p>
                                                </td>

                                                {/* Price */}
                                                <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                                    {v?.price
                                                        ? formatPrice(v.price)
                                                        : "—"}
                                                </td>

                                                {/* Category */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                                                        {product.category}
                                                    </span>
                                                </td>

                                                {/* Variants count */}
                                                <td className="px-5 py-4 text-center font-semibold text-gray-700">
                                                    {product.variants?.length ||
                                                        0}
                                                </td>

                                                {/* Customizable */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                            product.isCustomizable
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-gray-100 text-gray-400"
                                                        }`}
                                                    >
                                                        {product.isCustomizable
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </td>

                                                {/* Updated At */}
                                                <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                                                    {formatDate(
                                                        product.updatedAt,
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/prebuilt-products/${product.id}`}
                                                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id,
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="p-2 rounded-lg border border-red-100 bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── PAGINATION ── */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                className="px-3 py-1.5 text-sm font-medium border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3.5 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                                        page === currentPage
                                            ? "bg-gray-900 text-white"
                                            : "bg-white border text-gray-600 hover:bg-gray-50"
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
                                className="px-3 py-1.5 text-sm font-medium border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* ── Footer Info ── */}
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {products.length} of {totalCount} total products
                    </div>
                </div>
            </div>
        </div>
    );
}
