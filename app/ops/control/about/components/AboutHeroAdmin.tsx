"use client";

import { Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeroData {
    id?: string;
    headline: string;
    headlineAccent: string;
    subtext: string;
    mediaUrl: string;
    buttonText: string;
    buttonLink: string;
}

const EMPTY_FORM: HeroData = {
    headline: "",
    headlineAccent: "",
    subtext: "",
    mediaUrl: "",
    buttonText: "",
    buttonLink: "",
};

export default function AboutHeroAdmin() {
    const [form, setForm] = useState<HeroData>(EMPTY_FORM);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const res = await fetch("/api/about-hero");
                if (res.ok) {
                    const data = await res.json();
                    if (data.id) {
                        setForm({
                            id: data.id,
                            headline: data.headline || "",
                            headlineAccent: data.headlineAccent || "",
                            subtext: data.subtext || "",
                            mediaUrl: data.mediaUrl || "",
                            buttonText: data.buttonText || "",
                            buttonLink: data.buttonLink || "",
                        });
                        setPreview(data.mediaUrl);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch hero data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHero();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        if (preview && !preview.startsWith("http"))
            URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.headline) {
            alert("Headline is required.");
            return;
        }

        if (!form.mediaUrl && !file) {
            alert("Background image is required.");
            return;
        }

        setIsSaving(true);
        try {
            const body = new FormData();
            if (form.id) body.append("id", form.id);
            body.append("headline", form.headline);
            body.append("headlineAccent", form.headlineAccent);
            body.append("subtext", form.subtext);
            body.append("buttonText", form.buttonText);
            body.append("buttonLink", form.buttonLink);
            body.append("mediaUrl", form.mediaUrl);
            if (file) body.append("file", file);

            const res = await fetch("/api/about-hero", {
                method: "POST",
                body,
            });

            if (res.ok) {
                const updatedData = await res.json();
                setForm(updatedData);
                setFile(null); // Clear file since it's uploaded
                alert("Hero section updated successfully!");
            } else {
                alert("Failed to save changes.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-gray-500 animate-pulse">
                Loading hero settings...
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-4xl space-y-8"
        >
            <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    About Page Hero Configuration
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Manage the main banner displayed at the top of the About Us
                    page.
                </p>
            </div>

            {/* ── Image Upload Area ── */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image
                </label>
                {preview ? (
                    <div className="relative rounded-xl overflow-hidden h-64 bg-gray-900 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium shadow-sm hover:bg-gray-50"
                            >
                                <RefreshCw className="w-4 h-4" /> Replace Image
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                    >
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-blue-600">
                            Click to upload background
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            High-res JPG/PNG recommended
                        </span>
                    </div>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* ── Text Content ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Main Headline *
                        </label>
                        <textarea
                            value={form.headline}
                            onChange={(e) =>
                                setForm({ ...form, headline: e.target.value })
                            }
                            placeholder="Building the Future of Manufacturing"
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Accent Headline (Blue Text)
                        </label>
                        <input
                            type="text"
                            value={form.headlineAccent}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    headlineAccent: e.target.value,
                                })
                            }
                            placeholder="Powered by 3D Printing"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtext
                    </label>
                    <textarea
                        value={form.subtext}
                        onChange={(e) =>
                            setForm({ ...form, subtext: e.target.value })
                        }
                        placeholder="At Scribbl3D, we're on a mission..."
                        rows={6}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                </div>
            </div>

            {/* ── CTA Button ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                    </label>
                    <input
                        type="text"
                        value={form.buttonText}
                        onChange={(e) =>
                            setForm({ ...form, buttonText: e.target.value })
                        }
                        placeholder="Browse Catalog"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Link
                    </label>
                    <input
                        type="text"
                        value={form.buttonLink}
                        onChange={(e) =>
                            setForm({ ...form, buttonLink: e.target.value })
                        }
                        placeholder="#ecosystem"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Hero Section"}
                </button>
            </div>
        </form>
    );
}
