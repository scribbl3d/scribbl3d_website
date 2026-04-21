"use client";

import { ImageIcon, Loader2, Trash2, Upload, VideoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PageHero = {
    id: string;
    page: string;
    mediaUrl: string;
    mediaType: string;
    headline: string | null;
    subtext: string | null;
};

interface HeroBannerEditorProps {
    page: string; // "resins", "printers", etc.
}

export default function HeroBannerEditor({ page }: HeroBannerEditorProps) {
    const [hero, setHero] = useState<PageHero | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mediaType, setMediaType] = useState<"video" | "image">("video");
    const [headline, setHeadline] = useState("");
    const [subtext, setSubtext] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const fileRef = useRef<HTMLInputElement>(null);

    // Fetch existing hero
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/admin/page-hero/${page}`);
                const data = await res.json();
                if (data?.id) {
                    setHero(data);
                    setMediaType(data.mediaType as "video" | "image");
                    setHeadline(data.headline || "");
                    setSubtext(data.subtext || "");
                    setPreviewUrl(data.mediaUrl);
                }
            } catch (err) {
                console.error("Failed to load hero:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [page]);

    // Handle file select
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));

        // Auto-detect media type from file
        if (f.type.startsWith("video/")) setMediaType("video");
        else setMediaType("image");
    };

    // Save
    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("mediaType", mediaType);
            formData.append("headline", headline);
            formData.append("subtext", subtext);

            if (file) {
                formData.append("mediaFile", file);
            } else if (previewUrl) {
                formData.append("mediaUrl", previewUrl);
            }

            const res = await fetch(`/api/admin/page-hero/${page}`, {
                method: "PUT",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setHero(data);
                setFile(null);
                setPreviewUrl(data.mediaUrl);
                alert("Hero banner saved!");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save");
            }
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save hero banner");
        } finally {
            setSaving(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this hero banner? The page will use the default fallback.")) {
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/page-hero/${page}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setHero(null);
                setPreviewUrl("");
                setHeadline("");
                setSubtext("");
                setFile(null);
                alert("Hero banner deleted! Page will now use the default fallback.");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete hero banner");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading hero banner...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Hero Banner</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left — Media preview + upload */}
                <div>
                    {/* Preview */}
                    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                        {previewUrl ? (
                            mediaType === "video" ? (
                                <video
                                    src={previewUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Hero preview"
                                    className="w-full h-full object-cover"
                                />
                            )
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon className="w-10 h-10 mb-2" />
                                <span className="text-sm">
                                    No media uploaded
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Upload button */}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image or Video
                    </button>

                    {/* Media type indicator */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        {mediaType === "video" ? (
                            <VideoIcon className="w-4 h-4" />
                        ) : (
                            <ImageIcon className="w-4 h-4" />
                        )}
                        <span className="capitalize">{mediaType}</span>
                        {file && (
                            <span className="text-indigo-600">
                                (new file selected)
                            </span>
                        )}
                    </div>
                </div>

                {/* Right — Text fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Headline{" "}
                            <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="e.g. Discover Cutting-Edge Resins"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtext{" "}
                            <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={subtext}
                            onChange={(e) => setSubtext(e.target.value)}
                            placeholder="e.g. Explore our extensive selection of resins."
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="text-xs text-gray-400">
                        Leave headline & subtext empty to show only the
                        background media without text overlay.
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving || !previewUrl}
                            className="flex-1 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            {hero ? "Update Hero" : "Save Hero"}
                        </button>

                        {hero && (
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title="Delete hero banner and use fallback"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}