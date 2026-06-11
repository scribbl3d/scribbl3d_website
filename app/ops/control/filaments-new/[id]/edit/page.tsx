"use client";

import { ArrowLeft, Plus, Save, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingOverlay } from "@/components/ui/loading-spinner";

/* ===================== CONSTANTS ===================== */

const MATERIAL_OPTIONS = ["PLA+", "ABS", "PETG", "TPU", "PA"];
const FINISH_OPTIONS = ["Gloss", "Matte", "Metallic", "Silk", "Marble", "Wood", "Glow in the Dark", "Carbon fiber", "Glass fiber"];
const BRAND_OPTIONS = ["Scribbl3D", "eSUN", "Hatchbox", "Overture", "Polymaker", "Prusament"];
const DIAMETER_OPTIONS = ["1.75mm", "2.85mm", "3mm"];
const SPOOL_WEIGHT_OPTIONS = ["250g", "500g", "1kg", "2kg", "3kg"];
const SPEC_CATEGORIES = ["Printing Parameters", "Physical Properties", "Mechanical Properties"];

/* ===================== TYPES ===================== */

type ImageItem = {
    url: string;
    file?: File;
    sortOrder: number;
    isMain: boolean;
};

export default function EditFilamentPage() {
    const params = useParams();
    const router = useRouter();
    const filamentId = params.id as string;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        shortDescription: "",
        longDescription: "",
        material: "",
        finishType: "",
        brand: "",
        category: "",
        colorName: "",
        hexCode: "",
        inStock: true,
        features: [] as string[],
        applications: [] as string[],
        compatibility: [] as string[],
        images: [] as ImageItem[],
    });

    const [variants, setVariants] = useState<any[]>([]);
    const [specifications, setSpecifications] = useState<any[]>([]);
    const [downloads, setDownloads] = useState<any[]>([]);

    const [newFeature, setNewFeature] = useState("");
    const [newApplication, setNewApplication] = useState("");
    const [newCompatibility, setNewCompatibility] = useState("");

    /* ===================== FETCH DATA ===================== */

    useEffect(() => {
        fetchFilament();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filamentId]);

    const fetchFilament = async () => {
        try {
            const res = await fetch(`/api/admin/filaments/${filamentId}`);
            if (!res.ok) throw new Error("Failed to fetch filament");
            
            const data = await res.json();
            
            setFormData({
                name: data.name || "",
                slug: data.slug || "",
                shortDescription: data.shortDescription || "",
                longDescription: data.longDescription || "",
                material: data.material || "",
                finishType: data.finishType || "",
                brand: data.brand || "",
                category: data.category || "",
                colorName: data.colorName || "",
                hexCode: data.hexCode || "",
                inStock: data.inStock,
                features: data.features || [],
                applications: data.applications || [],
                compatibility: data.compatibility || [],
                images: (data.images || []).map((url: string, index: number) => ({
                    url,
                    sortOrder: index,
                    isMain: index === 0,
                })),
            });

            setVariants(data.variants || []);
            setSpecifications(data.specifications || []);
            setDownloads(data.downloads || []);
        } catch (error) {
            console.error("Error fetching filament:", error);
            alert("Failed to load filament data");
        } finally {
            setFetching(false);
        }
    };

    /* ===================== HANDLERS ===================== */

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const validateHexCode = (hex: string): boolean => {
        if (!hex) return true; // Allow empty
        // Check if it's a valid hex color (with or without #)
        const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(hex);
    };

    const normalizeHexCode = (hex: string): string => {
        if (!hex) return "";
        // Add # if missing
        return hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        
        // Trim leading/trailing spaces for brand field
        if (name === "brand" && typeof newValue === "string") {
            newValue = newValue.trim();
        }
        
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: newValue,
            };
            
            // Auto-generate slug when name changes
            if (name === "name" && value) {
                updated.slug = generateSlug(value);
            }
            
            // Validate and normalize hex code
            if (name === "hexCode" && value) {
                const hexValue = value as string;
                if (validateHexCode(hexValue)) {
                    updated.hexCode = normalizeHexCode(hexValue);
                } else {
                    // Keep the invalid value but don't normalize
                    updated.hexCode = hexValue;
                }
            }
            
            return updated;
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map((file, index) => ({
            url: URL.createObjectURL(file),
            file,
            sortOrder: formData.images.length + index,
            isMain: formData.images.length === 0 && index === 0,
        }));
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const setMainImage = (index: number) => {
        const newImages = [...formData.images];
        const [selected] = newImages.splice(index, 1);
        newImages.unshift({ ...selected, isMain: true });
        const normalizedImages = newImages.map((img, i) => ({
            ...img,
            isMain: i === 0,
            sortOrder: i,
        }));
        setFormData({ ...formData, images: normalizedImages });
    };

    const addVariant = () => {
        setVariants([...variants, { diameter: "", spoolWeight: "", price: "", originalPrice: "", inStock: true, isDefault: false }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const addSpecification = () => {
        setSpecifications([...specifications, { category: "Printing Parameters", key: "", value: "" }]);
    };

    const removeSpecification = (index: number) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const updateSpecification = (index: number, field: string, value: string) => {
        const updated = [...specifications];
        updated[index] = { ...updated[index], [field]: value };
        setSpecifications(updated);
    };

    const addDownload = () => {
        setDownloads([...downloads, { title: "", description: "", fileUrl: "" }]);
    };

    const removeDownload = (index: number) => {
        setDownloads(downloads.filter((_, i) => i !== index));
    };

    const updateDownload = (index: number, field: string, value: string) => {
        const updated = [...downloads];
        updated[index] = { ...updated[index], [field]: value };
        setDownloads(updated);
    };

    const addToArray = (field: "features" | "applications" | "compatibility", value: string) => {
        if (value.trim()) {
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value.trim()],
            }));
            if (field === "features") setNewFeature("");
            if (field === "applications") setNewApplication("");
            if (field === "compatibility") setNewCompatibility("");
        }
    };

    const removeFromArray = (field: "features" | "applications" | "compatibility", index: number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            
            // Basic fields
            data.append("name", formData.name);
            data.append("slug", formData.slug);
            data.append("shortDescription", formData.shortDescription);
            data.append("longDescription", formData.longDescription);
            data.append("material", formData.material);
            data.append("finishType", formData.finishType);
            data.append("brand", formData.brand);
            data.append("category", formData.category);
            data.append("colorName", formData.colorName);
            data.append("hexCode", formData.hexCode);
            data.append("inStock", String(formData.inStock));

            // Arrays
            data.append("features", JSON.stringify(formData.features));
            data.append("applications", JSON.stringify(formData.applications));
            data.append("compatibility", JSON.stringify(formData.compatibility));

            // Images - handle existing URLs and new file uploads
            const existingImages = formData.images
                .filter((img) => !img.file)
                .map((img) => img.url);
            data.append("images", JSON.stringify(existingImages));

            formData.images.forEach((img) => {
                if (img.file) {
                    data.append("newImages", img.file);
                }
            });

            // Variants
            data.append("variants", JSON.stringify(variants));

            // Specifications
            data.append("specifications", JSON.stringify(specifications.filter(s => s.key && s.value)));

            // Downloads
            data.append("downloads", JSON.stringify(downloads.filter(d => d.title && d.fileUrl)));

            const response = await fetch(`/api/admin/filaments/${filamentId}`, {
                method: "PUT",
                body: data,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to update filament");
            }

            router.push("/ops/control/filaments-new");
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
                    <p className="mt-4 text-gray-600">Loading filament data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {loading && (
                <LoadingOverlay
                    message="Updating Filament…"
                    submessage="This may take up to a few minutes. Please do not close this window."
                />
            )}

            <form onSubmit={handleSubmit}>
                <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div className="flex items-center gap-3">
                            <Link href="/ops/control/filaments-new" className="text-gray-600 hover:text-black">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-lg sm:text-xl font-bold">Edit Filament</h1>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-5 py-2 rounded hover:bg-gray-800 transition text-sm sm:text-base disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Updating…" : "Update Filament"}
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Material</label>
                            <select
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">Select material</option>
                                {MATERIAL_OPTIONS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Finish Type</label>
                            <select
                                name="finishType"
                                value={formData.finishType}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">Select finish</option>
                                {FINISH_OPTIONS.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="e.g., Scribbl3D, eSUN, Polymaker"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Color Name</label>
                            <input
                                type="text"
                                name="colorName"
                                value={formData.colorName}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    name="hexCode"
                                    value={formData.hexCode || "#000000"}
                                    onChange={handleChange}
                                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                />
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="hexCode"
                                        value={formData.hexCode}
                                        onChange={handleChange}
                                        className={`w-full border rounded-lg px-3 py-2 ${
                                            formData.hexCode && !validateHexCode(formData.hexCode)
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-gray-900"
                                        } focus:ring-2 focus:border-transparent`}
                                        placeholder="#FFD700 or FFD700"
                                    />
                                    {formData.hexCode && !validateHexCode(formData.hexCode) && (
                                        <p className="mt-1 text-xs text-red-600">
                                            Invalid hex code. Use format: #FFD700 or FFD700
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                            <input
                                type="text"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                required
                                maxLength={92}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                placeholder="Brief description for product listing"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.shortDescription.length}/92 characters
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Long Description</label>
                            <textarea
                                name="longDescription"
                                value={formData.longDescription}
                                onChange={handleChange}
                                rows={4}
                                className="w-full border rounded-lg px-3 py-2"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, inStock: !prev.inStock }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                    formData.inStock ? "bg-green-500" : "bg-gray-200"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        formData.inStock ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">In Stock</span>
                                <span className="text-xs text-gray-500">
                                    {formData.inStock ? "Available for purchase" : "Out of stock"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Images</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                        {formData.images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`relative group aspect-square rounded-lg border-2 overflow-hidden ${img.isMain ? "border-blue-500" : "border-gray-200"}`}
                            >
                                <Image
                                    src={img.url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                                {img.isMain && (
                                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                                        Main
                                    </span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    {!img.isMain && (
                                        <button
                                            type="button"
                                            onClick={() => setMainImage(idx)}
                                            className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-gray-100"
                                        >
                                            Set Main
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">Upload</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Variants */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Variants</h2>
                        <button type="button" onClick={addVariant} className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Variant
                        </button>
                    </div>
                    <div className="space-y-4">
                        {variants.map((variant, i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Diameter</label>
                                        <input
                                            type="text"
                                            value={variant.diameter}
                                            onChange={(e) => updateVariant(i, "diameter", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                            placeholder="1.75mm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Spool Weight</label>
                                        <input
                                            type="text"
                                            value={variant.spoolWeight}
                                            onChange={(e) => updateVariant(i, "spoolWeight", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                            placeholder="1kg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => updateVariant(i, "price", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            value={variant.originalPrice || ""}
                                            onChange={(e) => updateVariant(i, "originalPrice", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateVariant(i, "inStock", !variant.inStock)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                                    variant.inStock ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                        variant.inStock ? "translate-x-5" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                            <span className="text-sm font-medium">{variant.inStock ? "In Stock" : "Out of Stock"}</span>
                                        </div>
                                        <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features, Applications, Compatibility - Same as new page */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Features & Details</h2>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Features</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                className="flex-1 border rounded-lg px-3 py-2"
                            />
                            <button type="button" onClick={() => addToArray("features", newFeature)} className="px-4 py-2 bg-black text-white rounded-lg">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.features.map((f, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                                    {f}
                                    <button type="button" onClick={() => removeFromArray("features", i)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Applications</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newApplication}
                                onChange={(e) => setNewApplication(e.target.value)}
                                className="flex-1 border rounded-lg px-3 py-2"
                            />
                            <button type="button" onClick={() => addToArray("applications", newApplication)} className="px-4 py-2 bg-black text-white rounded-lg">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.applications.map((a, i) => (
                                <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                                    {a}
                                    <button type="button" onClick={() => removeFromArray("applications", i)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Printer Compatibility</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newCompatibility}
                                onChange={(e) => setNewCompatibility(e.target.value)}
                                className="flex-1 border rounded-lg px-3 py-2"
                            />
                            <button type="button" onClick={() => addToArray("compatibility", newCompatibility)} className="px-4 py-2 bg-black text-white rounded-lg">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.compatibility.map((c, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                                    {c}
                                    <button type="button" onClick={() => removeFromArray("compatibility", i)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Technical Specifications</h2>
                        <button type="button" onClick={addSpecification} className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Spec
                        </button>
                    </div>
                    <div className="space-y-3">
                        {specifications.map((spec, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                <div>
                                    <select
                                        value={spec.category}
                                        onChange={(e) => updateSpecification(i, "category", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                                    >
                                        {SPEC_CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => updateSpecification(i, "key", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Nozzle temperature"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => updateSpecification(i, "value", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Value (e.g., 200-220°C)"
                                    />
                                </div>
                                <button type="button" onClick={() => removeSpecification(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Downloads */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Downloads</h2>
                        <button type="button" onClick={addDownload} className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Download
                        </button>
                    </div>
                    <div className="space-y-3">
                        {downloads.map((download, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border rounded-lg p-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={download.title}
                                        onChange={(e) => updateDownload(i, "title", e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={download.description || ""}
                                        onChange={(e) => updateDownload(i, "description", e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">File URL</label>
                                    <input
                                        type="url"
                                        value={download.fileUrl}
                                        onChange={(e) => updateDownload(i, "fileUrl", e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => removeDownload(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                </div>
            </form>
        </div>
    );
}
