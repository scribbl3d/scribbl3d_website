"use client";

import { ArrowLeft, Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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

/* ===================== COMPONENT ===================== */

export default function AdminPrintersPage() {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("name");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        fetchPrinters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, sortBy, currentPage]);

    const fetchPrinters = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                sortBy,
                page: currentPage.toString(),
                limit: "10",
            });

            const response = await fetch(`/api/admin/printers?${params}`);
            const data: PrintersResponse = await response.json();

            setPrinters(data.printers || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching printers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this printer?")) return;

        try {
            const response = await fetch(`/api/admin/printers/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchPrinters();
            }
        } catch (error) {
            console.error("Error deleting printer:", error);
        }
    };

    /* ===================== JSX ===================== */

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Printers
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Title & Add */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Printers List
                    </h2>
                    <Link
                        href="/admin/printers/new"
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Product
                    </Link>
                </div>

                {/* Search & Sort */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Sort By: Name</option>
                            <option value="price">Sort By: Price</option>
                            <option value="technology">
                                Sort By: Technology
                            </option>
                            <option value="updatedAt">
                                Sort By: Updated Date
                            </option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {[
                                        "Name",

                                        "Displayed Price",
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

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                                        </td>
                                    </tr>
                                ) : printers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            No printers found
                                        </td>
                                    </tr>
                                ) : (
                                    printers.map((printer) => (
                                        <tr
                                            key={printer.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                {printer.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                ₹
                                                {printer.price.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                ₹
                                                {printer.originalPrice.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {printer.technology}
                                            </td>
                                            <td className="px-6 py-4">
                                                {printer.brand}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(
                                                    printer.updatedAt
                                                ).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/admin/printers/${printer.id}/edit`}
                                                        className="inline-flex items-center text-back hover:text-blue-800"
                                                    >
                                                        <Edit className="h-5 w-6" />
                                                    </Link>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                printer.id
                                                            )
                                                        }
                                                        className="inline-flex items-center rounded bg-red-600 p-2 text-white hover:bg-red-700"
                                                    >
                                                        <Trash2 className="h-5 w-6 text-white" />
                                                    </button>
                                                </div>
                                            </td>
                                            {/* <div className="flex space-x-2">
                                            <Button
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                                variant="destructive"
                                                size="sm"
                                                disabled={
                                                    isDeleting &&
                                                    deleteId === product.id
                                                }
                                            >
                                                {isDeleting &&
                                                deleteId === product.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div> */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 border-t flex justify-center gap-2">
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
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
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
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
