"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    ChevronRight,
    FileText,
    Info,
    Layers,
    MessageSquare,
    Package,
    Plus,
    Trash2,
    UploadCloud,
} from "lucide-react";
import { useState } from "react";

const MATERIALS = {
    FDM: {
        PLA: {
            "PLA+": [
                "White",
                "Black",
                "Red",
                "Yellow",
                "Sky Blue",
                "Navy Blue",
                "Orange",
                "Green",
                "Brown",
                "Grey",
                "Violet",
                "Skin",
                "Clear",
                "Pink",
            ],
            "PLA Matte": [
                "Black",
                "White",
                "Purple",
                "Grey",
                "Red",
                "Sky Blue",
                "Pink",
                "Navy Blue",
                "Skin",
                "Orange",
                "Yellow",
            ],
            "PLA Glow In Dark": ["GID Blue", "GID Green"],
            "PLA Wood": ["Brown"],
            "PLA Marble": ["Marble"],
            "PLA Carbonfiber": ["Black"],
            "PLA Silk": ["Amber Bronze", "Silver", "Red", "Sky Blue", "Yellow"],
        },
        ABS: {
            ABS: [
                "White",
                "Black",
                "Red",
                "Yellow",
                "Sky Blue",
                "Navy Blue",
                "Orange",
                "Green",
                "Brown",
                "Grey",
            ],
            "ABS GF": ["White"],
            "ABS CF": ["Black"],
            "ABS FR": ["Black", "White"],
        },
        TPU: {
            "TPU 95A": [
                "White",
                "Black",
                "Red",
                "Yellow",
                "Sky Blue",
                "Navy Blue",
                "Orange",
                "Green",
                "Grey",
                "Silver Grey",
                "Clear",
            ],
        },
        PETG: {
            PETG: ["White", "Sky Blue", "Navy Blue", "Clear", "Black"],
            "PETG GF": ["White"],
            "PETG CF": ["Black"],
        },
        PA: { PA: ["White", "Black"], "PA GF": ["White"], "PA CF": ["Black"] },
    },
    "SLA/DLP": {
        "Standard Resin": ["White", "Black", "Grey", "Transparent", "Beige"],
        "Standard Plus Resin": [
            "White",
            "Black",
            "Grey",
            "Transparent",
            "Beige",
        ],
        "ABS Like Resin": ["White", "Black", "Grey", "Transparent", "Beige"],
        "Elastic Resin": ["White", "Black", "Grey"],
        "Castable Resin": ["Green"],
        "Jewellery Resin": ["Red/Orange"],
    },
    SLS: { Nylon: ["Black/Gray"] },
};

interface ProductItem {
    id: string;
    file: File | null;
    quantity: string;
    notes: string;
    tech: string;
    material: string;
    subtype: string;
    colorMode: "single" | "multi" | "";
    colors: string[];
}

interface ProductSettings {
    tech: string;
    material: string;
    subtype: string;
    colorMode: "single" | "multi" | "";
    colors: string[];
}

// Accept optional onSubmit prop for dialog integration
export default function SmallBatchManufacturingForm({
    onSubmit,
}: {
    onSubmit?: () => void;
}) {
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sameForAll, setSameForAll] = useState<boolean | null>(null);
    const [products, setProducts] = useState<ProductItem[]>([
        {
            id: crypto.randomUUID(),
            file: null,
            quantity: "",
            notes: "",
            tech: "",
            material: "",
            subtype: "",
            colorMode: "",
            colors: [],
        },
    ]);
    const [globalSettings, setGlobalSettings] = useState<ProductSettings>({
        tech: "",
        material: "",
        subtype: "",
        colorMode: "",
        colors: [],
    });
    const [contact, setContact] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        company: "",
    });

    const getTotalSteps = () => {
        if (sameForAll === null) return 3;
        if (sameForAll === true) return 6;
        return 5 + products.length;
    };

    const back = () => {
        if (step === 2 && sameForAll !== null) {
            setSameForAll(null);
            setStep(1);
        } else {
            setStep((s) => Math.max(s - 1, 0));
        }
    };

    const canGoNext = () => {
        if (step === 0) return true;
        if (step === 1)
            return products.every((p) => p.file && Number(p.quantity) > 0);
        if (step === 2) return sameForAll !== null;

        if (sameForAll === true) {
            if (step === 3) {
                return (
                    !!globalSettings.tech &&
                    !!globalSettings.material &&
                    (globalSettings.tech !== "FDM" ||
                        !!globalSettings.subtype) &&
                    !!globalSettings.colorMode &&
                    globalSettings.colors.length > 0
                );
            }
            if (step === 4) {
                return (
                    !!contact.fullName &&
                    !!contact.email &&
                    !!contact.phone &&
                    !!contact.address
                );
            }
        } else {
            const settingsStartStep = 3;
            const contactStep = 3 + products.length;

            if (step >= settingsStartStep && step < contactStep) {
                const productIndex = step - settingsStartStep;
                const p = products[productIndex];
                return (
                    !!p.tech &&
                    !!p.material &&
                    (p.tech !== "FDM" || !!p.subtype) &&
                    !!p.colorMode &&
                    p.colors.length > 0
                );
            }

            if (step === contactStep) {
                return (
                    !!contact.fullName &&
                    !!contact.email &&
                    !!contact.phone &&
                    !!contact.address
                );
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!canGoNext()) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("fullName", contact.fullName);
            formData.append("email", contact.email);
            formData.append("phone", contact.phone);
            formData.append("address", contact.address);
            formData.append("company", contact.company || "");
            formData.append("productCount", products.length.toString());
            formData.append("sameForAll", sameForAll ? "true" : "false");

            products.forEach((p, i) => {
                if (p.file) formData.append(`file_${i}`, p.file);
                const finalSpecs = {
                    quantity: p.quantity,
                    notes: p.notes,
                    tech: sameForAll ? globalSettings.tech : p.tech,
                    material: sameForAll ? globalSettings.material : p.material,
                    subtype: sameForAll ? globalSettings.subtype : p.subtype,
                    colorMode: sameForAll
                        ? globalSettings.colorMode
                        : p.colorMode,
                    colors: sameForAll ? globalSettings.colors : p.colors,
                };
                formData.append(
                    `productSpecs_${i}`,
                    JSON.stringify(finalSpecs),
                );
            });

            const res = await fetch("/api/small-batch-manufacturing", {
                method: "POST",
                body: formData,
            });
            if (res.ok) setSuccess(true);
            else throw new Error();
        } catch (error) {
            console.error("Submission error:", error);
            alert("Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const renderWelcome = () => (
        <CardContent className="px-6 py-5 space-y-5">
            {/* Header */}
            <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Small Batch Manufacturing Request
                </p>
                <h1 className="text-xl font-black leading-snug text-gray-900">
                    Welcome.
                </h1>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    This form is designed to capture the technical and
                    production details required to evaluate your manufacturing
                    requirements accurately.
                </p>
                <p className="text-sm text-gray-500 font-medium">
                    Please keep your design files and project specifications
                    ready.
                </p>
            </div>

            {/* Estimated time badge */}
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-600">
                    Estimated completion: 5–10 minutes
                </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Information Required */}
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Information Required
                </p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    To ensure precise quotation and production planning, please
                    provide:
                </p>
                <ul className="space-y-2.5">
                    {[
                        {
                            icon: (
                                <FileText className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            ),
                            label: "Design files",
                            detail: ".STL · .STEP · .STP · .OBJ · .3MF · .XT",
                        },
                        {
                            icon: (
                                <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            ),
                            label: "Required quantity",
                            detail: "Batch size per part",
                        },
                        {
                            icon: (
                                <Layers className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            ),
                            label: "Material preferences",
                            detail: "Or performance requirements",
                        },
                        {
                            icon: (
                                <svg
                                    className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            ),
                            label: "Delivery timeline",
                            detail: "If applicable",
                        },
                        {
                            icon: (
                                <svg
                                    className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            ),
                            label: "Contact information",
                            detail: "For coordination & quotation delivery",
                        },
                    ].map(({ icon, label, detail }) => (
                        <li key={label} className="flex gap-3 items-start">
                            {icon}
                            <div>
                                <p className="text-sm font-bold text-gray-800">
                                    {label}
                                </p>
                                <p className="text-xs text-gray-400 font-medium">
                                    {detail}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Footer note */}
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Providing complete details helps us assess feasibility, optimize
                process selection, and deliver accurate pricing and lead times.
            </p>
        </CardContent>
    );

    const renderUpload = () => (
        <CardContent className="space-y-3 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black">
                        Project Specifications
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Upload files & details for each product
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-bold border-gray-200 hover:bg-black hover:text-white transition-all"
                    onClick={() =>
                        setProducts([
                            ...products,
                            {
                                id: crypto.randomUUID(),
                                file: null,
                                quantity: "",
                                notes: "",
                                tech: "",
                                material: "",
                                subtype: "",
                                colorMode: "",
                                colors: [],
                            },
                        ])
                    }
                >
                    <Plus className="h-3 w-3 mr-1" /> Add Product
                </Button>
            </div>

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {products.map((p, i) => (
                    <div
                        key={p.id}
                        className="p-3 border rounded-xl bg-white ring-1 ring-gray-100 space-y-3 shadow-sm hover:ring-gray-300 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-gray-900">
                                Product #{i + 1}
                            </p>
                            {products.length > 1 && (
                                <Button
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-600 h-7 w-7 p-0"
                                    onClick={() =>
                                        setProducts(
                                            products.filter(
                                                (item) => item.id !== p.id,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                Design File *
                            </Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-black transition-all bg-gray-50/50 cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const updated = [...products];
                                        updated[i].file =
                                            e.target.files?.[0] || null;
                                        setProducts(updated);
                                    }}
                                />
                                <UploadCloud className="h-5 w-5 text-gray-300 mx-auto mb-1" />
                                <p className="text-xs font-bold text-gray-600 truncate">
                                    {p.file
                                        ? p.file.name
                                        : "Click to select file"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    .STL · .STEP · .OBJ
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-1">
                                    Quantity *
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    className="h-9 rounded-lg font-bold text-sm"
                                    placeholder="Units"
                                    value={p.quantity || ""}
                                    onChange={(e) => {
                                        const n = [...products];
                                        n[i].quantity = e.target.value;
                                        setProducts(n);
                                    }}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                        Notes
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                                            >
                                                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-black transition-colors cursor-pointer" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            side="top"
                                            align="start"
                                            className="w-48 p-3 text-xs shadow-lg rounded-xl border border-gray-100"
                                        >
                                            <p className="font-black text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">
                                                What to include
                                            </p>
                                            <ul className="space-y-1 text-gray-600 font-medium">
                                                <li className="flex gap-1.5 items-start">
                                                    <span className="text-gray-400">
                                                        •
                                                    </span>
                                                    Tolerances
                                                </li>
                                                <li className="flex gap-1.5 items-start">
                                                    <span className="text-gray-400">
                                                        •
                                                    </span>
                                                    Surface finish
                                                </li>
                                                <li className="flex gap-1.5 items-start">
                                                    <span className="text-gray-400">
                                                        •
                                                    </span>
                                                    Strength requirements
                                                </li>
                                                <li className="flex gap-1.5 items-start">
                                                    <span className="text-gray-400">
                                                        •
                                                    </span>
                                                    Post-processing needs
                                                </li>
                                            </ul>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Textarea
                                    className="rounded-lg border-gray-200 text-sm font-medium h-[72px] p-2 resize-none"
                                    placeholder="Special requirements..."
                                    value={p.notes || ""}
                                    onChange={(e) => {
                                        const n = [...products];
                                        n[i].notes = e.target.value;
                                        setProducts(n);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    );

    const renderModeSelection = () => (
        <CardContent className="space-y-4 px-6 py-4">
            <div>
                <h2 className="text-lg font-black">Production Configuration</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">
                    Do all your parts use the same specifications?
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setSameForAll(true)}
                    className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        sameForAll === true
                            ? "bg-black border-black text-white shadow-lg"
                            : "bg-white border-gray-200 text-gray-900 hover:border-black",
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-black text-sm mb-1">
                                ✅ Same specs
                            </p>
                            <p
                                className={cn(
                                    "text-xs font-medium",
                                    sameForAll === true
                                        ? "text-gray-300"
                                        : "text-gray-500",
                                )}
                            >
                                Identical material & color for all parts
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 mt-0.5" />
                    </div>
                </button>

                <button
                    onClick={() => setSameForAll(false)}
                    className={cn(
                        "p-4 rounded-xl border-2 transition-all text-left",
                        sameForAll === false
                            ? "bg-black border-black text-white shadow-lg"
                            : "bg-white border-gray-200 text-gray-900 hover:border-black",
                    )}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-black text-sm mb-1">
                                🎨 Different specs
                            </p>
                            <p
                                className={cn(
                                    "text-xs font-medium",
                                    sameForAll === false
                                        ? "text-gray-300"
                                        : "text-gray-500",
                                )}
                            >
                                Custom settings per part
                            </p>
                        </div>
                        <ChevronRight className="h-4 w-4 mt-0.5" />
                    </div>
                </button>
            </div>
        </CardContent>
    );

    const renderProductSettings = (productIndex?: number) => {
        const isGlobalMode = sameForAll === true;
        const settings = isGlobalMode
            ? globalSettings
            : products[productIndex!];
        const setSettings = isGlobalMode
            ? setGlobalSettings
            : (updates: Partial<ProductSettings>) => {
                  const updated = [...products];
                  updated[productIndex!] = {
                      ...updated[productIndex!],
                      ...updates,
                  };
                  setProducts(updated);
              };

        const subtypes =
            settings.tech === "FDM"
                ? Object.keys((MATERIALS.FDM as any)?.[settings.material] || {})
                : [];
        const colorSource =
            settings.tech === "FDM"
                ? (MATERIALS.FDM as any)?.[settings.material]?.[
                      settings.subtype
                  ]
                : (MATERIALS as any)?.[settings.tech]?.[settings.material];

        return (
            <CardContent className="space-y-4 px-6 py-4">
                <div>
                    <h2 className="text-lg font-black">
                        {isGlobalMode
                            ? "Production Settings"
                            : `Part #${productIndex! + 1} Settings`}
                    </h2>
                    {!isGlobalMode && products[productIndex!].file && (
                        <p className="text-xs font-medium text-gray-400 mt-0.5 truncate">
                            {products[productIndex!].file?.name}
                        </p>
                    )}
                </div>

                {/* Technology */}
                <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Technology *
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {["FDM", "SLA/DLP", "SLS"].map((t) => (
                            <Button
                                key={t}
                                variant={
                                    settings.tech === t ? "default" : "outline"
                                }
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        tech: t,
                                        material: "",
                                        subtype: "",
                                        colorMode: "",
                                        colors: [],
                                    })
                                }
                                className={cn(
                                    "h-9 font-bold rounded-lg text-sm transition-all",
                                    settings.tech === t
                                        ? "bg-black text-white shadow-lg"
                                        : "border-gray-200 hover:border-gray-400",
                                )}
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Material */}
                {settings.tech && (
                    <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
                            Material *
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys((MATERIALS as any)[settings.tech]).map(
                                (m) => (
                                    <Button
                                        key={m}
                                        variant={
                                            settings.material === m
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            setSettings({
                                                ...settings,
                                                material: m,
                                                subtype: "",
                                                colorMode: "",
                                                colors: [],
                                            })
                                        }
                                        className={cn(
                                            "h-9 rounded-lg text-sm font-bold truncate px-2 transition-all",
                                            settings.material === m
                                                ? "bg-black text-white shadow-lg"
                                                : "border-gray-200 hover:border-gray-400",
                                        )}
                                    >
                                        {m}
                                    </Button>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {/* Subtype */}
                {settings.material && subtypes.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
                            Subtype *
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {subtypes.map((s) => (
                                <Button
                                    key={s}
                                    variant={
                                        settings.subtype === s
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() =>
                                        setSettings({
                                            ...settings,
                                            subtype: s,
                                            colorMode: "",
                                            colors: [],
                                        })
                                    }
                                    className={cn(
                                        "h-9 rounded-lg text-sm font-bold transition-all",
                                        settings.subtype === s
                                            ? "bg-black text-white shadow-lg"
                                            : "border-gray-200 hover:border-gray-400",
                                    )}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Configuration */}
                {(settings.subtype ||
                    (settings.tech &&
                        settings.tech !== "FDM" &&
                        settings.material)) && (
                    <div className="space-y-2">
                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider">
                            Color Configuration *
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={
                                    settings.colorMode === "single"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        colorMode: "single",
                                        colors: [],
                                    })
                                }
                                className={cn(
                                    "rounded-lg font-bold h-9 text-sm transition-all",
                                    settings.colorMode === "single"
                                        ? "bg-black text-white"
                                        : "border-gray-200 hover:border-gray-400",
                                )}
                            >
                                Single Color
                            </Button>
                            <Button
                                variant={
                                    settings.colorMode === "multi"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        colorMode: "multi",
                                        colors: [],
                                    })
                                }
                                className={cn(
                                    "rounded-lg font-bold h-9 text-sm transition-all",
                                    settings.colorMode === "multi"
                                        ? "bg-black text-white"
                                        : "border-gray-200 hover:border-gray-400",
                                )}
                            >
                                Multi Color
                            </Button>
                        </div>

                        {settings.colorMode && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                                {(colorSource || []).map((c: string) => {
                                    const isSelected =
                                        settings.colors.includes(c);
                                    return (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    settings.colorMode ===
                                                    "single"
                                                ) {
                                                    setSettings({
                                                        ...settings,
                                                        colors: [c],
                                                    });
                                                } else {
                                                    const newColors = isSelected
                                                        ? settings.colors.filter(
                                                              (x) => x !== c,
                                                          )
                                                        : [
                                                              ...settings.colors,
                                                              c,
                                                          ];
                                                    setSettings({
                                                        ...settings,
                                                        colors: newColors,
                                                    });
                                                }
                                            }}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                                                isSelected
                                                    ? "bg-black text-white border-black scale-105 shadow-sm"
                                                    : "bg-white border-gray-200 hover:border-gray-400 text-gray-700",
                                            )}
                                        >
                                            {c}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        );
    };

    const renderContact = () => (
        <CardContent className="space-y-3 px-6 py-4">
            <div>
                <h2 className="text-lg font-black">Contact Information</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                    We'll send your quote here
                </p>
            </div>
            <div className="space-y-2.5">
                <div>
                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-1">
                        Full Name *
                    </Label>
                    <Input
                        className="h-9 rounded-lg font-medium border-gray-200 text-sm"
                        placeholder="John Doe"
                        value={contact.fullName || ""}
                        onChange={(e) =>
                            setContact({ ...contact, fullName: e.target.value })
                        }
                    />
                </div>
                <div>
                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-1">
                        Email *
                    </Label>
                    <Input
                        className="h-9 rounded-lg font-medium border-gray-200 text-sm"
                        placeholder="email@company.com"
                        type="email"
                        value={contact.email || ""}
                        onChange={(e) =>
                            setContact({ ...contact, email: e.target.value })
                        }
                    />
                </div>
                <div>
                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-1">
                        Phone *
                    </Label>
                    <Input
                        className="h-9 rounded-lg font-medium border-gray-200 text-sm"
                        placeholder="+91 ..."
                        value={contact.phone || ""}
                        onChange={(e) =>
                            setContact({ ...contact, phone: e.target.value })
                        }
                    />
                </div>
                <div>
                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-1">
                        Company
                    </Label>
                    <Input
                        className="h-9 rounded-lg font-medium border-gray-200 text-sm"
                        placeholder="Optional"
                        value={contact.company || ""}
                        onChange={(e) =>
                            setContact({ ...contact, company: e.target.value })
                        }
                    />
                </div>
                <div>
                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-1">
                        Address *
                    </Label>
                    <Textarea
                        className="rounded-lg min-h-[80px] border-gray-200 font-medium text-sm p-2 resize-none"
                        placeholder="Full shipping address..."
                        value={contact.address || ""}
                        onChange={(e) =>
                            setContact({ ...contact, address: e.target.value })
                        }
                    />
                </div>
            </div>
        </CardContent>
    );

    const renderReview = () => (
        <CardContent className="space-y-3 px-6 py-4">
            <div>
                <h2 className="text-lg font-black">Final Review</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Confirm your order details
                </p>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {products.map((p, i) => (
                    <div
                        key={p.id}
                        className="p-3 bg-white border rounded-xl ring-1 ring-gray-100 space-y-2"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <p className="text-sm font-black text-gray-900">
                                Product #{i + 1}
                            </p>
                            <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                {p.quantity} Units
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                File
                            </p>
                            <p className="text-sm font-bold text-gray-900 break-all">
                                {p.file?.name}
                            </p>
                        </div>
                        {p.notes && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Notes
                                </p>
                                <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">
                                    {p.notes}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Tech
                                </p>
                                <p className="text-sm font-black text-gray-900">
                                    {sameForAll ? globalSettings.tech : p.tech}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Material
                                </p>
                                <p className="text-sm font-black text-gray-900">
                                    {sameForAll
                                        ? globalSettings.material
                                        : p.material}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Colors
                                </p>
                                <p className="text-sm font-black text-gray-900">
                                    {(sameForAll
                                        ? globalSettings.colors
                                        : p.colors
                                    ).join(", ")}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Contact summary */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Contact
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                        {contact.fullName}
                    </p>
                    <p className="text-xs text-gray-600">{contact.email}</p>
                    <p className="text-xs text-gray-600">{contact.phone}</p>
                    {contact.company && (
                        <p className="text-xs text-gray-500">
                            {contact.company}
                        </p>
                    )}
                </div>
            </div>
        </CardContent>
    );

    const renderThankYou = () => (
        <CardContent className="py-10 text-center space-y-4 px-6">
            <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                    Request Submitted!
                </h2>
                <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto">
                    Our team will review your request and provide a quotation
                    within 12–24 hours.
                </p>
            </div>
            <div className="flex flex-col gap-2 max-w-xs mx-auto pt-2">
                <Button
                    className="rounded-xl h-10 bg-[#25D366] hover:bg-[#128C7E] w-full text-white font-bold text-sm shadow-lg transition-all"
                    asChild
                >
                    <a href="https://wa.me/your-number" target="_blank">
                        <MessageSquare className="h-4 w-4 mr-2" /> Chat on
                        WhatsApp
                    </a>
                </Button>
                <p className="text-xs font-medium text-gray-400">
                    support@scribbl3d.com
                </p>
            </div>
        </CardContent>
    );

    const renderStep = () => {
        if (step === 0) return renderWelcome();
        if (step === 1) return renderUpload();
        if (step === 2) return renderModeSelection();

        if (sameForAll === true) {
            if (step === 3) return renderProductSettings();
            if (step === 4) return renderContact();
            if (step === 5) return renderReview();
        } else {
            const settingsStartStep = 3;
            const contactStep = 3 + products.length;
            const reviewStep = contactStep + 1;

            if (step >= settingsStartStep && step < contactStep) {
                return renderProductSettings(step - settingsStartStep);
            }
            if (step === contactStep) return renderContact();
            if (step === reviewStep) return renderReview();
        }
    };

    const totalSteps = getTotalSteps();
    const nextStep = () => {
        if (canGoNext()) setStep((s) => Math.min(s + 1, totalSteps - 1));
    };
    const isLastStep = step === totalSteps - 1;

    // ─── Success state (inside dialog, no page wrapper) ───────────────────────
    if (success) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                {renderThankYou()}
            </div>
        );
    }

    // ─── Main form — no min-h-screen, no centering wrapper ────────────────────
    return (
        <div className="w-full">
            <Card className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm w-full">
                {/* Progress bar */}
                <Progress
                    value={(step / (totalSteps - 1)) * 100}
                    className="h-1 rounded-none bg-gray-100"
                />

                {/* Step content */}
                <div>{renderStep()}</div>

                {/* Footer navigation */}
                <CardFooter className="flex justify-between bg-gray-50/70 px-6 py-3 border-t gap-2">
                    <Button
                        variant="ghost"
                        className="font-bold text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-lg px-4 h-9"
                        onClick={back}
                        disabled={step === 0}
                    >
                        Back
                    </Button>
                    <Button
                        className={cn(
                            "px-6 h-9 rounded-lg font-bold text-sm shadow transition-all hover:scale-[1.02] active:scale-[0.98]",
                            canGoNext() && !submitting
                                ? "bg-black text-white hover:bg-black/90"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed",
                        )}
                        onClick={isLastStep ? handleSubmit : nextStep}
                        disabled={submitting || !canGoNext()}
                    >
                        {submitting
                            ? "Submitting..."
                            : isLastStep
                              ? "Submit Request"
                              : "Next →"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
