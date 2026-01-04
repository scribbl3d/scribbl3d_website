"use client";

import {
    ArrowLeft,
    Cpu,
    Download as DownloadIcon,
    FileText,
    Image as ImageIcon,
    Plus,
    Save,
    Settings,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ===================== CONSTANTS ===================== */

const TECH_OPTIONS = ["FDM / FFF", "SLA / DLP", "SLS"];
const EXP_OPTIONS = ["Beginner", "Intermediate", "Expert", "Industrial"];

const SPEC_CATEGORIES = [
    "Build Specifications",
    "Print Specifications",
    "Material Compatibility",
    "Connectivity & Software",
    "Physical Specifications",
];

// Defined to track what is mandatory inside the dynamic specs list
const MANDATORY_SPECS = ["Supported Materials", "Chamber Type"];

const DEFAULT_SPECS = [
    // Build Specifications

    {
        category: "Build Specifications", // MANDATORY
        label: "Chamber Type",
        value: "",
        sortOrder: 0,
    },
    // Print Specifications
    {
        category: "Print Specifications",
        label: "Extruder Type",
        value: "",
        sortOrder: 0,
    },
    {
        category: "Print Specifications",
        label: "Print Speed",
        value: "",
        sortOrder: 1,
    },
    // Material Compatibility
    {
        category: "Material Compatibility", // MANDATORY
        label: "Supported Materials",
        value: "",
        sortOrder: 0,
    },
    // Connectivity
    {
        category: "Connectivity & Software",
        label: "Connectivity",
        value: "",
        sortOrder: 0,
    },
    // Physical
    {
        category: "Physical Specifications",
        label: "Machine Dimensions",
        value: "",
        sortOrder: 0,
    },
];

/* ===================== TYPES ===================== */

type ImageItem = {
    id?: string;
    url: string;
    file?: File;
    altText?: string;
    sortOrder: number;
    isMain: boolean;
};

type Specification = {
    id?: string;
    category: string;
    label: string;
    value: string;
    sortOrder: number;
};

type Feature = { id?: string; title: string; sortOrder: number };
type Application = { id?: string; name: string; sortOrder: number };

type Download = {
    id?: string;
    title: string;
    description: string;
    downloadUrl: string;
    sortOrder: number;
};

type PrinterFormData = {
    name: string;
    slug: string;
    brand: string;
    price: string;
    originalPrice: string;
    technology: string;
    experience: string;
    volumeLength: string;
    volumeWidth: string;
    volumeHeight: string;
    description: string;
    shortDescription: string;
    warrantyYears: string;
    freeInstallation: boolean;
    images: ImageItem[];
    specifications: Specification[];
    features: Feature[];
    applications: Application[];
    downloads: Download[];
};

/* ===================== COMPONENT ===================== */

export default function PrinterFormPage() {
    const router = useRouter();
    const params = useParams();

    const printerId = params?.id as string | undefined;
    const isEdit = !!printerId && printerId !== "new";

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Initial State
    const [formData, setFormData] = useState<PrinterFormData>({
        name: "",
        slug: "",
        brand: "",
        price: "",
        originalPrice: "",
        technology: "",
        experience: "",
        volumeLength: "",
        volumeWidth: "",
        volumeHeight: "",
        description: "",
        shortDescription: "",
        warrantyYears: "1",
        freeInstallation: true,
        images: [],
        specifications: isEdit ? [] : DEFAULT_SPECS,
        features: [],
        applications: [],
        downloads: [],
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // FETCH DATA
    useEffect(() => {
        if (isEdit) {
            setFetching(true);
            fetch(`/api/admin/printers/${printerId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch printer");
                    return res.json();
                })
                .then((data) => {
                    setFormData({
                        ...data,
                        slug: data.slug || "",
                        price: data.price ? (data.price / 100).toString() : "",
                        originalPrice: data.originalPrice
                            ? (data.originalPrice / 100).toString()
                            : "",
                        images: data.images || [],
                        specifications: data.specifications || [],
                        features: data.features || [],
                        applications: data.applications || [],
                        downloads: data.downloads || [],
                    });
                })
                .catch((err) => {
                    console.error("Error fetching printer:", err);
                    alert("Could not load printer data.");
                })
                .finally(() => setFetching(false));
        }
    }, [printerId, isEdit]);

    /* ===================== HANDLERS ===================== */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- Custom Validation for Mandatory Specs ---
        const missingSpecs = MANDATORY_SPECS.filter((mandatoryLabel) => {
            const spec = formData.specifications.find(
                (s) => s.label.toLowerCase() === mandatoryLabel.toLowerCase()
            );
            return !spec || !spec.value.trim();
        });

        if (missingSpecs.length > 0) {
            alert(
                `The following specifications are mandatory:\n- ${missingSpecs.join(
                    "\n- "
                )}`
            );
            return;
        }

        setLoading(true);

        try {
            const priceInPaise = Math.round(parseFloat(formData.price) * 100);
            const originalPriceInPaise = formData.originalPrice
                ? Math.round(parseFloat(formData.originalPrice) * 100)
                : null;

            let discount = 0;
            if (originalPriceInPaise && originalPriceInPaise > priceInPaise) {
                discount = Math.round(
                    ((originalPriceInPaise - priceInPaise) /
                        originalPriceInPaise) *
                        100
                );
            }

            const volMax = Math.max(
                Number(formData.volumeLength) || 0,
                Number(formData.volumeWidth) || 0,
                Number(formData.volumeHeight) || 0
            );

            const data = new FormData();
            const finalSlug =
                formData.slug || generateSlug(formData.name) || "printer";

            data.append("name", formData.name);
            data.append("slug", finalSlug);
            data.append("brand", formData.brand);
            data.append("price", priceInPaise.toString());
            if (originalPriceInPaise)
                data.append("originalPrice", originalPriceInPaise.toString());
            data.append("discount", discount.toString());
            data.append("technology", formData.technology);
            data.append("experience", formData.experience);
            data.append("description", formData.description);
            data.append("shortDescription", formData.shortDescription);
            data.append("volumeLength", formData.volumeLength);
            data.append("volumeWidth", formData.volumeWidth);
            data.append("volumeHeight", formData.volumeHeight);
            data.append("volumeMax", volMax.toString());
            data.append("warrantyYears", formData.warrantyYears);
            data.append("freeInstallation", String(formData.freeInstallation));

            data.append(
                "specifications",
                JSON.stringify(formData.specifications)
            );
            data.append("features", JSON.stringify(formData.features));
            data.append("applications", JSON.stringify(formData.applications));
            data.append("downloads", JSON.stringify(formData.downloads));

            // Existing Images
            const existingImages = formData.images
                .filter((img) => !img.file)
                .map((img) => ({
                    url: img.url,
                    isMain: img.isMain,
                    sortOrder: img.sortOrder,
                }));
            data.append("existingImages", JSON.stringify(existingImages));

            // New Images
            formData.images.forEach((img) => {
                if (img.file) {
                    data.append("newImages", img.file);
                    const meta = {
                        isMain: img.isMain,
                        sortOrder: img.sortOrder,
                    };
                    data.append("newImagesMeta", JSON.stringify(meta));
                }
            });

            const url = isEdit
                ? `/api/admin/printers/${printerId}`
                : `/api/admin/printers`;
            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                body: data, // Browser sets Content-Type: multipart/form-data
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to save");
            }

            router.push("/admin/printers");
        } catch (error: any) {
            console.error("Error saving printer:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages: ImageItem[] = files.map((file, index) => ({
            url: URL.createObjectURL(file),
            file: file,
            sortOrder: formData.images.length + index,
            isMain: formData.images.length === 0 && index === 0,
        }));
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newImages],
        }));
    };

    const updateArrayItem = (
        field: keyof PrinterFormData,
        index: number,
        key: string,
        value: any
    ) => {
        setFormData((prev) => {
            const arr = [...(prev[field] as any[])];
            arr[index] = { ...arr[index], [key]: value };
            return { ...prev, [field]: arr };
        });
    };

    const removeArrayItem = (field: keyof PrinterFormData, index: number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index),
        }));
    };

    const addItem = (field: keyof PrinterFormData, initialItem: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: [
                ...(prev[field] as any[]),
                { ...initialItem, sortOrder: (prev[field] as any[]).length },
            ],
        }));
    };

    const renderSectionHeader = (title: string, icon?: any) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            {icon && <span className="text-gray-500">{icon}</span>}
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
    );

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">
                        Loading printer details...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {isEdit
                                            ? "Edit Printer"
                                            : "Add New Printer"}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {isEdit
                                            ? `Editing: ${formData.name}`
                                            : "Create a new product listing"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? "Saving..." : "Save Product"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 1. Basic Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Basic Details",
                                    <FileText className="w-5 h-5" />
                                )}
                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="e.g. Creality K1 Max"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Brand *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.brand}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        brand: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Experience Level *
                                            </label>
                                            <select
                                                required
                                                value={formData.experience}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        experience:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                            >
                                                <option value="">
                                                    Select Level
                                                </option>
                                                {EXP_OPTIONS.map((opt) => (
                                                    <option
                                                        key={opt}
                                                        value={opt}
                                                    >
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Technology *
                                        </label>
                                        <select
                                            required
                                            value={formData.technology}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    technology: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                        >
                                            <option value="">
                                                Select Technology
                                            </option>
                                            {TECH_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Technical Specs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Detailed Specifications",
                                    <Cpu className="w-5 h-5" />
                                )}

                                {SPEC_CATEGORIES.map((cat) => (
                                    <div
                                        key={cat}
                                        className="mb-6 last:mb-0 bg-gray-50 p-4 rounded-lg"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                                                {cat}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addItem("specifications", {
                                                        category: cat,
                                                        label: "",
                                                        value: "",
                                                    })
                                                }
                                                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                <Plus className="w-3 h-3" /> Add
                                                Row
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.specifications
                                                .map((spec, originalIndex) => ({
                                                    spec,
                                                    originalIndex,
                                                }))
                                                .filter(
                                                    ({ spec }) =>
                                                        spec.category === cat
                                                )
                                                .map(
                                                    ({
                                                        spec,
                                                        originalIndex,
                                                    }) => {
                                                        const isMandatory =
                                                            MANDATORY_SPECS.includes(
                                                                spec.label
                                                            );
                                                        return (
                                                            <div
                                                                key={
                                                                    originalIndex
                                                                }
                                                                className="flex gap-2"
                                                            >
                                                                <input
                                                                    type="text"
                                                                    placeholder="Label"
                                                                    value={
                                                                        spec.label
                                                                    }
                                                                    readOnly={
                                                                        isMandatory
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        !isMandatory &&
                                                                        updateArrayItem(
                                                                            "specifications",
                                                                            originalIndex,
                                                                            "label",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md font-medium text-gray-700 ${isMandatory ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                                />
                                                                <div className="flex-1 relative">
                                                                    <input
                                                                        type="text"
                                                                        placeholder={
                                                                            isMandatory
                                                                                ? "Mandatory Value *"
                                                                                : "Value"
                                                                        }
                                                                        value={
                                                                            spec.value
                                                                        }
                                                                        required={
                                                                            isMandatory
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateArrayItem(
                                                                                "specifications",
                                                                                originalIndex,
                                                                                "value",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className={`w-full px-3 py-2 text-sm border rounded-md ${isMandatory && !spec.value ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
                                                                    />
                                                                </div>
                                                                {!isMandatory && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeArrayItem(
                                                                                "specifications",
                                                                                originalIndex
                                                                            )
                                                                        }
                                                                        className="p-2 text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 3. Features & Applications */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader("Features & Applications")}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-medium text-gray-700">
                                                Key Features
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addItem("features", {
                                                        title: "",
                                                    })
                                                }
                                                className="text-xs text-blue-600 font-medium hover:underline"
                                            >
                                                + Add Feature
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.features.map(
                                                (item, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex gap-2"
                                                    >
                                                        <input
                                                            value={item.title}
                                                            onChange={(e) =>
                                                                updateArrayItem(
                                                                    "features",
                                                                    i,
                                                                    "title",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                            placeholder="Feature Title"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeArrayItem(
                                                                    "features",
                                                                    i
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-medium text-gray-700">
                                                Ideal Applications
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addItem("applications", {
                                                        name: "",
                                                    })
                                                }
                                                className="text-xs text-blue-600 font-medium hover:underline"
                                            >
                                                + Add App
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {formData.applications.map(
                                                (item, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex gap-2"
                                                    >
                                                        <input
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                updateArrayItem(
                                                                    "applications",
                                                                    i,
                                                                    "name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                            placeholder="App Name"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeArrayItem(
                                                                    "applications",
                                                                    i
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Downloads */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <DownloadIcon className="w-5 h-5 text-gray-500" />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Downloads
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            addItem("downloads", {
                                                title: "",
                                                description: "",
                                                downloadUrl: "",
                                            })
                                        }
                                        className="text-sm bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                        Download
                                    </button>
                                </div>

                                {formData.downloads.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-sm text-gray-500">
                                            No downloads added yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.downloads.map((doc, i) => (
                                            <div
                                                key={i}
                                                className="relative p-4 border border-gray-200 rounded-lg bg-gray-50/50"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                                        Download {i + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeArrayItem(
                                                                "downloads",
                                                                i
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-600"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    <input
                                                        placeholder="Title (e.g. Product Datasheet)"
                                                        value={doc.title}
                                                        onChange={(e) =>
                                                            updateArrayItem(
                                                                "downloads",
                                                                i,
                                                                "title",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                                                    />
                                                    <input
                                                        placeholder="Description (optional)"
                                                        value={
                                                            doc.description ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateArrayItem(
                                                                "downloads",
                                                                i,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                                                    />
                                                    <input
                                                        placeholder="PDF URL (https://...)"
                                                        value={
                                                            doc.downloadUrl ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateArrayItem(
                                                                "downloads",
                                                                i,
                                                                "downloadUrl",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white font-mono text-gray-600"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {/* 1. Pricing */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader("Pricing")}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sale Price (₹) *
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                required
                                                value={formData.price}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        price: e.target.value,
                                                    })
                                                }
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Original MRP (₹)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                value={formData.originalPrice}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        originalPrice:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-gray-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Build Volume */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Build Volume (mm) *",
                                    <Settings className="w-4 h-4" />
                                )}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <label className="block text-xs text-gray-500 mb-1">
                                            L
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.volumeLength}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    volumeLength:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-1 py-2 border border-gray-300 rounded text-center"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-xs text-gray-500 mb-1">
                                            W
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.volumeWidth}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    volumeWidth: e.target.value,
                                                })
                                            }
                                            className="w-full px-1 py-2 border border-gray-300 rounded text-center"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <label className="block text-xs text-gray-500 mb-1">
                                            H
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.volumeHeight}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    volumeHeight:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-1 py-2 border border-gray-300 rounded text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Images */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Images",
                                    <ImageIcon className="w-4 h-4" />
                                )}

                                <div className="grid grid-cols-2 gap-3 mb-4">
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
                                                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded">
                                                    Main
                                                </span>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                {!img.isMain && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImages =
                                                                formData.images.map(
                                                                    (
                                                                        im,
                                                                        i
                                                                    ) => ({
                                                                        ...im,
                                                                        isMain:
                                                                            i ===
                                                                            idx,
                                                                    })
                                                                );
                                                            setFormData({
                                                                ...formData,
                                                                images: newImages,
                                                            });
                                                        }}
                                                        className="text-xs bg-white text-black px-2 py-1 rounded hover:bg-gray-100"
                                                    >
                                                        Set Main
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeArrayItem(
                                                            "images",
                                                            idx
                                                        )
                                                    }
                                                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">
                                            Upload
                                        </span>
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

                            {/* 4. Descriptions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader("Descriptions")}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Short Description
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.shortDescription}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    shortDescription:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Description
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
