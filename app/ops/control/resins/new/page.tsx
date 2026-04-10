"use client";

import {
    ArrowLeft,
    ImageIcon,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ===================== CONSTANTS ===================== */

const TECHNOLOGY_OPTIONS = ["LCD / MSLA", "SLA", "DLP"];
const RESOLUTION_OPTIONS = ["2K", "4K", "6K", "8K", "12K", "16K"];

const MATERIAL_OPTIONS = [
    "Standard Resin",
    "Standard Plus Resin",
    "ABS-Like Resin",
    "Tough Resin",
    "Rigid Resin",
    "Flexible Resin",
    "Elastic Resin",
    "Water Washable Resin",
    "Plant-Based Resin",
    "Castable Resin",
    "Dental / Biocompatible Resin",
];

const MANDATORY_LABELS = {
    MATERIAL: "Material",
    WASHABLE: "Washable",
    SHORE: "Shore Hardness",
    TEMP: "Temperature",
    PRESSURE: "Pressure",
};

const SPEC_CATEGORIES = ["Print Parameters", "Packaging & Storage"];

/* ===================== TYPES ===================== */

type ImageItem = {
    id?: string;
    url: string;
    file?: File;
    sortOrder: number;
};

type ResinColourForm = {
    id?: string;
    name: string;
    hexCode?: string;
    inStock: boolean; // ← per-colour inStock
    images: ImageItem[];
};

type ResinWeightForm = {
    id?: string;
    weightInGrams: string;
    price: string;
    originalPrice?: string;
    inStock: boolean; // ← per-weight inStock
};

type ResinAttribute = {
    id?: string;
    label: string;
    value: string;
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
type Compatibility = { id?: string; name: string; sortOrder: number };

type Download = {
    id?: string;
    title: string;
    description?: string;
    downloadUrl?: string;
    sortOrder: number;
};

type ResinFormData = {
    name: string;
    slug: string;
    brand: string;
    technology: string;
    resolution: string[];
    shortDescription: string;
    description: string;
    cardImageUrl: string;
    cardImageFile?: File;
    inStock: boolean; // ← overall product inStock

    attributes: ResinAttribute[];
    colours: ResinColourForm[];
    weights: ResinWeightForm[];
    specifications: Specification[];
    features: Feature[];
    applications: Application[];
    compatibilities: Compatibility[];
    downloads: Download[];
};

const isValidHexColor = (value: string) =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

/* ===================== TOGGLE COMPONENT ===================== */

function Toggle({
    value,
    onChange,
    activeColor = "bg-green-500",
    label,
    description,
    small = false,
}: {
    value: boolean;
    onChange: (v: boolean) => void;
    activeColor?: string;
    label: string;
    description?: string;
    small?: boolean;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none ${
                    small ? "h-5 w-9" : "h-6 w-11"
                } ${value ? activeColor : "bg-gray-200"}`}
            >
                <span
                    className={`inline-block rounded-full bg-white transition-transform ${
                        small ? "h-3 w-3" : "h-4 w-4"
                    } ${value ? (small ? "translate-x-5" : "translate-x-6") : "translate-x-1"}`}
                />
            </button>
            <div className="flex flex-col">
                <span
                    className={`font-medium text-gray-700 ${small ? "text-xs" : "text-sm"}`}
                >
                    {label}
                </span>
                {description && (
                    <span className="text-[11px] text-gray-400">
                        {description}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ===================== COMPONENT ===================== */

export default function ResinFormPage() {
    const router = useRouter();
    const params = useParams();
    const resinId = params?.id as string | undefined;
    const isEdit = !!resinId && resinId !== "new";

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [colourErrors, setColourErrors] = useState<Record<number, string>>(
        {},
    );

    const [formData, setFormData] = useState<ResinFormData>({
        name: "",
        slug: "",
        brand: "",
        technology: "",
        resolution: [],
        shortDescription: "",
        description: "",
        cardImageUrl: "",
        inStock: true,
        attributes: [],
        colours: [],
        weights: [],
        specifications: [],
        features: [],
        applications: [],
        compatibilities: [],
        downloads: [],
    });

    /* ===================== FETCH ===================== */

    useEffect(() => {
        if (!isEdit) return;

        setFetching(true);
        fetch(`/api/admin/resins/${resinId}`)
            .then((res) => res.json())
            .then((data) => {
                setFormData({
                    ...data,
                    resolution: Array.isArray(data.resolution)
                        ? data.resolution
                        : [],
                    cardImageUrl: data.cardImageUrl || "",
                    inStock: data.inStock ?? true,
                    attributes: data.attributes || [],
                    colours: (data.colours || []).map((c: any) => ({
                        ...c,
                        inStock: c.inStock ?? true,
                    })),
                    weights: (data.weights || []).map((w: any) => ({
                        ...w,
                        inStock: w.inStock ?? true,
                    })),
                    specifications: data.specifications || [],
                    features: data.features || [],
                    applications: data.applications || [],
                    compatibilities: data.compatibilities || [],
                    downloads: data.downloads || [],
                });
            })
            .finally(() => setFetching(false));
    }, [isEdit, resinId]);

    /* ===================== HELPERS ===================== */

    const updateField = (key: keyof ResinFormData, value: any) =>
        setFormData((p) => ({ ...p, [key]: value }));

    const handleNameChange = (val: string) => {
        setFormData((prev) => {
            const shouldUpdateSlug =
                !isEdit ||
                prev.slug ===
                    prev.name
                        .toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]+/g, "");
            return {
                ...prev,
                name: val,
                slug: shouldUpdateSlug
                    ? val
                          .toLowerCase()
                          .replace(/ /g, "-")
                          .replace(/[^\w-]+/g, "")
                    : prev.slug,
            };
        });
    };

    const updateArrayItem = (
        key: keyof ResinFormData,
        index: number,
        field: string,
        value: any,
    ) =>
        setFormData((p) => {
            const arr = [...(p[key] as any[])];
            arr[index] = { ...arr[index], [field]: value };
            return { ...p, [key]: arr };
        });

    const addItem = (key: keyof ResinFormData, item: any) =>
        setFormData((p) => ({ ...p, [key]: [...(p[key] as any[]), item] }));

    const removeItem = (key: keyof ResinFormData, index: number) =>
        setFormData((p) => ({
            ...p,
            [key]: (p[key] as any[]).filter((_, i) => i !== index),
        }));

    const getAttrValue = (label: string) =>
        formData.attributes.find((a) => a.label === label)?.value || "";

    const setAttrValue = (label: string, value: string) => {
        setFormData((prev) => {
            const existingIndex = prev.attributes.findIndex(
                (a) => a.label === label,
            );
            let newAttrs = [...prev.attributes];
            if (existingIndex >= 0) {
                newAttrs[existingIndex] = { ...newAttrs[existingIndex], value };
            } else {
                newAttrs.push({ label, value });
            }
            return { ...prev, attributes: newAttrs };
        });
    };

    /* ===================== IMAGE HANDLING ===================== */

    const handleCardImageUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const url = URL.createObjectURL(file);
        setFormData((prev) => ({
            ...prev,
            cardImageUrl: url,
            cardImageFile: file,
        }));
    };

    const handleColourImageUpload = (
        colourIndex: number,
        files: FileList | null,
    ) => {
        if (!files) return;
        const currentImages = formData.colours[colourIndex].images;
        const newImages = Array.from(files).map((file, i) => ({
            url: URL.createObjectURL(file),
            file,
            sortOrder: currentImages.length + i,
        }));
        const updatedColours = [...formData.colours];
        updatedColours[colourIndex].images = [...currentImages, ...newImages];
        setFormData({ ...formData, colours: updatedColours });
    };

    const removeColourImage = (colourIndex: number, imageIndex: number) => {
        setFormData((prev) => {
            const colours = [...prev.colours];
            colours[colourIndex].images = colours[colourIndex].images.filter(
                (_, idx) => idx !== imageIndex,
            );
            return { ...prev, colours };
        });
    };

    /* ===================== SUBMIT ===================== */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.slug) {
                alert("Slug is required");
                setLoading(false);
                return;
            }

            const data = new FormData();

            data.append("name", formData.name);
            data.append("slug", formData.slug);
            data.append("brand", formData.brand);
            data.append("technology", formData.technology);
            data.append(
                "resolution",
                JSON.stringify(formData.resolution || []),
            );
            data.append("shortDescription", formData.shortDescription);
            data.append("description", formData.description);
            data.append("inStock", String(formData.inStock)); // ← overall inStock

            data.append("attributes", JSON.stringify(formData.attributes));
            data.append("weights", JSON.stringify(formData.weights)); // includes per-weight inStock
            data.append(
                "specifications",
                JSON.stringify(formData.specifications),
            );
            data.append("features", JSON.stringify(formData.features));
            data.append("applications", JSON.stringify(formData.applications));
            data.append(
                "compatibilities",
                JSON.stringify(formData.compatibilities),
            );
            data.append("downloads", JSON.stringify(formData.downloads));

            if (formData.cardImageFile) {
                data.append("cardImageFile", formData.cardImageFile);
            } else {
                data.append("cardImageUrl", formData.cardImageUrl || "");
            }

            const processedColours = formData.colours.map((colour, cIdx) => {
                const processedImages = colour.images.map((img, iIdx) => {
                    if (img.file) {
                        const key = `col_${cIdx}_img_${iIdx}`;
                        data.append(key, img.file);
                        return { ...img, uploadKey: key, file: undefined };
                    }
                    return img;
                });
                return { ...colour, images: processedImages }; // includes per-colour inStock
            });

            data.append("colours", JSON.stringify(processedColours));

            const url = isEdit
                ? `/api/admin/resins/${resinId}`
                : `/api/admin/resins`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, { method, body: data });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Save failed");
            }

            router.push("/ops/control/resins");
        } catch (err: any) {
            console.error(err);
            alert(`Failed to save: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10">Loading…</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <form onSubmit={handleSubmit}>
                <LoadingModal open={loading} isEdit={isEdit} />

                {/* HEADER */}
                <div className="sticky top-0 bg-white border-b z-20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => router.back()}>
                                <ArrowLeft />
                            </button>
                            <h1 className="text-xl font-bold">
                                {isEdit ? "Edit Resin" : "Add New Resin"}
                            </h1>
                        </div>
                        <button
                            disabled={loading}
                            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded hover:bg-gray-800 transition"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* BASIC */}
                    <Section title="Basic Details">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Name"
                                value={formData.name}
                                onChange={handleNameChange}
                            />
                            <Input
                                label="Slug"
                                value={formData.slug}
                                onChange={(v: string) => updateField("slug", v)}
                                className="bg-gray-50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Brand"
                                value={formData.brand}
                                onChange={(v: string) =>
                                    updateField("brand", v)
                                }
                            />
                            <Select
                                label="Technology"
                                value={formData.technology}
                                options={TECHNOLOGY_OPTIONS}
                                onChange={(v: string) =>
                                    updateField("technology", v)
                                }
                            />
                        </div>

                        <MultiSelect
                            label="Resolution"
                            options={RESOLUTION_OPTIONS}
                            value={formData.resolution}
                            onChange={(v: string[]) =>
                                updateField("resolution", v)
                            }
                        />

                        {/* Card Image */}
                        <div className="mt-4 border-t pt-4">
                            <label className="text-sm font-medium mb-2 block text-gray-700">
                                Card / Thumbnail Image
                            </label>
                            <div className="flex items-start gap-4">
                                {formData.cardImageUrl ? (
                                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden group">
                                        <Image
                                            src={formData.cardImageUrl}
                                            alt="Card"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    cardImageUrl: "",
                                                    cardImageFile: undefined,
                                                }))
                                            }
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-500">
                                            Upload
                                        </span>
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleCardImageUpload(
                                                    e.target.files,
                                                )
                                            }
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Overall inStock toggle */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Toggle
                                value={formData.inStock}
                                onChange={(v) => updateField("inStock", v)}
                                activeColor="bg-green-500"
                                label="In Stock (Overall)"
                                description="Master switch — turn off to mark entire product as out of stock across all colours and weights"
                            />
                        </div>
                    </Section>

                    {/* MANDATORY ATTRIBUTES */}
                    <Section title="Mandatory Properties">
                        <div className="space-y-2">
                            <label className="font-medium text-sm">
                                Material
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border p-4 rounded bg-gray-50">
                                {MATERIAL_OPTIONS.map((opt) => {
                                    const currentVal = getAttrValue(
                                        MANDATORY_LABELS.MATERIAL,
                                    );
                                    const selected = currentVal
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean);
                                    const isChecked = selected.includes(opt);
                                    return (
                                        <label
                                            key={opt}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const newSelected =
                                                        isChecked
                                                            ? selected.filter(
                                                                  (s) =>
                                                                      s !== opt,
                                                              )
                                                            : [
                                                                  ...selected,
                                                                  opt,
                                                              ];
                                                    setAttrValue(
                                                        MANDATORY_LABELS.MATERIAL,
                                                        newSelected.join(", "),
                                                    );
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">
                                                {opt}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Washable
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={
                                                getAttrValue(
                                                    MANDATORY_LABELS.WASHABLE,
                                                ) === "Yes"
                                            }
                                            onChange={() =>
                                                setAttrValue(
                                                    MANDATORY_LABELS.WASHABLE,
                                                    "Yes",
                                                )
                                            }
                                        />{" "}
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={
                                                getAttrValue(
                                                    MANDATORY_LABELS.WASHABLE,
                                                ) === "No"
                                            }
                                            onChange={() =>
                                                setAttrValue(
                                                    MANDATORY_LABELS.WASHABLE,
                                                    "No",
                                                )
                                            }
                                        />{" "}
                                        No
                                    </label>
                                </div>
                            </div>
                            <Input
                                label={MANDATORY_LABELS.SHORE + " (with units)"}
                                value={getAttrValue(MANDATORY_LABELS.SHORE)}
                                onChange={(v: string) =>
                                    setAttrValue(MANDATORY_LABELS.SHORE, v)
                                }
                            />
                            <Input
                                label={
                                    MANDATORY_LABELS.TEMP +
                                    " For heat deflection temperature (without units)"
                                }
                                value={getAttrValue(MANDATORY_LABELS.TEMP)}
                                onChange={(v: string) =>
                                    setAttrValue(MANDATORY_LABELS.TEMP, v)
                                }
                            />
                            <Input
                                label={
                                    MANDATORY_LABELS.PRESSURE +
                                    " For heat deflection temperature (without units)"
                                }
                                value={getAttrValue(MANDATORY_LABELS.PRESSURE)}
                                onChange={(v: string) =>
                                    setAttrValue(MANDATORY_LABELS.PRESSURE, v)
                                }
                            />
                        </div>
                    </Section>

                    {/* ADDITIONAL ATTRIBUTES */}
                    <Section title="Additional Attributes for Quick Specs (Optional)">
                        {formData.attributes
                            .filter(
                                (a) =>
                                    !Object.values(MANDATORY_LABELS).includes(
                                        a.label,
                                    ),
                            )
                            .map((a, i) => {
                                const realIndex =
                                    formData.attributes.indexOf(a);
                                return (
                                    <div
                                        key={i}
                                        className="grid grid-cols-2 gap-3 mb-2"
                                    >
                                        <input
                                            placeholder="Label"
                                            value={a.label}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    "attributes",
                                                    realIndex,
                                                    "label",
                                                    e.target.value,
                                                )
                                            }
                                            className="border px-3 py-2 rounded"
                                        />
                                        <input
                                            placeholder="Value"
                                            value={a.value}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    "attributes",
                                                    realIndex,
                                                    "value",
                                                    e.target.value,
                                                )
                                            }
                                            className="border px-3 py-2 rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem(
                                                    "attributes",
                                                    realIndex,
                                                )
                                            }
                                            className="text-red-600 text-sm justify-self-start"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}
                        <AddButton
                            onClick={() =>
                                addItem("attributes", { label: "", value: "" })
                            }
                        />
                    </Section>

                    {/* WEIGHTS */}
                    <Section title="Weights & Pricing">
                        <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-500 mb-2">
                            <div className="col-span-3">Weight (g)</div>
                            <div className="col-span-3">Selling Price (₹)</div>
                            <div className="col-span-2">MRP (₹)</div>
                            <div className="col-span-2">Discount</div>
                            <div className="col-span-1">In Stock</div>
                            <div className="col-span-1"></div>
                        </div>
                        {formData.weights.map((w, i) => {
                            const price = parseFloat(w.price) || 0;
                            const mrp = parseFloat(w.originalPrice || "0") || 0;
                            const isInvalid = mrp > 0 && price >= mrp;
                            const discount =
                                mrp > 0 && price < mrp
                                    ? Math.round(((mrp - price) / mrp) * 100)
                                    : 0;
                            return (
                                <div
                                    key={i}
                                    className="grid grid-cols-12 gap-3 items-center mb-4"
                                >
                                    <div className="col-span-3">
                                        <input
                                            placeholder="1000"
                                            value={w.weightInGrams}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    "weights",
                                                    i,
                                                    "weightInGrams",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full border px-3 py-2 rounded"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            placeholder="Price"
                                            type="number"
                                            value={w.price}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    "weights",
                                                    i,
                                                    "price",
                                                    e.target.value,
                                                )
                                            }
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            className={`w-full border px-3 py-2 rounded ${isInvalid ? "border-red-500 bg-red-50" : ""}`}
                                        />
                                        {isInvalid && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Must be less than MRP
                                            </p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            placeholder="MRP"
                                            type="number"
                                            value={w.originalPrice || ""}
                                            onChange={(e) =>
                                                updateArrayItem(
                                                    "weights",
                                                    i,
                                                    "originalPrice",
                                                    e.target.value,
                                                )
                                            }
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            className="w-full border px-3 py-2 rounded"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        {mrp > 0 ? (
                                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                                {discount}% OFF
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">
                                                -
                                            </span>
                                        )}
                                    </div>
                                    {/* Per-weight inStock toggle */}
                                    <div className="col-span-1 flex items-center">
                                        <Toggle
                                            value={w.inStock ?? true}
                                            onChange={(v) =>
                                                updateArrayItem(
                                                    "weights",
                                                    i,
                                                    "inStock",
                                                    v,
                                                )
                                            }
                                            activeColor="bg-green-500"
                                            label=""
                                            small
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem("weights", i)
                                            }
                                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <AddButton
                            onClick={() =>
                                addItem("weights", {
                                    weightInGrams: "",
                                    price: "",
                                    inStock: true,
                                })
                            }
                        />
                    </Section>

                    {/* COLOURS & IMAGES */}
                    <Section title="Colours & Images">
                        {formData.colours.map((c, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4"
                            >
                                <div className="flex justify-between items-start mb-6 border-b pb-4">
                                    <div className="flex-1 mr-8 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Colour Name"
                                                value={c.name}
                                                onChange={(v: string) =>
                                                    updateArrayItem(
                                                        "colours",
                                                        i,
                                                        "name",
                                                        v,
                                                    )
                                                }
                                            />
                                            <Input
                                                label="Hex Code"
                                                value={c.hexCode || ""}
                                                onChange={(v: string) => {
                                                    const value = v.startsWith(
                                                        "#",
                                                    )
                                                        ? v.toUpperCase()
                                                        : `#${v.toUpperCase()}`;
                                                    updateArrayItem(
                                                        "colours",
                                                        i,
                                                        "hexCode",
                                                        value,
                                                    );
                                                    if (
                                                        value &&
                                                        !isValidHexColor(value)
                                                    ) {
                                                        setColourErrors(
                                                            (prev) => ({
                                                                ...prev,
                                                                [i]: "Invalid hex code (example: #FF5733)",
                                                            }),
                                                        );
                                                    } else {
                                                        setColourErrors(
                                                            (prev) => {
                                                                const next = {
                                                                    ...prev,
                                                                };
                                                                delete next[i];
                                                                return next;
                                                            },
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                        {colourErrors[i] && (
                                            <p className="text-sm text-red-500">
                                                {colourErrors[i]}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded border border-gray-300"
                                                style={{
                                                    backgroundColor:
                                                        c.hexCode &&
                                                        isValidHexColor(
                                                            c.hexCode,
                                                        )
                                                            ? c.hexCode
                                                            : "#ffffff",
                                                }}
                                            />
                                            <span className="text-xs text-gray-500">
                                                Preview
                                            </span>
                                        </div>

                                        {/* Per-colour inStock toggle */}
                                        <Toggle
                                            value={c.inStock ?? true}
                                            onChange={(v) =>
                                                updateArrayItem(
                                                    "colours",
                                                    i,
                                                    "inStock",
                                                    v,
                                                )
                                            }
                                            activeColor="bg-green-500"
                                            label="In Stock"
                                            description="Turn off to mark this colour as out of stock"
                                            small
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem("colours", i)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
                                        <ImageIcon className="w-4 h-4" />
                                        <h3>Gallery Images</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {c.images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group aspect-square rounded-lg border-2 border-gray-200 overflow-hidden"
                                            >
                                                <Image
                                                    src={img.url}
                                                    alt="Resin Image"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeColourImage(
                                                                i,
                                                                idx,
                                                            )
                                                        }
                                                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm transition-transform hover:scale-110"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                                            <span className="text-xs text-gray-500 font-medium">
                                                Upload
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleColourImageUpload(
                                                        i,
                                                        e.target.files,
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                addItem("colours", {
                                    name: "",
                                    hexCode: "",
                                    inStock: true,
                                    images: [],
                                })
                            }
                            className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors mt-2"
                        >
                            <Plus size={18} /> Add Another Colour
                        </button>
                    </Section>

                    {/* SPECIFICATIONS */}
                    <Section title="Technical Specifications">
                        {SPEC_CATEGORIES.map((cat) => (
                            <div key={cat} className="space-y-2 mb-6 last:mb-0">
                                <h4 className="font-semibold text-gray-700 border-b pb-1 mb-3">
                                    {cat}
                                </h4>
                                {formData.specifications
                                    .filter((s) => s.category === cat)
                                    .map((s, i) => {
                                        const originalIndex =
                                            formData.specifications.indexOf(s);
                                        return (
                                            <div
                                                key={i}
                                                className="grid grid-cols-3 gap-2 mb-2"
                                            >
                                                <input
                                                    value={s.label}
                                                    onChange={(e) =>
                                                        updateArrayItem(
                                                            "specifications",
                                                            originalIndex,
                                                            "label",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Label"
                                                    className="border px-2 py-1 rounded"
                                                />
                                                <input
                                                    value={s.value}
                                                    onChange={(e) =>
                                                        updateArrayItem(
                                                            "specifications",
                                                            originalIndex,
                                                            "value",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Value"
                                                    className="border px-2 py-1 rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            "specifications",
                                                            originalIndex,
                                                        )
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                <AddButton
                                    onClick={() =>
                                        addItem("specifications", {
                                            category: cat,
                                            label: "",
                                            value: "",
                                            sortOrder: 0,
                                        })
                                    }
                                />
                            </div>
                        ))}
                    </Section>

                    {/* FEATURES / APPS / COMPATIBILITY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TripleList
                            title="Features"
                            items={formData.features}
                            field="features"
                            updateArrayItem={updateArrayItem}
                            addItem={addItem}
                            removeItem={removeItem}
                        />
                        <TripleList
                            title="Applications"
                            items={formData.applications}
                            field="applications"
                            updateArrayItem={updateArrayItem}
                            addItem={addItem}
                            removeItem={removeItem}
                        />
                        <TripleList
                            title="Compatibility"
                            items={formData.compatibilities}
                            field="compatibilities"
                            updateArrayItem={updateArrayItem}
                            addItem={addItem}
                            removeItem={removeItem}
                        />
                    </div>

                    {/* DOWNLOADS */}
                    <Section title="Downloads">
                        {formData.downloads.map((d, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-3 gap-2 mb-2"
                            >
                                <input
                                    placeholder="Title"
                                    value={d.title}
                                    onChange={(e) =>
                                        updateArrayItem(
                                            "downloads",
                                            i,
                                            "title",
                                            e.target.value,
                                        )
                                    }
                                    className="border px-3 py-2 rounded"
                                />
                                <input
                                    placeholder="URL"
                                    value={d.downloadUrl || ""}
                                    onChange={(e) =>
                                        updateArrayItem(
                                            "downloads",
                                            i,
                                            "downloadUrl",
                                            e.target.value,
                                        )
                                    }
                                    className="border px-3 py-2 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeItem("downloads", i)}
                                    className="text-red-600"
                                >
                                    <Trash2 />
                                </button>
                            </div>
                        ))}
                        <AddButton
                            onClick={() => addItem("downloads", { title: "" })}
                        />
                    </Section>

                    {/* DESCRIPTIONS */}
                    <Section title="Descriptions">
                        <Textarea
                            label="Short Description"
                            value={formData.shortDescription}
                            onChange={(v: string) =>
                                updateField("shortDescription", v)
                            }
                            maxLength={92}
                        />
                        <Textarea
                            label="Full Description"
                            value={formData.description}
                            onChange={(v: string) =>
                                updateField("description", v)
                            }
                        />
                    </Section>
                </div>
            </form>
        </div>
    );
}

/* ===================== SMALL COMPONENTS ===================== */

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

function Section({ title, children }: any) {
    return (
        <div className="bg-white border rounded shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-4">
                {title}
            </h2>
            {children}
        </div>
    );
}

function Input({ label, value, onChange, type = "text", className = "" }: any) {
    return (
        <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-black focus:outline-none ${className}`}
            />
        </div>
    );
}

function Textarea({ label, value, onChange, maxLength }: any) {
    return (
        <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">
                {label}
            </label>
            <textarea
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-black focus:outline-none"
                maxLength={maxLength}
            />
            {maxLength && (
                <p className="mt-1 text-xs text-gray-500">
                    {value.length}/{maxLength} characters
                </p>
            )}
        </div>
    );
}

function Select({ label, value, options, onChange }: any) {
    return (
        <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border px-3 py-2 rounded bg-white focus:ring-2 focus:ring-black focus:outline-none"
            >
                <option value="">Select</option>
                {options.map((o: string) => (
                    <option key={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

function MultiSelect({ label, options, value, onChange }: any) {
    const safeValue = Array.isArray(value) ? value : [];
    return (
        <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((o: string) => (
                    <button
                        key={o}
                        type="button"
                        onClick={() =>
                            onChange(
                                safeValue.includes(o)
                                    ? safeValue.filter((v: string) => v !== o)
                                    : [...safeValue, o],
                            )
                        }
                        className={`px-3 py-1 border rounded text-sm transition-colors ${safeValue.includes(o) ? "bg-black text-white border-black" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                    >
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

function AddButton({ onClick }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="text-blue-600 text-sm flex items-center gap-1 font-medium hover:text-blue-800 mt-2"
        >
            <Plus size={16} /> Add Item
        </button>
    );
}

function TripleList({
    title,
    items,
    field,
    updateArrayItem,
    addItem,
    removeItem,
}: any) {
    return (
        <Section title={title}>
            {items.map((item: any, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                    <input
                        value={item.name || item.title}
                        onChange={(e) =>
                            updateArrayItem(
                                field,
                                i,
                                item.name !== undefined ? "name" : "title",
                                e.target.value,
                            )
                        }
                        className="flex-1 border px-3 py-2 rounded"
                    />
                    <button
                        type="button"
                        onClick={() => removeItem(field, i)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <AddButton
                onClick={() =>
                    addItem(
                        field,
                        field === "features" ? { title: "" } : { name: "" },
                    )
                }
            />
        </Section>
    );
}
