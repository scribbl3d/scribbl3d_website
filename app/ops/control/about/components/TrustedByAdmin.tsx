"use client";

import { Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Partner = {
    id: string;
    name: string;
    sub: string;
    image: string;
};

export default function TrustedByAdmin() {
    const [items, setItems] = useState<Partner[]>([]);
    const [formData, setFormData] = useState({ name: "", sub: "" });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch("/api/partners");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch partners", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            alert("Please upload an image file.");
            return;
        }

        setFile(selectedFile);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.sub || !file) {
            alert("Please fill all fields and select an image.");
            return;
        }

        setIsSaving(true);
        try {
            // Use FormData for file uploads
            const body = new FormData();
            body.append("name", formData.name);
            body.append("sub", formData.sub);
            body.append("file", file);

            const res = await fetch("/api/partners", {
                method: "POST",
                body: body, // No headers needed, fetch sets multipart boundary automatically
            });

            if (res.ok) {
                const newItem = await res.json();
                setItems([...items, newItem]);

                // Reset form
                setFormData({ name: "", sub: "" });
                setFile(null);
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
            } else {
                const err = await res.json();
                alert(err.error || "Upload failed");
            }
        } catch (error) {
            console.error("Failed to add partner", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const previousItems = [...items];
        setItems(items.filter((item) => item.id !== id));

        try {
            const res = await fetch(`/api/partners/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
        } catch (error) {
            console.error("Failed to delete partner", error);
            setItems(previousItems);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-gray-500 animate-pulse">
                Loading database records...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Add New Card Form ── */}
            <form
                onSubmit={handleAdd}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6"
            >
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Add New Partner Card
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heading
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g., Tesla"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subheading
                        </label>
                        <input
                            type="text"
                            value={formData.sub}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sub: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="e.g., Automotive"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Logo *
                        </label>
                        {preview ? (
                            <div className="relative rounded-lg overflow-hidden h-10 w-full bg-gray-50 border border-gray-200 group flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-full object-contain p-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center justify-center h-10 w-full border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <span className="flex items-center gap-2 text-sm text-gray-500">
                                    <Upload className="w-4 h-4" /> Upload Image
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
                </div>

                <button
                    type="submit"
                    disabled={isSaving || !file}
                    className="self-start flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Uploading..." : "Add to Carousel"}
                </button>
            </form>

            {/* ── Current Cards List ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Active Carousel Cards ({items.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                    Image
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Heading
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subheading
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-16 h-12 bg-white rounded-md border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.sub}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors inline-flex"
                                            title="Delete partner"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
