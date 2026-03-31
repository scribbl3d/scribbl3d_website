"use client";

import {
    Bell,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Mail,
    Package,
    Phone,
    RefreshCw,
    Search,
    Trash2,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 20;

type Notification = {
    id: string;
    productId: string;
    productName: string;
    productType: string; // "prebuilt" | "printer" | "resin"
    variantId: string | null;
    variantLabel: string | null;
    name: string | null;
    email: string;
    phone: string;
    notified: boolean;
    notifiedAt: string | null;
    createdAt: string;
    currentInStock: boolean | null;
    productSlug: string | null;
};

/* ── Type badge colours ── */
const TYPE_BADGE: Record<string, string> = {
    printer: "bg-blue-50 text-blue-700",
    prebuilt: "bg-purple-50 text-purple-700",
    resin: "bg-teal-50 text-teal-700",
};

const TYPE_LABEL: Record<string, string> = {
    printer: "Printer",
    prebuilt: "Prebuilt",
    resin: "Resin",
};

export default function StockNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "notified">("all");
    const [typeFilter, setTypeFilter] = useState<
        "all" | "prebuilt" | "printer" | "resin"
    >("all");
    const [search, setSearch] = useState("");
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const router = useRouter();

    const fetchNotifications = async (pageNum = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== "all")
                params.set("notified", String(filter === "notified"));
            if (typeFilter !== "all") params.set("productType", typeFilter);
            params.set("page", String(pageNum));
            params.set("limit", String(PAGE_SIZE));
            const res = await fetch(
                `/api/stock-notifications?${params.toString()}`,
            );
            const data = await res.json();
            setNotifications(data.notifications ?? []);
            setTotalPages(data.totalPages ?? 1);
            setTotalCount(data.totalCount ?? 0);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchNotifications(1);
    }, [filter, typeFilter]);

    useEffect(() => {
        fetchNotifications(page);
    }, [page]);

    const handleMarkNotified = async (id: string) => {
        setMarkingId(id);
        try {
            await fetch("/api/stock-notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id }),
            });
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              notified: true,
                              notifiedAt: new Date().toISOString(),
                          }
                        : n,
                ),
            );
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllForProduct = async (productId: string) => {
        try {
            await fetch("/api/stock-notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });
            setNotifications((prev) =>
                prev.map((n) =>
                    n.productId === productId
                        ? {
                              ...n,
                              notified: true,
                              notifiedAt: new Date().toISOString(),
                          }
                        : n,
                ),
            );
        } catch {
            // silently fail
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this notification request?")) return;
        setDeletingId(id);
        try {
            await fetch(`/api/stock-notifications?id=${id}`, {
                method: "DELETE",
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setTotalCount((c) => c - 1);
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = notifications.filter((n) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            n.productName.toLowerCase().includes(q) ||
            n.email.toLowerCase().includes(q) ||
            n.phone.includes(q) ||
            (n.name?.toLowerCase().includes(q) ?? false)
        );
    });

    // Product summary grouping (from current page)
    const productGroups = filtered.reduce(
        (acc, n) => {
            if (!acc[n.productId]) {
                acc[n.productId] = {
                    productId: n.productId,
                    productName: n.productName,
                    productType: n.productType,
                    currentInStock: n.currentInStock,
                    productSlug: n.productSlug,
                    total: 0,
                    pending: 0,
                };
            }
            acc[n.productId].total++;
            if (!n.notified) acc[n.productId].pending++;
            return acc;
        },
        {} as Record<string, any>,
    );

    const pendingCount = notifications.filter((n) => !n.notified).length;
    const notifiedCount = notifications.filter((n) => n.notified).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/ops/control")}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Stock Notifications
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Customers waiting for out-of-stock products
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchNotifications(page)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Bell size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalCount}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                                Total Requests
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Clock size={18} className="text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {pendingCount}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                                Pending (this page)
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {notifiedCount}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                                Notified (this page)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Product Summary */}
                {Object.values(productGroups).length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Package size={16} className="text-gray-500" />
                            <h2 className="font-bold text-gray-900 text-sm">
                                By Product
                            </h2>
                            <span className="text-xs text-gray-400 ml-1">
                                (current page)
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {Object.values(productGroups).map((group: any) => (
                                <div
                                    key={group.productId}
                                    className="flex items-center justify-between px-6 py-3.5"
                                >
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-sm font-medium text-gray-900">
                                            {group.productName}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[group.productType] ?? "bg-gray-50 text-gray-600"}`}
                                        >
                                            {TYPE_LABEL[group.productType] ??
                                                group.productType}
                                        </span>
                                        {group.currentInStock !== null && (
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${group.currentInStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                                            >
                                                {group.currentInStock
                                                    ? "Now In Stock"
                                                    : "Still Out of Stock"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-500">
                                            <span className="font-bold text-orange-500">
                                                {group.pending}
                                            </span>{" "}
                                            pending · {group.total} total
                                        </span>
                                        {group.pending > 0 && (
                                            <button
                                                onClick={() =>
                                                    handleMarkAllForProduct(
                                                        group.productId,
                                                    )
                                                }
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                                            >
                                                Mark all notified
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters + Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                    <div className="flex flex-wrap gap-2">
                        {/* Status filters */}
                        {(["all", "pending", "notified"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition capitalize ${filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                            >
                                {f}
                            </button>
                        ))}

                        <span className="w-px bg-gray-200 self-stretch mx-1" />

                        {/* Product type filters */}
                        {(["all", "prebuilt", "printer", "resin"] as const).map(
                            (t) => (
                                <button
                                    key={t}
                                    onClick={() => setTypeFilter(t)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition capitalize ${typeFilter === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                                >
                                    {t === "all" ? "All Types" : TYPE_LABEL[t]}
                                </button>
                            ),
                        )}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, phone..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <Bell size={32} className="text-gray-200" />
                            <p className="text-sm font-medium">
                                No notifications found
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Customer
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Contact
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Product
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Requested On
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Status
                                        </th>
                                        <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.map((n) => (
                                        <tr
                                            key={n.id}
                                            className={`hover:bg-gray-50 transition ${n.notified ? "opacity-60" : ""}`}
                                        >
                                            {/* Customer */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        <User
                                                            size={14}
                                                            className="text-gray-500"
                                                        />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {n.name ?? (
                                                            <span className="text-gray-400 font-normal italic">
                                                                No name
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Mail
                                                            size={12}
                                                            className="text-gray-400 flex-shrink-0"
                                                        />
                                                        <span className="text-xs">
                                                            {n.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <Phone
                                                            size={12}
                                                            className="text-gray-400 flex-shrink-0"
                                                        />
                                                        <span className="text-xs">
                                                            {n.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Product */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-medium text-gray-900 text-xs line-clamp-2 max-w-[200px]">
                                                        {n.productName}
                                                    </span>
                                                    {n.variantLabel && (
                                                        <span className="text-[10px] text-gray-500 font-medium">
                                                            Variant:{" "}
                                                            <span className="text-gray-700">
                                                                {n.variantLabel}
                                                            </span>
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[n.productType] ?? "bg-gray-50 text-gray-600"}`}
                                                        >
                                                            {TYPE_LABEL[
                                                                n.productType
                                                            ] ?? n.productType}
                                                        </span>
                                                        {n.currentInStock !==
                                                            null && (
                                                            <span
                                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.currentInStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                                                            >
                                                                {n.currentInStock
                                                                    ? "Now In Stock"
                                                                    : "Still Out of Stock"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Requested On */}
                                            <td className="px-5 py-4 text-xs text-gray-500">
                                                <div className="flex flex-col gap-0.5">
                                                    <span>
                                                        {new Date(
                                                            n.createdAt,
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        {new Date(
                                                            n.createdAt,
                                                        ).toLocaleTimeString(
                                                            "en-IN",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                {n.notified ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                                                            <CheckCircle
                                                                size={11}
                                                            />{" "}
                                                            Notified
                                                        </span>
                                                        {n.notifiedAt && (
                                                            <span className="text-[10px] text-gray-400 pl-1">
                                                                {new Date(
                                                                    n.notifiedAt,
                                                                ).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                    },
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full w-fit">
                                                        <Clock size={11} />{" "}
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    {!n.notified && (
                                                        <button
                                                            onClick={() =>
                                                                handleMarkNotified(
                                                                    n.id,
                                                                )
                                                            }
                                                            disabled={
                                                                markingId ===
                                                                n.id
                                                            }
                                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {markingId ===
                                                            n.id ? (
                                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : (
                                                                <CheckCircle
                                                                    size={12}
                                                                />
                                                            )}
                                                            Mark Notified
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(n.id)
                                                        }
                                                        disabled={
                                                            deletingId === n.id
                                                        }
                                                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deletingId === n.id ? (
                                                            <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 size={12} />
                                                        )}
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination + count */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400">
                        Showing {notifications.length} of {totalCount} entries
                        {search.trim() && ` · ${filtered.length} match search`}
                    </p>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {Array.from({ length: totalPages }).map((_, i) => {
                                const p = i + 1;
                                // show first, last, current, and neighbours
                                if (
                                    p !== 1 &&
                                    p !== totalPages &&
                                    Math.abs(p - page) > 1
                                ) {
                                    if (p === 2 || p === totalPages - 1)
                                        return (
                                            <span
                                                key={p}
                                                className="text-gray-400 text-xs px-1"
                                            >
                                                …
                                            </span>
                                        );
                                    return null;
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 text-sm font-semibold rounded-lg transition ${p === page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
