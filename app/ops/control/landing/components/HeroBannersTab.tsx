"use client";

import {
    Eye,
    EyeOff,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
    Video,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface HeroBanner {
    id: string;
    headline: string;
    headlineAccent: string | null;
    subtext: string | null;
    mediaUrl: string;
    mediaType: string;
    altText: string | null;
    buttonText: string | null;
    buttonLink: string | null;
    sortOrder: number;
    isActive: boolean;
    duration: number;
    buttonGradientFrom: string | null;
    buttonGradientTo: string | null;
    textColor: string | null;
}

interface FormData {
    headline: string;
    headlineAccent: string;
    subtext: string;
    mediaType: string;
    altText: string;
    buttonText: string;
    buttonLink: string;
    sortOrder: number;
    isActive: boolean;
    duration: number;
    buttonGradientFrom: string;
    buttonGradientTo: string;
    textColor: string;
}

const EMPTY_FORM: FormData = {
    headline: "",
    headlineAccent: "",
    subtext: "",
    mediaType: "image",
    altText: "",
    buttonText: "",
    buttonLink: "",
    sortOrder: 0,
    isActive: true,
    duration: 5000,
    buttonGradientFrom: "#4f46e5",
    buttonGradientTo: "#7c3aed",
    textColor: "#ffffff",
};

export default function HeroBannersTab() {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<"create" | "edit" | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<HeroBanner | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(
        null,
    );
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/landingPage/hero-banners");
            const data = await res.json();
            setBanners(data);
        } catch (err) {
            console.error("Failed to fetch banners:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);
    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        };
    }, [filePreview]);

    const handleFileSelect = (file: File) => {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) {
            alert("Please upload an image or video file.");
            return;
        }
        setForm((p) => ({ ...p, mediaType: isVideo ? "video" : "image" }));
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
        setExistingMediaUrl(null);
    };

    const handleSave = async () => {
        if (!form.headline.trim()) {
            alert("Headline is required.");
            return;
        }
        if (!editId && !selectedFile) {
            alert("Please upload an image or video.");
            return;
        }
        setSaving(true);
        try {
            const body = new FormData();
            body.append("headline", form.headline);
            body.append("headlineAccent", form.headlineAccent);
            body.append("subtext", form.subtext);
            body.append("mediaType", form.mediaType);
            body.append("altText", form.altText);
            body.append("buttonText", form.buttonText);
            body.append("buttonLink", form.buttonLink);
            body.append("sortOrder", String(form.sortOrder));
            body.append("isActive", String(form.isActive));
            body.append("duration", String(form.duration));
            body.append("buttonGradientFrom", form.buttonGradientFrom);
            body.append("buttonGradientTo", form.buttonGradientTo);
            body.append("textColor", form.textColor);
            if (selectedFile) body.append("file", selectedFile);
            const url = editId
                ? `/api/admin/landingPage/hero-banners/${editId}`
                : "/api/admin/landingPage/hero-banners";
            const res = await fetch(url, {
                method: editId ? "PUT" : "POST",
                body,
            });
            if (!res.ok)
                throw new Error((await res.json()).error || "Save failed");
            closeModal();
            fetchBanners();
        } catch (err: any) {
            alert(err.message || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await fetch(`/api/admin/landingPage/hero-banners/${deleteTarget.id}`, {
            method: "DELETE",
        });
        setDeleteTarget(null);
        fetchBanners();
    };

    const toggleActive = async (banner: HeroBanner) => {
        const body = new FormData();
        body.append("headline", banner.headline);
        body.append("headlineAccent", banner.headlineAccent || "");
        body.append("subtext", banner.subtext || "");
        body.append("mediaType", banner.mediaType);
        body.append("altText", banner.altText || "");
        body.append("buttonText", banner.buttonText || "");
        body.append("buttonLink", banner.buttonLink || "");
        body.append("sortOrder", String(banner.sortOrder));
        body.append("isActive", String(!banner.isActive));
        body.append("duration", String(banner.duration));
        body.append(
            "buttonGradientFrom",
            banner.buttonGradientFrom || "#4f46e5",
        );
        body.append("buttonGradientTo", banner.buttonGradientTo || "#7c3aed");
        body.append("textColor", banner.textColor || "#ffffff");
        await fetch(`/api/admin/landingPage/hero-banners/${banner.id}`, {
            method: "PUT",
            body,
        });
        fetchBanners();
    };

    const openEdit = (banner: HeroBanner) => {
        setEditId(banner.id);
        setForm({
            headline: banner.headline,
            headlineAccent: banner.headlineAccent || "",
            subtext: banner.subtext || "",
            mediaType: banner.mediaType,
            altText: banner.altText || "",
            buttonText: banner.buttonText || "",
            buttonLink: banner.buttonLink || "",
            sortOrder: banner.sortOrder,
            isActive: banner.isActive,
            duration: banner.duration,
            buttonGradientFrom: banner.buttonGradientFrom || "#4f46e5",
            buttonGradientTo: banner.buttonGradientTo || "#7c3aed",
            textColor: banner.textColor || "#ffffff",
        });
        setExistingMediaUrl(banner.mediaUrl);
        setSelectedFile(null);
        setFilePreview(null);
        setModal("edit");
    };

    const previewUrl = filePreview || existingMediaUrl;
    const previewType = selectedFile
        ? form.mediaType
        : banners.find((b) => b.id === editId)?.mediaType || "image";

    return (
        <>
            {/* Header row */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                    {banners.length} banner{banners.length !== 1 ? "s" : ""}
                </p>
                <button
                    onClick={() => {
                        setForm({ ...EMPTY_FORM, sortOrder: banners.length });
                        setEditId(null);
                        clearFile();
                        setExistingMediaUrl(null);
                        setModal("create");
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Banner
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
            ) : banners.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="mt-3 text-gray-500">No hero banners yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className={`flex items-center gap-4 p-4 bg-white rounded-xl border transition-all ${banner.isActive ? "border-gray-100" : "border-gray-200 opacity-60"}`}
                        >
                            <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0 cursor-grab" />
                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                {banner.mediaType === "video" ? (
                                    <>
                                        <video
                                            src={banner.mediaUrl}
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Video className="w-4 h-4 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src={banner.mediaUrl}
                                        alt={banner.altText || banner.headline}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded uppercase ${banner.mediaType === "video" ? "text-purple-600 bg-purple-50" : "text-emerald-600 bg-emerald-50"}`}
                                    >
                                        {banner.mediaType}
                                    </span>
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {banner.headline.replace(/\n/g, " ")}
                                    </h3>
                                </div>
                                {banner.headlineAccent && (
                                    <p className="text-xs text-[#4f46e5] truncate mt-0.5">
                                        {banner.headlineAccent.replace(
                                            /\n/g,
                                            " ",
                                        )}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Order: {banner.sortOrder}
                                    {banner.mediaType === "image" &&
                                        ` · ${banner.duration / 1000}s`}
                                    {banner.buttonText &&
                                        ` · CTA: ${banner.buttonText}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={() => toggleActive(banner)}
                                    className={`p-2 rounded-lg transition-colors ${banner.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                                >
                                    {banner.isActive ? (
                                        <Eye className="w-4 h-4" />
                                    ) : (
                                        <EyeOff className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => openEdit(banner)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(banner)}
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
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {modal === "create"
                                    ? "Add New Banner"
                                    : "Edit Banner"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-1.5 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Media type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Media Type
                                </label>
                                <div className="flex gap-2">
                                    {(["image", "video"] as const).map(
                                        (type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    setForm((p) => ({
                                                        ...p,
                                                        mediaType: type,
                                                    }));
                                                    if (
                                                        selectedFile &&
                                                        !selectedFile.type.startsWith(
                                                            `${type}/`,
                                                        )
                                                    )
                                                        clearFile();
                                                }}
                                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${form.mediaType === type ? "border-[#4f46e5] bg-[#4f46e5]/5 text-[#4f46e5]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                                            >
                                                {type === "image" ? (
                                                    <ImageIcon className="w-4 h-4" />
                                                ) : (
                                                    <Video className="w-4 h-4" />
                                                )}{" "}
                                                {type.charAt(0).toUpperCase() +
                                                    type.slice(1)}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                            {/* Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {form.mediaType === "video"
                                        ? "Video"
                                        : "Image"}{" "}
                                    *
                                </label>
                                {previewUrl ? (
                                    <div className="relative rounded-xl overflow-hidden h-44 bg-gray-900">
                                        {previewType === "video" ? (
                                            <video
                                                src={previewUrl}
                                                muted
                                                controls
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
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
                                        {selectedFile && (
                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md text-xs text-white truncate max-w-[60%]">
                                                {selectedFile.name}
                                            </div>
                                        )}
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
                                        className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging ? "border-[#4f46e5] bg-[#4f46e5]/5" : "border-gray-300 hover:border-[#4f46e5]"}`}
                                    >
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium text-[#4f46e5]">
                                                Click to upload
                                            </span>{" "}
                                            or drag and drop
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={
                                        form.mediaType === "video"
                                            ? "video/*"
                                            : "image/*"
                                    }
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileSelect(f);
                                    }}
                                />
                            </div>
                            {/* Headlines */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Headline *
                                    </label>
                                    <textarea
                                        value={form.headline}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                headline: e.target.value,
                                            }))
                                        }
                                        placeholder={"INDUSTRIAL\nSTRENGTH."}
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Use line breaks for multi-line
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Accent Headline{" "}
                                        <span className="text-gray-400">
                                            (blue text)
                                        </span>
                                    </label>
                                    <textarea
                                        value={form.headlineAccent}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                headlineAccent: e.target.value,
                                            }))
                                        }
                                        placeholder={"DESKTOP\nPRECISION."}
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none resize-none"
                                    />
                                </div>
                            </div>
                            {/* Subtext */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Subtext
                                </label>
                                <textarea
                                    value={form.subtext}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            subtext: e.target.value,
                                        }))
                                    }
                                    placeholder="Engineered for reliability..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            {/* CTA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Button Text
                                    </label>
                                    <input
                                        type="text"
                                        value={form.buttonText}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                buttonText: e.target.value,
                                            }))
                                        }
                                        placeholder="Explore Filaments"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Button Link
                                    </label>
                                    <input
                                        type="text"
                                        value={form.buttonLink}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                buttonLink: e.target.value,
                                            }))
                                        }
                                        placeholder="/filament"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            {/* Colors */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Colors
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">
                                            Button From
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.buttonGradientFrom}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        buttonGradientFrom:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                                            />
                                            <input
                                                type="text"
                                                value={form.buttonGradientFrom}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        buttonGradientFrom:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">
                                            Button To
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.buttonGradientTo}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        buttonGradientTo:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                                            />
                                            <input
                                                type="text"
                                                value={form.buttonGradientTo}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        buttonGradientTo:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">
                                            Text Color
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.textColor}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        textColor:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                                            />
                                            <input
                                                type="text"
                                                value={form.textColor}
                                                onChange={(e) =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        textColor:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Preview swatch */}
                                <div className="mt-2 flex items-center gap-2">
                                    <div
                                        className="h-6 w-20 rounded-md"
                                        style={{
                                            background: `linear-gradient(to right, ${form.buttonGradientFrom}, ${form.buttonGradientTo})`,
                                        }}
                                    />
                                    <span className="text-[10px] text-gray-400">
                                        Button preview
                                    </span>
                                </div>
                            </div>
                            {/* Settings */}
                            <div className="grid grid-cols-3 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Duration (ms)
                                        {form.mediaType === "video" && (
                                            <span className="text-gray-400 font-normal">
                                                {" "}
                                                — auto
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        value={form.duration}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                duration:
                                                    parseInt(e.target.value) ||
                                                    5000,
                                            }))
                                        }
                                        step={1000}
                                        disabled={form.mediaType === "video"}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none disabled:opacity-50 disabled:bg-gray-50"
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
                                disabled={
                                    saving ||
                                    !form.headline.trim() ||
                                    (!editId && !selectedFile)
                                }
                                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {saving
                                    ? "Uploading..."
                                    : editId
                                      ? "Update Banner"
                                      : "Create Banner"}
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
                            Delete Banner?
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            This will permanently remove &quot;
                            {deleteTarget.headline.replace(/\n/g, " ")}&quot;
                            from the carousel.
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
