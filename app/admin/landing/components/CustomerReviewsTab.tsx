"use client";

import {
    Eye,
    EyeOff,
    GripVertical,
    Loader2,
    MessageSquareQuote,
    Pencil,
    Plus,
    Star,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Testimonial {
    id: string;
    quote: string;
    name: string;
    role: string;
    initials: string;
    rating: number;
    sortOrder: number;
    isActive: boolean;
}

interface FormData {
    quote: string;
    name: string;
    role: string;
    initials: string;
    rating: number;
    sortOrder: number;
    isActive: boolean;
}

const EMPTY_FORM: FormData = {
    quote: "",
    name: "",
    role: "",
    initials: "",
    rating: 5,
    sortOrder: 0,
    isActive: true,
};

export default function CustomerReviewsTab() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

    const fetchTestimonials = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/landingPage/testimonials");
            const data = await res.json();
            setTestimonials(data);
        } catch (err) {
            console.error("Failed to fetch:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    // Auto-generate initials when name changes
    const updateName = (name: string) => {
        const initials = name
            .split(" ")
            .map((w) => w[0] || "")
            .join("")
            .toUpperCase()
            .slice(0, 2);
        setForm((p) => ({ ...p, name, initials }));
    };

    const closeModal = () => {
        setModal(null);
        setEditId(null);
        setForm(EMPTY_FORM);
    };

    const handleSave = async () => {
        if (!form.quote.trim() || !form.name.trim()) {
            alert("Quote and Name are required.");
            return;
        }
        setSaving(true);
        try {
            const url = editId
                ? `/api/admin/landingPage/testimonials/${editId}`
                : "/api/admin/landingPage/testimonials";
            const res = await fetch(url, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok)
                throw new Error((await res.json()).error || "Save failed");
            closeModal();
            fetchTestimonials();
        } catch (err: any) {
            alert(err.message || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(`/api/admin/landingPage/testimonials/${deleteTarget.id}`, {
            method: "DELETE",
        });
        setDeleteTarget(null);
        fetchTestimonials();
    };

    const toggleActive = async (t: Testimonial) => {
        await fetch(`/api/admin/landingPage/testimonials/${t.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...t, isActive: !t.isActive }),
        });
        fetchTestimonials();
    };

    const openEdit = (t: Testimonial) => {
        setEditId(t.id);
        setForm({
            quote: t.quote,
            name: t.name,
            role: t.role,
            initials: t.initials,
            rating: t.rating,
            sortOrder: t.sortOrder,
            isActive: t.isActive,
        });
        setModal("edit");
    };

    return (
        <>
            {/* Header row */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                    {testimonials.length} review
                    {testimonials.length !== 1 ? "s" : ""}
                </p>
                <button
                    onClick={() => {
                        setForm({
                            ...EMPTY_FORM,
                            sortOrder: testimonials.length,
                        });
                        setEditId(null);
                        setModal("create");
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Review
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-20 bg-gray-200 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : testimonials.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <MessageSquareQuote className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="mt-3 text-gray-500">
                        No customer reviews yet
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className={`flex items-start gap-4 p-4 bg-white rounded-xl border transition-all ${t.isActive ? "border-gray-100" : "border-gray-200 opacity-60"}`}
                        >
                            <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0 cursor-grab mt-1" />

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                {t.initials}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {t.name}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        ·
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {t.role}
                                    </span>
                                </div>
                                <div className="flex gap-0.5 mb-1.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 italic">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Order: {t.sortOrder}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => toggleActive(t)}
                                    className={`p-2 rounded-lg transition-colors ${t.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                                >
                                    {t.isActive ? (
                                        <Eye className="w-4 h-4" />
                                    ) : (
                                        <EyeOff className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => openEdit(t)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(t)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modal === "create"
                                    ? "Add Review"
                                    : "Edit Review"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Quote */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Quote *
                                </label>
                                <textarea
                                    value={form.quote}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            quote: e.target.value,
                                        }))
                                    }
                                    placeholder="The dimensional accuracy is unmatched..."
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            {/* Name + Role */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            updateName(e.target.value)
                                        }
                                        placeholder="Marcus K."
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                role: e.target.value,
                                            }))
                                        }
                                        placeholder="Lead Engineer, Nexa Aero"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            {/* Initials + Rating */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Initials
                                    </label>
                                    <input
                                        type="text"
                                        value={form.initials}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                initials: e.target.value
                                                    .toUpperCase()
                                                    .slice(0, 2),
                                            }))
                                        }
                                        maxLength={2}
                                        placeholder="MK"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none text-center font-bold"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Auto-filled from name
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Rating
                                    </label>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        rating: star,
                                                    }))
                                                }
                                                className="p-0.5"
                                            >
                                                <Star
                                                    className={`w-5 h-5 transition-colors ${star <= form.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300"}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                sortOrder:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            {/* Active */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            isActive: e.target.checked,
                                        }))
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-[#4f46e5] focus:ring-[#4f46e5]"
                                />
                                <span className="text-sm text-gray-700">
                                    Active (visible on landing page)
                                </span>
                            </label>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={
                                    saving ||
                                    !form.quote.trim() ||
                                    !form.name.trim()
                                }
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {saving
                                    ? "Saving..."
                                    : editId
                                      ? "Update"
                                      : "Add Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            Delete Review?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            This will permanently remove the review by &quot;
                            {deleteTarget.name}&quot;.
                        </p>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
