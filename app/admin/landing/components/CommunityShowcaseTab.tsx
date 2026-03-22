"use client";

import {
    ExternalLink,
    Eye,
    EyeOff,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CommunityImage {
    id: string;
    imageUrl: string;
    altText: string | null;
    linkPath: string | null;
    sortOrder: number;
    isActive: boolean;
}

interface FormData {
    altText: string;
    linkPath: string;
    sortOrder: number;
    isActive: boolean;
}

const EMPTY_FORM: FormData = {
    altText: "",
    linkPath: "",
    sortOrder: 0,
    isActive: true,
};

export default function CommunityShowcaseTab() {
    const [images, setImages] = useState<CommunityImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<CommunityImage | null>(
        null,
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
        null,
    );
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchImages = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/landingPage/community-images");
            const data = await res.json();
            setImages(data);
        } catch (err) {
            console.error("Failed to fetch:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);
    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        };
    }, [filePreview]);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            return;
        }
        setSelectedFile(file);
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(URL.createObjectURL(file));
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const closeModal = () => {
        setModal(null);
        setEditId(null);
        setForm(EMPTY_FORM);
        clearFile();
        setExistingImageUrl(null);
    };

    const handleSave = async () => {
        if (!editId && !selectedFile) {
            alert("Please upload an image.");
            return;
        }
        setSaving(true);
        try {
            const body = new FormData();
            body.append("altText", form.altText);
            body.append("linkPath", form.linkPath);
            body.append("sortOrder", String(form.sortOrder));
            body.append("isActive", String(form.isActive));
            if (selectedFile) body.append("file", selectedFile);
            const url = editId
                ? `/api/admin/landingPage/community-images/${editId}`
                : "/api/admin/landingPage/community-images";
            const res = await fetch(url, {
                method: editId ? "PUT" : "POST",
                body,
            });
            if (!res.ok)
                throw new Error((await res.json()).error || "Save failed");
            closeModal();
            fetchImages();
        } catch (err: any) {
            alert(err.message || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(
            `/api/admin/landingPage/community-images/${deleteTarget.id}`,
            {
                method: "DELETE",
            },
        );
        setDeleteTarget(null);
        fetchImages();
    };

    const toggleActive = async (img: CommunityImage) => {
        const body = new FormData();
        body.append("altText", img.altText || "");
        body.append("linkPath", img.linkPath || "");
        body.append("sortOrder", String(img.sortOrder));
        body.append("isActive", String(!img.isActive));
        await fetch(`/api/admin/landingPage/community-images/${img.id}`, {
            method: "PUT",
            body,
        });
        fetchImages();
    };

    const openEdit = (img: CommunityImage) => {
        setEditId(img.id);
        setForm({
            altText: img.altText || "",
            linkPath: img.linkPath || "",
            sortOrder: img.sortOrder,
            isActive: img.isActive,
        });
        setExistingImageUrl(img.imageUrl);
        setSelectedFile(null);
        setFilePreview(null);
        setModal("edit");
    };

    const previewUrl = filePreview || existingImageUrl;

    return (
        <>
            {/* Header row */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                    {images.length} image{images.length !== 1 ? "s" : ""}
                </p>
                <button
                    onClick={() => {
                        setForm({ ...EMPTY_FORM, sortOrder: images.length });
                        setEditId(null);
                        clearFile();
                        setExistingImageUrl(null);
                        setModal("create");
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Image
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="mt-3 text-gray-500">
                        No community images yet
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className={`relative group rounded-xl overflow-hidden border transition-all ${img.isActive ? "border-gray-100" : "border-gray-200 opacity-50"}`}
                        >
                            <div className="aspect-square bg-gray-100">
                                <img
                                    src={img.imageUrl}
                                    alt={img.altText || ""}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {img.linkPath && (
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-md text-[10px] text-white flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />{" "}
                                    {img.linkPath}
                                </div>
                            )}
                            <div className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                {img.sortOrder}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => toggleActive(img)}
                                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    {img.isActive ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => openEdit(img)}
                                    className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(img)}
                                    className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
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
                                    ? "Add Image"
                                    : "Edit Image"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Image *
                                </label>
                                {previewUrl ? (
                                    <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-100">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            {selectedFile && (
                                                <button
                                                    type="button"
                                                    onClick={clearFile}
                                                    className="p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const f = e.dataTransfer.files[0];
                                            if (f) handleFileSelect(f);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging ? "border-[#4f46e5] bg-[#4f46e5]/5" : "border-gray-300 hover:border-[#4f46e5]"}`}
                                    >
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium text-[#4f46e5]">
                                                Click to upload
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Square, high quality
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileSelect(f);
                                    }}
                                />
                            </div>
                            {/* Alt text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Alt Text
                                </label>
                                <input
                                    type="text"
                                    value={form.altText}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            altText: e.target.value,
                                        }))
                                    }
                                    placeholder="3D printed drone frame"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                />
                            </div>
                            {/* Link path */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Link Path{" "}
                                    <span className="text-gray-400 font-normal">
                                        (optional — makes clickable)
                                    </span>
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.linkPath}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                linkPath: e.target.value,
                                            }))
                                        }
                                        placeholder="/printers/xyz or /prebuilt-products/abc"
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Leave empty if not clickable
                                </p>
                            </div>
                            {/* Sort + active */}
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="flex items-end pb-1">
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
                                            Active
                                        </span>
                                    </label>
                                </div>
                            </div>
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
                                disabled={saving || (!editId && !selectedFile)}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {saving
                                    ? "Uploading..."
                                    : editId
                                      ? "Update"
                                      : "Add Image"}
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
                            Delete Image?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            This will permanently remove this image from the
                            community showcase.
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
