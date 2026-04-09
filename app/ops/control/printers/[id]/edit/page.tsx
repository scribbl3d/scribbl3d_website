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

const MATERIAL_OPTIONS = [
    "PLA",
    "PETG",
    "ABS",
    "ASA",
    "TPU (Flexible)",
    "Nylon (PA)",
    "Polycarbonate (PC)",
    "Standard Resin",
    "ABS-Like Resin",
    "Tough Resin",
    "Flexible Resin",
    "Water-Washable Resin",
    "High-Temperature Resin",
    "Dental Resin",
    "Castable Resin",
    "Nylon PA12",
    "Nylon PA11",
    "TPU Powder",
    "Reinforced Fiber",
];

const CONNECTIVITY_OPTIONS = [
    "USB",
    "SD Card",
    "Wi-Fi",
    "Ethernet (LAN)",
    "Cloud Connectivity",
];

const CHAMBER_OPTIONS = [
    "Open Frame",
    "Semi-Enclosed",
    "Fully Enclosed",
    "Heated Enclosed Chamber",
    "Heated Powder Bed",
    "Closed Resin Chamber",
];

const SPEC_CATEGORIES = [
    "Build Specifications",
    "Print Specifications",
    "Material Compatibility",
    "Connectivity & Software",
    "Physical Specifications",
];

const MANDATORY_SPECS = ["Supported Materials", "Chamber Type"];

const DEFAULT_SPECS = [
    {
        category: "Build Specifications",
        label: "Chamber Type",
        value: "",
        sortOrder: 0,
    },
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
    {
        category: "Print Specifications",
        label: "Acceleration",
        value: "",
        sortOrder: 2,
    },
    {
        category: "Material Compatibility",
        label: "Supported Materials",
        value: "",
        sortOrder: 0,
    },
    {
        category: "Connectivity & Software",
        label: "Connectivity",
        value: "",
        sortOrder: 0,
    },
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
    weight: string;
    freeInstallation: boolean;
    inStock: boolean;
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
        warrantyYears: "",
        weight: "",
        freeInstallation: true,
        inStock: true,
        images: [],
        specifications: isEdit ? [] : DEFAULT_SPECS,
        features: [],
        applications: [],
        downloads: [],
    });

    const generateSlug = (name: string) =>
        name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

    useEffect(() => {
        if (isEdit) {
            setFetching(true);
            fetch(`/api/admin/printers/${printerId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch");
                    return res.json();
                })
                .then((data) => {
                    setFormData({
                        ...data,
                        slug: data.slug || "",
                        price: data.price ? data.price.toString() : "",
                        originalPrice: data.originalPrice
                            ? data.originalPrice.toString()
                            : "",
                        weight: data.weight
                            ? (data.weight / 1000).toString()
                            : "",
                        inStock: data.inStock ?? true,
                        images: data.images || [],
                        specifications: data.specifications || [],
                        features: data.features || [],
                        applications: data.applications || [],
                        downloads: data.downloads || [],
                    });
                })
                .catch((err) => {
                    console.error(err);
                    alert("Load error");
                })
                .finally(() => setFetching(false));
        }
    }, [printerId, isEdit]);

    /* ===================== HANDLERS ===================== */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const missingSpecs = MANDATORY_SPECS.filter((mandatoryLabel) => {
            const spec = formData.specifications.find(
                (s) => s.label.toLowerCase() === mandatoryLabel.toLowerCase(),
            );
            return !spec || !spec.value.trim();
        });

        if (missingSpecs.length > 0) {
            alert(
                `Missing mandatory specifications:\n- ${missingSpecs.join("\n- ")}`,
            );
            return;
        }

        if (!formData.shortDescription.trim() || !formData.description.trim()) {
            alert("Both Short Description and Full Description are required.");
            return;
        }

        setLoading(true);

        try {
            const price = Math.round(parseFloat(formData.price));
            const originalPrice = formData.originalPrice
                ? Math.round(parseFloat(formData.originalPrice))
                : null;

            const weightInGrams = formData.weight
                ? Math.round(parseFloat(formData.weight) * 1000)
                : 0;

            let discount = 0;
            if (originalPrice && originalPrice > price) {
                discount = Math.round(
                    ((originalPrice - price) / originalPrice) * 100,
                );
            }

            const volMax = Math.max(
                Number(formData.volumeLength) || 0,
                Number(formData.volumeWidth) || 0,
                Number(formData.volumeHeight) || 0,
            );

            const trimmed = (val: any) => String(val ?? "").trim();
            const finalSlug =
                trimmed(formData.slug) ||
                generateSlug(formData.name) ||
                "printer";

            const trimmedSpecs = formData.specifications
                .map((s) => ({
                    ...s,
                    label: s.label.trim(),
                    value: s.value.trim(),
                }))
                .filter((s) => s.label !== "" && s.value !== "");

            const trimmedFeatures = formData.features
                .map((f) => ({ ...f, title: f.title.trim() }))
                .filter((f) => f.title !== "");

            const trimmedApplications = formData.applications
                .map((a) => ({ ...a, name: a.name.trim() }))
                .filter((a) => a.name !== "");

            const trimmedDownloads = formData.downloads.map((d) => ({
                ...d,
                title: d.title.trim(),
                description: d.description.trim(),
                downloadUrl: d.downloadUrl.trim(),
            }));

            const data = new FormData();
            data.append("name", trimmed(formData.name));
            data.append("slug", finalSlug);
            data.append("brand", trimmed(formData.brand));
            data.append("price", price.toString());
            if (originalPrice)
                data.append("originalPrice", originalPrice.toString());
            data.append("discount", discount.toString());
            data.append("technology", trimmed(formData.technology));
            data.append("experience", trimmed(formData.experience));
            data.append("description", trimmed(formData.description));
            data.append("shortDescription", trimmed(formData.shortDescription));
            data.append("volumeLength", trimmed(formData.volumeLength));
            data.append("volumeWidth", trimmed(formData.volumeWidth));
            data.append("volumeHeight", trimmed(formData.volumeHeight));
            data.append("volumeMax", volMax.toString());
            data.append("warrantyYears", trimmed(formData.warrantyYears));
            data.append("weight", weightInGrams.toString());
            data.append("freeInstallation", String(formData.freeInstallation));
            data.append("inStock", String(formData.inStock));

            data.append("specifications", JSON.stringify(trimmedSpecs));
            data.append("features", JSON.stringify(trimmedFeatures));
            data.append("applications", JSON.stringify(trimmedApplications));
            data.append("downloads", JSON.stringify(trimmedDownloads));

            const existingImages = formData.images
                .filter((img) => !img.file)
                .map((img) => ({
                    url: img.url,
                    isMain: img.isMain,
                    sortOrder: img.sortOrder,
                }));
            data.append("existingImages", JSON.stringify(existingImages));

            formData.images.forEach((img) => {
                if (img.file) {
                    data.append("newImages", img.file);
                    data.append(
                        "newImagesMeta",
                        JSON.stringify({
                            isMain: img.isMain,
                            sortOrder: img.sortOrder,
                        }),
                    );
                }
            });

            const url = isEdit
                ? `/api/admin/printers/${printerId}`
                : `/api/admin/printers`;
            const method = isEdit ? "PUT" : "POST";
            const response = await fetch(url, { method, body: data });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to save");
            }
            router.push("/ops/control/printers");
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== HELPERS ===================== */

    const handleMultiSelectSpec = (index: number, option: string) => {
        const spec = formData.specifications[index];
        if (
            spec.label !== "Supported Materials" &&
            spec.label !== "Connectivity"
        )
            return;
        let values = spec.value ? spec.value.split(", ") : [];
        if (values.includes(option)) {
            values = values.filter((v) => v !== option);
        } else {
            values.push(option);
        }
        updateArrayItem("specifications", index, "value", values.join(", "));
    };

    const handleMachineDimensions = (
        index: number,
        axis: "L" | "W" | "H",
        val: string,
    ) => {
        const spec = formData.specifications[index];
        const parts = spec.value
            .split(" x ")
            .map((p) => p.replace("mm", "").trim());
        const L = axis === "L" ? val : parts[0] || "";
        const W = axis === "W" ? val : parts[1] || "";
        const H = axis === "H" ? val : parts[2] || "";
        updateArrayItem(
            "specifications",
            index,
            "value",
            `${L}mm x ${W}mm x ${H}mm`,
        );
    };

    const handleUnitInput = (index: number, val: string, unit: string) => {
        updateArrayItem(
            "specifications",
            index,
            "value",
            val ? `${val} ${unit}` : "",
        );
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

    const updateArrayItem = (
        field: keyof PrinterFormData,
        index: number,
        key: string,
        value: any,
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

    if (fetching)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                Loading...
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <form onSubmit={handleSubmit}>
                <LoadingModal open={loading} isEdit={isEdit} />

                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 1. Basic Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Basic Details",
                                    <FileText className="w-5 h-5" />,
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Warranty (Years)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={formData.warrantyYears}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        warrantyYears:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="e.g. 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Weight (Kg)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={formData.weight}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        weight: e.target.value,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="e.g. 15.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-col gap-4 pt-2 border-t border-gray-100">
                                        {/* Free Installation toggle */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        freeInstallation:
                                                            !prev.freeInstallation,
                                                    }))
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                    formData.freeInstallation
                                                        ? "bg-gray-900"
                                                        : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        formData.freeInstallation
                                                            ? "translate-x-6"
                                                            : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Free Installation
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Include free installation
                                                    support with this printer
                                                </span>
                                            </div>
                                        </div>

                                        {/* In Stock toggle */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        inStock: !prev.inStock,
                                                    }))
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                    formData.inStock
                                                        ? "bg-green-500"
                                                        : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        formData.inStock
                                                            ? "translate-x-6"
                                                            : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">
                                                    In Stock
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Mark this printer as
                                                    available for purchase
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Technical Specs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Detailed Specifications",
                                    <Cpu className="w-5 h-5" />,
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

                                        <div className="space-y-4">
                                            {formData.specifications
                                                .map((spec, originalIndex) => ({
                                                    spec,
                                                    originalIndex,
                                                }))
                                                .filter(
                                                    ({ spec }) =>
                                                        spec.category === cat,
                                                )
                                                .map(
                                                    ({
                                                        spec,
                                                        originalIndex,
                                                    }) => {
                                                        const isStrictMandatory =
                                                            MANDATORY_SPECS.includes(
                                                                spec.label,
                                                            );

                                                        if (
                                                            spec.label ===
                                                            "Chamber Type"
                                                        ) {
                                                            return (
                                                                <div
                                                                    key={
                                                                        originalIndex
                                                                    }
                                                                    className="space-y-1"
                                                                >
                                                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                                                        Chamber
                                                                        Type *
                                                                    </label>
                                                                    <select
                                                                        value={
                                                                            spec.value
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateArrayItem(
                                                                                "specifications",
                                                                                originalIndex,
                                                                                "value",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                                    >
                                                                        <option value="">
                                                                            Select
                                                                            Chamber
                                                                            Type
                                                                        </option>
                                                                        {CHAMBER_OPTIONS.map(
                                                                            (
                                                                                opt,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        opt
                                                                                    }
                                                                                    value={
                                                                                        opt
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        opt
                                                                                    }
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </select>
                                                                </div>
                                                            );
                                                        }

                                                        if (
                                                            spec.label ===
                                                            "Supported Materials"
                                                        ) {
                                                            const currentVals =
                                                                spec.value
                                                                    ? spec.value.split(
                                                                          ", ",
                                                                      )
                                                                    : [];
                                                            return (
                                                                <div
                                                                    key={
                                                                        originalIndex
                                                                    }
                                                                    className="space-y-2"
                                                                >
                                                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                                                        Supported
                                                                        Materials
                                                                        *
                                                                    </label>
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 border rounded-md max-h-48 overflow-y-auto">
                                                                        {MATERIAL_OPTIONS.map(
                                                                            (
                                                                                opt,
                                                                            ) => (
                                                                                <label
                                                                                    key={
                                                                                        opt
                                                                                    }
                                                                                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={currentVals.includes(
                                                                                            opt,
                                                                                        )}
                                                                                        onChange={() =>
                                                                                            handleMultiSelectSpec(
                                                                                                originalIndex,
                                                                                                opt,
                                                                                            )
                                                                                        }
                                                                                        className="rounded border-gray-300 text-black focus:ring-black"
                                                                                    />
                                                                                    <span>
                                                                                        {
                                                                                            opt
                                                                                        }
                                                                                    </span>
                                                                                </label>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-400">
                                                                        Selected:{" "}
                                                                        {spec.value ||
                                                                            "None"}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }

                                                        if (
                                                            spec.label ===
                                                            "Connectivity"
                                                        ) {
                                                            const currentVals =
                                                                spec.value
                                                                    ? spec.value.split(
                                                                          ", ",
                                                                      )
                                                                    : [];
                                                            return (
                                                                <div
                                                                    key={
                                                                        originalIndex
                                                                    }
                                                                    className="space-y-2"
                                                                >
                                                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                                                        Connectivity
                                                                    </label>
                                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white p-3 border rounded-md max-h-48 overflow-y-auto">
                                                                        {CONNECTIVITY_OPTIONS.map(
                                                                            (
                                                                                opt,
                                                                            ) => (
                                                                                <label
                                                                                    key={
                                                                                        opt
                                                                                    }
                                                                                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={currentVals.includes(
                                                                                            opt,
                                                                                        )}
                                                                                        onChange={() =>
                                                                                            handleMultiSelectSpec(
                                                                                                originalIndex,
                                                                                                opt,
                                                                                            )
                                                                                        }
                                                                                        className="rounded border-gray-300 text-black focus:ring-black"
                                                                                    />
                                                                                    <span>
                                                                                        {
                                                                                            opt
                                                                                        }
                                                                                    </span>
                                                                                </label>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-400">
                                                                        Selected:{" "}
                                                                        {spec.value ||
                                                                            "None"}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }

                                                        if (
                                                            spec.label ===
                                                            "Machine Dimensions"
                                                        ) {
                                                            const parts =
                                                                spec.value
                                                                    .split(
                                                                        " x ",
                                                                    )
                                                                    .map((p) =>
                                                                        p
                                                                            .replace(
                                                                                "mm",
                                                                                "",
                                                                            )
                                                                            .trim(),
                                                                    );
                                                            return (
                                                                <div
                                                                    key={
                                                                        originalIndex
                                                                    }
                                                                    className="space-y-1"
                                                                >
                                                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                                                        Machine
                                                                        Dimensions
                                                                        (mm)
                                                                    </label>
                                                                    <div className="flex gap-2 items-center">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="L"
                                                                            value={
                                                                                parts[0] ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleMachineDimensions(
                                                                                    originalIndex,
                                                                                    "L",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-center"
                                                                        />
                                                                        <span className="text-gray-400">
                                                                            x
                                                                        </span>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="W"
                                                                            value={
                                                                                parts[1] ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleMachineDimensions(
                                                                                    originalIndex,
                                                                                    "W",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-center"
                                                                        />
                                                                        <span className="text-gray-400">
                                                                            x
                                                                        </span>
                                                                        <input
                                                                            type="number"
                                                                            placeholder="H"
                                                                            value={
                                                                                parts[2] ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleMachineDimensions(
                                                                                    originalIndex,
                                                                                    "H",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-center"
                                                                        />
                                                                        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-2 rounded">
                                                                            mm
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        if (
                                                            spec.label ===
                                                                "Print Speed" ||
                                                            spec.label ===
                                                                "Acceleration"
                                                        ) {
                                                            const unit =
                                                                spec.label ===
                                                                "Print Speed"
                                                                    ? "mm/s"
                                                                    : "mm/s²";
                                                            const numericValue =
                                                                spec.value.replace(
                                                                    ` ${unit}`,
                                                                    "",
                                                                );
                                                            return (
                                                                <div
                                                                    key={
                                                                        originalIndex
                                                                    }
                                                                    className="flex gap-2 items-center"
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            spec.label
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updateArrayItem(
                                                                                "specifications",
                                                                                originalIndex,
                                                                                "label",
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md font-medium text-gray-700"
                                                                    />
                                                                    <div className="flex-1 relative flex items-center">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Value"
                                                                            value={
                                                                                numericValue
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handleUnitInput(
                                                                                    originalIndex,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    unit,
                                                                                )
                                                                            }
                                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                                        />
                                                                        <span className="absolute right-3 text-xs text-gray-500">
                                                                            {
                                                                                unit
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeArrayItem(
                                                                                "specifications",
                                                                                originalIndex,
                                                                            )
                                                                        }
                                                                        className="p-2 text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div
                                                                key={
                                                                    originalIndex
                                                                }
                                                                className="flex gap-2 items-center"
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        spec.label
                                                                    }
                                                                    readOnly={
                                                                        isStrictMandatory
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        !isStrictMandatory &&
                                                                        updateArrayItem(
                                                                            "specifications",
                                                                            originalIndex,
                                                                            "label",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Spec Name"
                                                                    className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md font-medium text-gray-700 ${isStrictMandatory ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Value"
                                                                    value={
                                                                        spec.value
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateArrayItem(
                                                                            "specifications",
                                                                            originalIndex,
                                                                            "value",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                                />
                                                                {!isStrictMandatory && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeArrayItem(
                                                                                "specifications",
                                                                                originalIndex,
                                                                            )
                                                                        }
                                                                        className="p-2 text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Features & Applications */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                                                                        .value,
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
                                                                    i,
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ),
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
                                                                        .value,
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
                                                                    i,
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Downloads */}
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
                                                                i,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-600"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    <input
                                                        placeholder="Title"
                                                        value={doc.title}
                                                        onChange={(e) =>
                                                            updateArrayItem(
                                                                "downloads",
                                                                i,
                                                                "title",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                                                    />
                                                    <input
                                                        placeholder="Description"
                                                        value={
                                                            doc.description ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateArrayItem(
                                                                "downloads",
                                                                i,
                                                                "description",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                                                    />
                                                    <input
                                                        placeholder="PDF URL"
                                                        value={
                                                            doc.downloadUrl ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateArrayItem(
                                                                "downloads",
                                                                i,
                                                                "downloadUrl",
                                                                e.target.value,
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
                            {/* Pricing */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader("Pricing")}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sale Price (₹) *
                                        </label>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Original MRP (₹)
                                        </label>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Build Volume */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Build Volume (mm) *",
                                    <Settings className="w-4 h-4" />,
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
                                <div className="mt-2 text-center text-xs text-gray-400">
                                    Total Volume:{" "}
                                    {Number(formData.volumeLength) *
                                        Number(formData.volumeWidth) *
                                        Number(formData.volumeHeight) || 0}{" "}
                                    mm³
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader(
                                    "Images",
                                    <ImageIcon className="w-4 h-4" />,
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
                                                            const newImages = [
                                                                ...formData.images,
                                                            ];
                                                            const [selected] =
                                                                newImages.splice(
                                                                    idx,
                                                                    1,
                                                                );
                                                            newImages.unshift({
                                                                ...selected,
                                                                isMain: true,
                                                            });
                                                            const normalizedImages =
                                                                newImages.map(
                                                                    (
                                                                        img,
                                                                        i,
                                                                    ) => ({
                                                                        ...img,
                                                                        isMain:
                                                                            i ===
                                                                            0,
                                                                        sortOrder:
                                                                            i,
                                                                    }),
                                                                );
                                                            setFormData({
                                                                ...formData,
                                                                images: normalizedImages,
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
                                                            idx,
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

                            {/* Descriptions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                {renderSectionHeader("Descriptions")}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Short Description *
                                        </label>
                                        <textarea
                                            required
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
                                            maxLength={92}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formData.shortDescription.length}/92 characters
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Description *
                                        </label>
                                        <textarea
                                            required
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

function LoadingModal({ open, isEdit }: { open: boolean; isEdit: boolean }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg px-8 py-6 w-[360px] text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">
                    {isEdit ? "Editing Product…" : "Adding Product…"}
                </h2>
                <p className="text-sm text-gray-600">
                    This may take up to a few minutes. Please do not close this
                    window.
                </p>
            </div>
        </div>
    );
}
