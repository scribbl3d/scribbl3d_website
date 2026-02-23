// PATH: components/prebuilt-products/PrebuiltProductForm.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type AttributeInput = { label: string; value: string };

export type VariantInput = {
    id?: string;
    price: number; // stored in paise
    originalPrice: number;
    stockQuantity: number;
    isActive: boolean;
    colorName?: string;
    colorHex?: string;
    sizeName?: string;
    sizeCode?: string;
};

export type ImageInput = {
    id?: string;
    url: string;
    publicId?: string;
    altText?: string;
    position: number;
    colorName?: string;
};

export type ProductFormData = {
    name: string;
    shortDescription: string;
    longDescription?: string;
    category: string;
    isCustomizable: boolean;
    highlighted: boolean;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
    features: string[];
    attributes: AttributeInput[];
    variants: VariantInput[];
    images: ImageInput[];
};

type Props = {
    mode: "create" | "edit";
    productId?: string;
    defaultValues?: Partial<ProductFormData & { id: string }>;
    /** Called after successful API response — should handle redirect */
    onSuccess: () => void;
};

/* ─── Constants ──────────────────────────────────────────────────────────── */

const CATEGORIES = ["FDM", "Resin", "SLA", "SLS", "MSLA", "DLP", "Other"];

const emptyVariant = (): VariantInput => ({
    price: 0,
    originalPrice: 0,
    stockQuantity: 0,
    isActive: true,
    colorName: "",
    colorHex: "",
    sizeName: "",
    sizeCode: "",
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
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ── State ── */
    const [name, setName] = useState(defaultValues?.name ?? "");
    const [shortDescription, setShortDescription] = useState(
        defaultValues?.shortDescription ?? "",
    );
    const [longDescription, setLongDescription] = useState(
        defaultValues?.longDescription ?? "",
    );
    const [category, setCategory] = useState(defaultValues?.category ?? "FDM");
    const [isCustomizable, setIsCustomizable] = useState(
        defaultValues?.isCustomizable ?? false,
    );
    const [highlighted, setHighlighted] = useState(
        defaultValues?.highlighted ?? false,
    );
    const [length, setLength] = useState(
        defaultValues?.length?.toString() ?? "",
    );
    const [breadth, setBreadth] = useState(
        defaultValues?.breadth?.toString() ?? "",
    );
    const [height, setHeight] = useState(
        defaultValues?.height?.toString() ?? "",
    );
    const [weight, setWeight] = useState(
        defaultValues?.weight?.toString() ?? "",
    );
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
            ? defaultValues.variants
            : [emptyVariant()],
    );
    const [images, setImages] = useState<ImageInput[]>(
        defaultValues?.images ?? [],
    );

    /* ── Validation ── */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Product name is required";
        if (!shortDescription.trim())
            e.shortDesc = "Short description is required";
        if (!category) e.category = "Category is required";
        if (!variants.length) e.variants = "At least one variant is required";
        if ((variants[0]?.price ?? 0) <= 0)
            e.price = "Sale price must be greater than 0";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── Image upload → POST /api/admin/prebuilt-products (multipart) ── */
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        slotIdx: number,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingIdx(slotIdx);
        try {
            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch("/api/admin/prebuilt-products", {
                method: "POST",
                body: fd,
            });
            if (!res.ok) throw new Error("Upload failed");

            const { url, publicId } = await res.json();

            if (slotIdx === images.length) {
                setImages((p) => [
                    ...p,
                    { url, publicId, altText: name, position: p.length },
                ]);
            } else {
                setImages((p) =>
                    p.map((img, i) =>
                        i === slotIdx ? { ...img, url, publicId } : img,
                    ),
                );
            }
        } catch {
            alert("Image upload failed. Please try again.");
        } finally {
            setUploadingIdx(null);
            e.target.value = "";
        }
    };

    /* ── Submit ── */
    const handleSubmit = () => {
        if (!validate()) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const payload: ProductFormData = {
            name: name.trim(),
            shortDescription: shortDescription.trim(),
            longDescription: longDescription.trim() || undefined,
            category,
            isCustomizable,
            highlighted,
            length: length ? parseFloat(length) : undefined,
            breadth: breadth ? parseFloat(breadth) : undefined,
            height: height ? parseFloat(height) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            features,
            attributes: attributes.filter(
                (a) => a.label.trim() && a.value.trim(),
            ),
            variants,
            images,
        };

        startTransition(async () => {
            try {
                const url =
                    mode === "create"
                        ? "/api/admin/prebuilt-products"
                        : `/api/admin/prebuilt-products/${productId}`;
                const method = mode === "create" ? "POST" : "PATCH";

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error || "Something went wrong");
                    return;
                }

                onSuccess();
            } catch {
                alert("Request failed. Please try again.");
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
                {/* ── Left ── */}
                <div className="flex flex-col gap-6">
                    {/* Basic Details */}
                    <Card title="Basic Details" icon="📄">
                        <div className="space-y-4">
                            <div>
                                <Label required>Product Name</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Creality K1 Max"
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
                                        placeholder="e.g. 15.5"
                                        min={0}
                                        step="0.1"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={isCustomizable}
                                        onChange={(e) =>
                                            setIsCustomizable(e.target.checked)
                                        }
                                        className="w-4 h-4 accent-gray-900"
                                    />
                                    Customizable
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={highlighted}
                                        onChange={(e) =>
                                            setHighlighted(e.target.checked)
                                        }
                                        className="w-4 h-4 accent-gray-900"
                                    />
                                    Featured / Highlighted
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Build Volume */}
                    <Card title="Build Volume (mm)" icon="📐">
                        <div className="grid grid-cols-3 gap-4">
                            {(
                                [
                                    ["Length (L)", length, setLength],
                                    ["Breadth (W)", breadth, setBreadth],
                                    ["Height (H)", height, setHeight],
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
                                        className="text-gray-400 hover:text-red-500 transition-colors leading-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Attributes */}
                    <Card title="Specifications / Attributes" icon="🔧">
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
                                        placeholder="Value (e.g. Zinc)"
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
                            + Add Attribute
                        </button>
                    </Card>

                    {/* Variants */}
                    <Card title="Variants" icon="🎨">
                        <Err msg={errors.variants || errors.price} />
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
                                            <Label required>
                                                Sale Price (₹)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={v.price / 100}
                                                onChange={(e) =>
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      price: Math.round(
                                                                          parseFloat(
                                                                              e
                                                                                  .target
                                                                                  .value ||
                                                                                  "0",
                                                                          ) *
                                                                              100,
                                                                      ),
                                                                  }
                                                                : vv,
                                                        ),
                                                    )
                                                }
                                                placeholder="0.00"
                                                min={0}
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <Label>Original MRP (₹)</Label>
                                            <Input
                                                type="number"
                                                value={v.originalPrice / 100}
                                                onChange={(e) =>
                                                    setVariants((p) =>
                                                        p.map((vv, j) =>
                                                            j === i
                                                                ? {
                                                                      ...vv,
                                                                      originalPrice:
                                                                          Math.round(
                                                                              parseFloat(
                                                                                  e
                                                                                      .target
                                                                                      .value ||
                                                                                      "0",
                                                                              ) *
                                                                                  100,
                                                                          ),
                                                                  }
                                                                : vv,
                                                        ),
                                                    )
                                                }
                                                placeholder="0.00"
                                                min={0}
                                                step="0.01"
                                            />
                                        </div>

                                        <div>
                                            <Label>Color Name</Label>
                                            <Input
                                                value={v.colorName ?? ""}
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
                                                placeholder="e.g. Midnight Black"
                                            />
                                        </div>
                                        <div>
                                            <Label>Color Hex</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={v.colorHex ?? ""}
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
                                                    placeholder="#000000"
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
                                            <Label>Size</Label>
                                            <Input
                                                value={v.sizeName ?? ""}
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
                                                placeholder="e.g. Large, Standard, etc."
                                            />
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

                {/* ── Right ── */}
                <div className="flex flex-col gap-6">
                    {/* Images */}
                    <Card title="Images" icon="🖼">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square"
                                >
                                    <img
                                        src={img.url}
                                        alt={img.altText || ""}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                        <label
                                            className="p-1.5 bg-white rounded-lg cursor-pointer hover:bg-gray-100"
                                            title="Replace"
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
                                                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    handleImageUpload(e, i)
                                                }
                                            />
                                        </label>
                                        <button
                                            onClick={() =>
                                                setImages((p) =>
                                                    p.filter((_, j) => j !== i),
                                                )
                                            }
                                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                            title="Remove"
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
                                    <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                        #{i + 1}
                                    </span>
                                </div>
                            ))}

                            {/* Upload slot */}
                            <label
                                className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 ${uploadingIdx === images.length ? "opacity-50 pointer-events-none" : ""}`}
                            >
                                {uploadingIdx === images.length ? (
                                    <svg
                                        className="animate-spin text-gray-400"
                                        width={24}
                                        height={24}
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
                                ) : (
                                    <>
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
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleImageUpload(e, images.length)
                                    }
                                />
                            </label>
                        </div>

                        {/* Alt texts */}
                        {images.length > 0 && (
                            <div className="space-y-2 mt-1 pt-3 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Alt Texts
                                </p>
                                {images.map((img, i) => (
                                    <Input
                                        key={i}
                                        value={img.altText ?? ""}
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
                                        placeholder={`Alt text for image #${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
