// PATH: components/prebuilt-products/PrebuiltProductForm.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/* ─── Categories ─────────────────────────────────────────────────────────── */

const CATEGORIES = [
    "Cosplay",
    "Figurine",
    "Home Essentials",
    "Household Utilities",
    "Keychains",
    "Kits",
    "Lamps",
    "New Launch",
    "Personalised",
    "Statues",
    "The Latest",
    "Trending Now",
    "Utilities",
    "Wall Decor",
];

/* ─── Types ──────────────────────────────────────────────────────────────── */

type AttributeInput = { label: string; value: string };

type VariantInput = {
    id?: string;
    price: number; // paise in DB
    originalPrice: number; // paise in DB
    priceDisplay: string; // ₹ string for input
    originalPriceDisplay: string; // ₹ string for input
    isActive: boolean;
    colorName: string;
    colorHex: string;
    sizeName: string;
};

type ImageInput = {
    id?: string; // present for existing DB images
    url: string;
    file?: File; // present for new uploads (not yet uploaded)
    altText: string;
    position: number;
    colorName: string;
    isMain: boolean; // true = thumbnail image
    isNew: boolean; // true = needs uploading, false = already in DB
};

export type ProductFormData = {
    name: string;
    shortDescription: string;
    longDescription: string;
    category: string;
    isCustomizable: boolean;
    highlighted: boolean;
    length: string;
    breadth: string;
    height: string;
    weight: string;
    features: string[];
    attributes: AttributeInput[];
    variants: VariantInput[];
    images: ImageInput[];
};

type Props = {
    mode: "create" | "edit";
    productId?: string;
    defaultValues?: Partial<ProductFormData & { id: string }>;
    onSuccess: () => void;
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function paiseToDisplay(paise: number): string {
    return paise > 0 ? (paise / 100).toString() : "";
}

const emptyVariant = (): VariantInput => ({
    price: 0,
    originalPrice: 0,
    priceDisplay: "",
    originalPriceDisplay: "",
    isActive: true,
    colorName: "",
    colorHex: "",
    sizeName: "",
});

const emptyAttr = (): AttributeInput => ({ label: "", value: "" });

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function Label({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

function Input({
    className = "",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${className}`}
            {...props}
        />
    );
}

function Select({
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            {...props}
        >
            {children}
        </select>
    );
}

function Card({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <span className="text-lg">{icon}</span>
                <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function Err({ msg }: { msg?: string }) {
    return msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;
}

/* ─── Main Form ──────────────────────────────────────────────────────────── */

export default function PrebuiltProductForm({
    mode,
    productId,
    defaultValues,
    onSuccess,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ── State ── */
    const [name, setName] = useState(defaultValues?.name ?? "");
    const [shortDescription, setShortDescription] = useState(
        defaultValues?.shortDescription ?? "",
    );
    const [longDescription, setLongDescription] = useState(
        defaultValues?.longDescription ?? "",
    );
    const [category, setCategory] = useState(
        defaultValues?.category ?? CATEGORIES[0],
    );
    const [isCustomizable, setIsCustomizable] = useState(
        defaultValues?.isCustomizable ?? false,
    );
    const [length, setLength] = useState(defaultValues?.length ?? "");
    const [breadth, setBreadth] = useState(defaultValues?.breadth ?? "");
    const [height, setHeight] = useState(defaultValues?.height ?? "");
    const [weight, setWeight] = useState(defaultValues?.weight ?? "");
    const [features, setFeatures] = useState<string[]>(
        defaultValues?.features ?? [],
    );
    const [featureInput, setFeatureInput] = useState("");

    const [attributes, setAttributes] = useState<AttributeInput[]>(
        defaultValues?.attributes?.length
            ? defaultValues.attributes
            : [emptyAttr(), emptyAttr()],
    );

    const [variants, setVariants] = useState<VariantInput[]>(
        defaultValues?.variants?.length
            ? (defaultValues.variants as any[]).map((v) => ({
                  ...v,
                  priceDisplay: paiseToDisplay(v.price),
                  originalPriceDisplay: paiseToDisplay(v.originalPrice),
              }))
            : [emptyVariant()],
    );

    // Images hold either existing DB images (isNew=false) or local previews (isNew=true)
    const [images, setImages] = useState<ImageInput[]>(
        (defaultValues?.images ?? []).map((img: any, i: number) => ({
            id: img.id,
            url: img.url,
            altText: img.altText ?? "",
            position: img.position ?? i,
            colorName: img.colorName ?? "",
            isMain: img.isMain ?? i === 0,
            isNew: false,
        })),
    );

    /* ── Add image from file picker (local preview, no upload yet) ── */
    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        slotIdx: number,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);

        if (slotIdx === images.length) {
            // New slot — auto-set as main if first image
            setImages((p) => [
                ...p,
                {
                    url: previewUrl,
                    file,
                    altText: "",
                    position: p.length,
                    colorName: "",
                    isMain: p.length === 0, // first image auto-main
                    isNew: true,
                },
            ]);
        } else {
            // Replace existing slot — keep isMain status
            setImages((p) =>
                p.map((img, i) =>
                    i === slotIdx
                        ? {
                              ...img,
                              url: previewUrl,
                              file,
                              isNew: true,
                              id: undefined,
                          }
                        : img,
                ),
            );
        }
        e.target.value = "";
    };

    const setMainImage = (idx: number) => {
        setImages((p) => {
            // Move selected to front, mark as main, all others not main
            const selected = { ...p[idx], isMain: true };
            const rest = p
                .filter((_, i) => i !== idx)
                .map((img) => ({ ...img, isMain: false }));
            return [selected, ...rest].map((img, i) => ({
                ...img,
                position: i,
            }));
        });
    };

    /* ── Validation ── */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Product name is required";
        if (!shortDescription.trim())
            e.shortDesc = "Short description is required";
        if (!category) e.category = "Category is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── Submit → build FormData and POST/PUT ── */
    const handleSubmit = () => {
        if (!validate()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setLoading(true);
        startTransition(async () => {
            try {
                const fd = new FormData();

                // Basic fields
                fd.append("name", name.trim());
                fd.append("shortDescription", shortDescription.trim());
                fd.append("longDescription", longDescription.trim());
                fd.append("category", category);
                fd.append("isCustomizable", String(isCustomizable));
                fd.append("highlighted", "false");
                if (weight) fd.append("weight", weight);
                if (length) fd.append("length", length);
                if (breadth) fd.append("breadth", breadth);
                if (height) fd.append("height", height);

                // JSON arrays
                fd.append("features", JSON.stringify(features));
                fd.append(
                    "attributes",
                    JSON.stringify(
                        attributes.filter(
                            (a) => a.label.trim() && a.value.trim(),
                        ),
                    ),
                );
                fd.append(
                    "variants",
                    JSON.stringify(
                        variants.map(
                            ({
                                priceDisplay: _pd,
                                originalPriceDisplay: _opd,
                                ...v
                            }) => v,
                        ),
                    ),
                );

                // Images: split into existing (keep) and new (upload)
                const existingImages = images.filter((img) => !img.isNew);
                const newImages = images.filter((img) => img.isNew);

                if (mode === "edit") {
                    // Tell the server which existing images to keep
                    fd.append(
                        "existingImages",
                        JSON.stringify(
                            existingImages.map((img) => ({
                                id: img.id,
                                url: img.url,
                                altText: img.altText,
                                position: img.position,
                                colorName: img.colorName || null,
                                isMain: img.isMain,
                            })),
                        ),
                    );
                }

                // Append new image files + metadata
                for (let i = 0; i < newImages.length; i++) {
                    const img = newImages[i];
                    if (img.file) {
                        fd.append("newImages", img.file);
                        fd.append(
                            "newImagesMeta",
                            JSON.stringify({
                                altText: img.altText || name.trim(),
                                position: img.position,
                                colorName: img.colorName || null,
                                isMain: img.isMain,
                            }),
                        );
                    }
                }

                const url =
                    mode === "create"
                        ? "/api/admin/prebuilt-products"
                        : `/api/admin/prebuilt-products/${productId}`;
                const method = mode === "create" ? "POST" : "PUT";

                const res = await fetch(url, { method, body: fd });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    alert(data.error || "Something went wrong");
                    return;
                }

                onSuccess();
            } catch (err) {
                console.error(err);
                alert("Request failed. Please try again.");
            } finally {
                setLoading(false);
            }
        });
    };

    const totalVolume =
        length && breadth && height
            ? (
                  parseFloat(length) *
                  parseFloat(breadth) *
                  parseFloat(height)
              ).toLocaleString()
            : null;

    /* ─────────────────────────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50">
            <LoadingModal open={loading} isEdit={mode === "edit"} />

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <svg
                            width={20}
                            height={20}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M19 12H5M12 5l-7 7 7 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {mode === "create"
                                ? "Add New Product"
                                : "Edit Product"}
                        </h1>
                        <p className="text-xs text-gray-400">
                            {mode === "create"
                                ? "Create a new product listing"
                                : `Editing: ${defaultValues?.name}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? (
                            <>
                                <svg
                                    className="animate-spin"
                                    width={15}
                                    height={15}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg
                                    width={15}
                                    height={15}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <polyline
                                        points="17 21 17 13 7 13 7 21"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <polyline
                                        points="7 3 7 8 15 8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Save Product
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {Object.keys(errors).length > 0 && (
                <div className="max-w-screen-xl mx-auto px-8 pt-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                        <strong>Please fix the following errors:</strong>
                        <ul className="mt-1 list-disc list-inside space-y-0.5">
                            {Object.values(errors).map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="max-w-screen-xl mx-auto px-8 py-8 grid grid-cols-[1fr_360px] gap-6 items-start">
                {/* ── Left column ── */}
                <div className="flex flex-col gap-6">
                    {/* Basic Details */}
                    <Card title="Basic Details" icon="📄">
                        <div className="space-y-4">
                            <div>
                                <Label required>Product Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Spongebob Squarepants Figure"
                                />
                                <Err msg={errors.name} />
                            </div>
                            <div>
                                <Label required>Short Description</Label>
                                <Input
                                    value={shortDescription}
                                    onChange={(e) =>
                                        setShortDescription(e.target.value)
                                    }
                                    placeholder="Brief one-line summary"
                                />
                                <Err msg={errors.shortDesc} />
                            </div>
                            <div>
                                <Label>Long Description</Label>
                                <textarea
                                    value={longDescription}
                                    onChange={(e) =>
                                        setLongDescription(e.target.value)
                                    }
                                    rows={4}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-y"
                                    placeholder="Detailed product description..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label required>Category</Label>
                                    <Select
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </Select>
                                    <Err msg={errors.category} />
                                </div>
                                <div>
                                    <Label>Weight (kg)</Label>
                                    <Input
                                        type="number"
                                        value={weight}
                                        onChange={(e) =>
                                            setWeight(e.target.value)
                                        }
                                        placeholder="e.g. 0.5"
                                        min={0}
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            {/* Customizable toggle */}
                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsCustomizable((p) => !p)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isCustomizable ? "bg-gray-900" : "bg-gray-200"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCustomizable ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                                <span className="text-sm text-gray-700 font-medium">
                                    Customizable
                                </span>
                                <span className="text-xs text-gray-400">
                                    {isCustomizable
                                        ? "Customers can personalise this product"
                                        : "Fixed product, no customisation"}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Dimensions */}
                    <Card title="Dimensions (mm)" icon="📐">
                        <div className="grid grid-cols-3 gap-4">
                            {(
                                [
                                    ["Length", length, setLength],
                                    ["Width", breadth, setBreadth],
                                    ["Height", height, setHeight],
                                ] as const
                            ).map(([lbl, val, setter]) => (
                                <div key={lbl}>
                                    <Label>{lbl}</Label>
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) =>
                                            (setter as (v: string) => void)(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        min={0}
                                    />
                                </div>
                            ))}
                        </div>
                        {totalVolume && (
                            <p className="mt-3 text-xs text-gray-400">
                                Total Volume:{" "}
                                <span className="font-semibold text-gray-600">
                                    {totalVolume} mm³
                                </span>
                            </p>
                        )}
                    </Card>

                    {/* Features */}
                    <Card title="Features" icon="✨">
                        <div className="flex gap-2 mb-3">
                            <Input
                                value={featureInput}
                                onChange={(e) =>
                                    setFeatureInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const v = featureInput.trim();
                                        if (v && !features.includes(v)) {
                                            setFeatures((p) => [...p, v]);
                                            setFeatureInput("");
                                        }
                                    }
                                }}
                                placeholder="Type a feature and press Enter"
                            />
                            <button
                                onClick={() => {
                                    const v = featureInput.trim();
                                    if (v && !features.includes(v)) {
                                        setFeatures((p) => [...p, v]);
                                        setFeatureInput("");
                                    }
                                }}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shrink-0"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {features.length === 0 && (
                                <span className="text-xs text-gray-400">
                                    No features added yet.
                                </span>
                            )}
                            {features.map((f, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full"
                                >
                                    {f}
                                    <button
                                        onClick={() =>
                                            setFeatures((p) =>
                                                p.filter((_, j) => j !== i),
                                            )
                                        }
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Specifications */}
                    <Card title="Specifications" icon="🔧">
                        <div className="space-y-2">
                            {attributes.map((attr, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                                >
                                    <Input
                                        value={attr.label}
                                        onChange={(e) =>
                                            setAttributes((p) =>
                                                p.map((a, j) =>
                                                    j === i
                                                        ? {
                                                              ...a,
                                                              label: e.target
                                                                  .value,
                                                          }
                                                        : a,
                                                ),
                                            )
                                        }
                                        placeholder="Label (e.g. Material)"
                                    />
                                    <Input
                                        value={attr.value}
                                        onChange={(e) =>
                                            setAttributes((p) =>
                                                p.map((a, j) =>
                                                    j === i
                                                        ? {
                                                              ...a,
                                                              value: e.target
                                                                  .value,
                                                          }
                                                        : a,
                                                ),
                                            )
                                        }
                                        placeholder="Value (e.g. PVC)"
                                    />
                                    <button
                                        onClick={() =>
                                            setAttributes((p) =>
                                                p.filter((_, j) => j !== i),
                                            )
                                        }
                                        className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                        <svg
                                            width={13}
                                            height={13}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() =>
                                setAttributes((p) => [...p, emptyAttr()])
                            }
                            className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            + Add Specification
                        </button>
                    </Card>

                    {/* Variants */}
                    <Card title="Variants" icon="🎨">
                        <div className="space-y-4">
                            {variants.map((v, i) => (
                                <div
                                    key={i}
                                    className="border border-gray-100 rounded-xl p-4 bg-gray-50/50"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            Variant #{i + 1}
                                        </span>
                                        {variants.length > 1 && (
                                            <button
                                                onClick={() =>
                                                    setVariants((p) =>
                                                        p.filter(
                                                            (_, j) => j !== i,
                                                        ),
                                                    )
                                                }
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>Sale Price (₹)</Label>
                                            <Input
                                                type="number"
                                                value={v.priceDisplay}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      priceDisplay:
                                                                          raw,
                                                                      price:
                                                                          raw ===
                                                                          ""
                                                                              ? 0
                                                                              : Math.round(
                                                                                    parseFloat(
                                                                                        raw,
                                                                                    ) *
                                                                                        100,
                                                                                ),
                                                                  }
                                                                : vv,
                                                        ),
                                                    );
                                                }}
                                                placeholder="e.g. 499"
                                                min={0}
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <Label>Original MRP (₹)</Label>
                                            <Input
                                                type="number"
                                                value={v.originalPriceDisplay}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      originalPriceDisplay:
                                                                          raw,
                                                                      originalPrice:
                                                                          raw ===
                                                                          ""
                                                                              ? 0
                                                                              : Math.round(
                                                                                    parseFloat(
                                                                                        raw,
                                                                                    ) *
                                                                                        100,
                                                                                ),
                                                                  }
                                                                : vv,
                                                        ),
                                                    );
                                                }}
                                                placeholder="e.g. 699"
                                                min={0}
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <Label>Color Name</Label>
                                            <Input
                                                value={v.colorName}
                                                onChange={(e) =>
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      colorName:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : vv,
                                                        ),
                                                    )
                                                }
                                                placeholder="e.g. Red"
                                            />
                                        </div>
                                        <div>
                                            <Label>Color Hex</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={v.colorHex}
                                                    onChange={(e) =>
                                                        setVariants((p) =>
                                                            p.map((vv, j) =>
                                                                j === i
                                                                    ? {
                                                                          ...vv,
                                                                          colorHex:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : vv,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="#ff0000"
                                                />
                                                <input
                                                    type="color"
                                                    value={
                                                        v.colorHex || "#000000"
                                                    }
                                                    onChange={(e) =>
                                                        setVariants((p) =>
                                                            p.map((vv, j) =>
                                                                j === i
                                                                    ? {
                                                                          ...vv,
                                                                          colorHex:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : vv,
                                                            ),
                                                        )
                                                    }
                                                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Size / Variant Name</Label>
                                            <Input
                                                value={v.sizeName}
                                                onChange={(e) =>
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      sizeName:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : vv,
                                                        ),
                                                    )
                                                }
                                                placeholder="e.g. Small, 15cm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-5">
                                            <input
                                                type="checkbox"
                                                id={`active-${i}`}
                                                checked={v.isActive}
                                                onChange={(e) =>
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      isActive:
                                                                          e
                                                                              .target
                                                                              .checked,
                                                                  }
                                                                : vv,
                                                        ),
                                                    )
                                                }
                                                className="w-4 h-4 accent-gray-900"
                                            />
                                            <label
                                                htmlFor={`active-${i}`}
                                                className="text-sm text-gray-700 cursor-pointer select-none"
                                            >
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() =>
                                setVariants((p) => [...p, emptyVariant()])
                            }
                            className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            + Add Variant
                        </button>
                    </Card>
                </div>

                {/* ── Right column ── */}
                <div className="flex flex-col gap-6">
                    {/* Images */}
                    <Card title="Images" icon="🖼">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`relative group rounded-xl overflow-hidden border-2 bg-gray-50 aspect-square ${img.isMain ? "border-blue-500" : "border-gray-100"}`}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.altText || ""}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Main badge */}
                                    {img.isMain && (
                                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                            MAIN
                                        </span>
                                    )}
                                    {img.isNew && !img.isMain && (
                                        <span className="absolute top-1 left-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                            NEW
                                        </span>
                                    )}

                                    {/* Hover actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                        {!img.isMain && (
                                            <button
                                                onClick={() => setMainImage(i)}
                                                className="w-full text-[11px] font-semibold bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                ⭐ Set as Main
                                            </button>
                                        )}
                                        <div className="flex gap-1.5 w-full">
                                            <label
                                                className="flex-1 flex items-center justify-center p-1.5 bg-white rounded-lg cursor-pointer hover:bg-gray-100 text-[10px] font-medium text-gray-700"
                                                title="Replace"
                                            >
                                                Replace
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) =>
                                                        handleFileSelect(e, i)
                                                    }
                                                />
                                            </label>
                                            <button
                                                onClick={() =>
                                                    setImages((p) => {
                                                        const filtered =
                                                            p.filter(
                                                                (_, j) =>
                                                                    j !== i,
                                                            );
                                                        // If we removed the main, make first one main
                                                        if (
                                                            img.isMain &&
                                                            filtered.length > 0
                                                        ) {
                                                            filtered[0] = {
                                                                ...filtered[0],
                                                                isMain: true,
                                                            };
                                                        }
                                                        return filtered.map(
                                                            (im, idx) => ({
                                                                ...im,
                                                                position: idx,
                                                            }),
                                                        );
                                                    })
                                                }
                                                className="flex-1 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-[10px] font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                        #{i + 1}
                                    </span>
                                </div>
                            ))}

                            {/* Upload slot */}
                            <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                                <svg
                                    width={24}
                                    height={24}
                                    fill="none"
                                    stroke="#9ca3af"
                                    strokeWidth={1.5}
                                    viewBox="0 0 24 24"
                                    className="mb-1"
                                >
                                    <path
                                        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span className="text-xs text-gray-400 font-medium">
                                    Upload
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileSelect(e, images.length)
                                    }
                                />
                            </label>
                        </div>

                        {/* Per-image alt texts */}
                        {images.length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Alt Texts (per image)
                                </p>
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-[10px] text-gray-400 font-bold shrink-0 w-5 text-right">
                                            #{i + 1}
                                        </span>
                                        <Input
                                            value={img.altText}
                                            onChange={(e) =>
                                                setImages((p) =>
                                                    p.map((im, j) =>
                                                        j === i
                                                            ? {
                                                                  ...im,
                                                                  altText:
                                                                      e.target
                                                                          .value,
                                                              }
                                                            : im,
                                                    ),
                                                )
                                            }
                                            placeholder={`e.g. Front view of ${name || "product"}`}
                                        />
                                        {img.isMain && (
                                            <span className="text-[10px] text-blue-500 font-bold shrink-0">
                                                MAIN
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ─── Loading Modal (same as printers) ──────────────────────────────────── */

function LoadingModal({ open, isEdit }: { open: boolean; isEdit: boolean }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl px-8 py-7 w-[360px] text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1.5">
                    {isEdit ? "Updating Product…" : "Creating Product…"}
                </h2>
                <p className="text-sm text-gray-500">
                    Uploading images and saving. Please do not close this
                    window.
                </p>
            </div>
        </div>
    );
}
