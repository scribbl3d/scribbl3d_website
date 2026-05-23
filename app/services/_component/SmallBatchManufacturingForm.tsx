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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    Info,
    Layers,
    Loader2,
    Mail,
    Package,
    Plus,
    Trash2,
    UploadCloud,
    Zap,
} from "lucide-react";
import { useCallback, useState } from "react";

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

// ─── Shared UI atoms (matches Form3D design language) ─────────────────────────

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {message}
        </p>
    );
}

function SectionLabel({
    children,
    required = false,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-1.5 flex items-center gap-1">
            {children}
            {required && (
                <span className="text-red-500 normal-case text-sm font-bold">
                    *
                </span>
            )}
        </p>
    );
}

function CheckItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3 text-sm text-zinc-600">
            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChevronRight className="w-3 h-3 text-white" />
            </div>
            {children}
        </li>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmallBatchManufacturingForm({
    onSubmit,
}: {
    onSubmit?: () => void;
}) {
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sameForAll, setSameForAll] = useState<boolean | null>(null);
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
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

    // Prevent trackpad/scroll from changing number inputs
    const preventScrollChange = useCallback(
        (e: React.WheelEvent<HTMLInputElement>) => {
            e.currentTarget.blur();
        },
        [],
    );

    const getTotalSteps = () => {
        if (sameForAll === null) return 3;
        if (sameForAll === true) return 6;
        return 5 + products.length;
    };

    const back = () => {
        setStepErrors({});
        if (step === 2 && sameForAll !== null) {
            setSameForAll(null);
            setStep(1);
        } else {
            setStep((s) => Math.max(s - 1, 0));
        }
    };

    // Returns errors for the current step, or empty obj if valid
    const getStepErrors = (): Record<string, string> => {
        const errs: Record<string, string> = {};

        if (step === 1) {
            products.forEach((p, i) => {
                if (!p.file) errs[`file_${i}`] = "Please upload a design file";
                if (!p.quantity || Number(p.quantity) < 1)
                    errs[`qty_${i}`] = "Please enter a valid quantity";
            });
        }

        if (step === 2) {
            if (sameForAll === null)
                errs["mode"] = "Please select a configuration option";
        }

        if (sameForAll === true) {
            if (step === 3) {
                if (!globalSettings.tech)
                    errs["tech"] = "Please select a technology";
                if (!globalSettings.material)
                    errs["material"] = "Please select a material";
                if (globalSettings.tech === "FDM" && !globalSettings.subtype)
                    errs["subtype"] = "Please select a subtype";
                if (!globalSettings.colorMode)
                    errs["colorMode"] = "Please select a color configuration";
                if (globalSettings.colors.length === 0)
                    errs["colors"] = "Please select at least one colour";
            }
            if (step === 4) {
                if (!contact.fullName)
                    errs["fullName"] = "Full name is required";
                if (!contact.email) errs["email"] = "Email is required";
                else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email))
                    errs["email"] = "Please enter a valid email";
                if (!contact.phone) errs["phone"] = "Phone number is required";
                else if (!/^\d{10}$/.test(contact.phone.replace(/[\s\-()]/g, "").replace(/^\+\d{1,3}/, "").replace(/^0/, "")))
                    errs["phone"] = "Please enter a valid 10-digit phone number";
                if (!contact.address) errs["address"] = "Address is required";
            }
        } else if (sameForAll === false) {
            const settingsStartStep = 3;
            const contactStep = 3 + products.length;
            if (step >= settingsStartStep && step < contactStep) {
                const p = products[step - settingsStartStep];
                if (!p.tech) errs["tech"] = "Please select a technology";
                if (!p.material) errs["material"] = "Please select a material";
                if (p.tech === "FDM" && !p.subtype)
                    errs["subtype"] = "Please select a subtype";
                if (!p.colorMode)
                    errs["colorMode"] = "Please select a color configuration";
                if (p.colors.length === 0)
                    errs["colors"] = "Please select at least one colour";
            }
            if (step === contactStep) {
                if (!contact.fullName)
                    errs["fullName"] = "Full name is required";
                if (!contact.email) errs["email"] = "Email is required";
                else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email))
                    errs["email"] = "Please enter a valid email";
                if (!contact.phone) errs["phone"] = "Phone number is required";
                else if (!/^\d{10}$/.test(contact.phone.replace(/[\s\-()]/g, "").replace(/^\+\d{1,3}/, "").replace(/^0/, "")))
                    errs["phone"] = "Please enter a valid 10-digit phone number";
                if (!contact.address) errs["address"] = "Address is required";
            }
        }

        return errs;
    };

    const canGoNext = () => Object.keys(getStepErrors()).length === 0;

    const handleNext = () => {
        const errs = getStepErrors();
        if (Object.keys(errs).length > 0) {
            setStepErrors(errs);
            return;
        }
        setStepErrors({});
        setStep((s) => s + 1);
    };

    const handleSubmit = async () => {
        const errs = getStepErrors();
        if (Object.keys(errs).length > 0) {
            setStepErrors(errs);
            return;
        }
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
        } catch {
            setStepErrors({ submit: "Submission failed. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Step renders ──────────────────────────────────────────────────────────

    const renderWelcome = () => (
        <CardContent className="px-6 py-6 space-y-7">
            {/* Hero */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-100 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    Small Batch Manufacturing
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                        Ready to produce
                        <br />
                        <span className="text-zinc-400">your parts?</span>
                    </h1>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                        This form captures the technical and production details
                        required to evaluate your manufacturing requirements
                        accurately.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated completion time: 5–10 minutes</span>
                </div>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Checklist */}
            <div className="space-y-4">
                <p className="text-sm font-bold text-zinc-800">
                    Please keep the following ready
                </p>
                <ul className="space-y-3">
                    {[
                        {
                            label: "Design files",
                            detail: ".STL · .STEP · .STP · .OBJ · .3MF · .XT",
                            icon: FileText,
                        },
                        {
                            label: "Required quantity",
                            detail: "Batch size per part",
                            icon: Package,
                        },
                        {
                            label: "Material preferences",
                            detail: "Or performance requirements",
                            icon: Layers,
                        },
                        {
                            label: "Delivery timeline",
                            detail: "If applicable",
                            icon: Clock,
                        },
                    ].map(({ label, detail, icon: Icon }) => (
                        <li key={label} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <ChevronRight className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-zinc-800">
                                    {label}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    {detail}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 px-5 py-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-semibold text-zinc-600">
                        Pro tip:
                    </span>{" "}
                    Providing complete details helps us assess feasibility,
                    optimise process selection, and deliver accurate pricing and
                    lead times.
                </p>
            </div>
        </CardContent>
    );

    const renderUpload = () => (
        <CardContent className="space-y-4 px-6 py-5">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-black text-zinc-900">
                        Project Specifications
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Upload files & details for each product
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl text-xs font-bold border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
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
                        className="p-4 border-2 border-zinc-100 rounded-2xl bg-white space-y-4 hover:border-zinc-200 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-zinc-900">
                                Product #{i + 1}
                            </p>
                            {products.length > 1 && (
                                <button
                                    type="button"
                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                    onClick={() =>
                                        setProducts(
                                            products.filter(
                                                (item) => item.id !== p.id,
                                            ),
                                        )
                                    }
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* File upload */}
                        <div className="space-y-1.5">
                            <SectionLabel required>Design File</SectionLabel>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-4 text-center transition-all bg-zinc-50/50 cursor-pointer relative",
                                    stepErrors[`file_${i}`]
                                        ? "border-red-300 bg-red-50/30"
                                        : "border-zinc-200 hover:border-zinc-400",
                                )}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const updated = [...products];
                                        updated[i].file =
                                            e.target.files?.[0] || null;
                                        setProducts(updated);
                                        setStepErrors((prev) => {
                                            const n = { ...prev };
                                            delete n[`file_${i}`];
                                            return n;
                                        });
                                    }}
                                />
                                <UploadCloud className="h-5 w-5 text-zinc-300 mx-auto mb-1" />
                                <p className="text-xs font-semibold text-zinc-600 truncate">
                                    {p.file
                                        ? p.file.name
                                        : "Click to select file"}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                    .STL · .STEP · .OBJ · .3MF
                                </p>
                            </div>
                            <FieldError message={stepErrors[`file_${i}`]} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Quantity */}
                            <div className="space-y-1.5">
                                <SectionLabel required>Quantity</SectionLabel>
                                <Input
                                    type="number"
                                    min="1"
                                    onWheel={preventScrollChange}
                                    className={cn(
                                        "h-10 rounded-xl font-semibold text-sm",
                                        stepErrors[`qty_${i}`] &&
                                            "border-red-400 focus-visible:ring-red-400",
                                    )}
                                    placeholder="Units"
                                    value={p.quantity || ""}
                                    onChange={(e) => {
                                        const n = [...products];
                                        n[i].quantity = e.target.value;
                                        setProducts(n);
                                        setStepErrors((prev) => {
                                            const x = { ...prev };
                                            delete x[`qty_${i}`];
                                            return x;
                                        });
                                    }}
                                />
                                <FieldError message={stepErrors[`qty_${i}`]} />
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                                        Notes
                                    </p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                                            >
                                                <Info className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            side="top"
                                            align="start"
                                            className="w-48 p-3 text-xs shadow-lg rounded-xl border border-zinc-100"
                                        >
                                            <p className="font-black text-zinc-700 mb-1.5 uppercase tracking-wider text-[10px]">
                                                What to include
                                            </p>
                                            <ul className="space-y-1 text-zinc-600 font-medium">
                                                {[
                                                    "Tolerances",
                                                    "Surface finish",
                                                    "Strength requirements",
                                                    "Post-processing needs",
                                                ].map((t) => (
                                                    <li
                                                        key={t}
                                                        className="flex gap-1.5 items-start"
                                                    >
                                                        <span className="text-zinc-400">
                                                            •
                                                        </span>
                                                        {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Textarea
                                    className="rounded-xl border-zinc-200 text-sm font-medium h-[72px] p-2 resize-none"
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
        <CardContent className="space-y-5 px-6 py-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Production Configuration
                </h2>
                <p className="text-sm text-zinc-400 mt-0.5">
                    Do all your parts use the same specifications?
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[
                    {
                        value: true,
                        emoji: "✅",
                        label: "Same specs",
                        desc: "Identical material & colour for all parts",
                    },
                    {
                        value: false,
                        emoji: "🎨",
                        label: "Different specs",
                        desc: "Custom settings per part",
                    },
                ].map(({ value, emoji, label, desc }) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => {
                            setSameForAll(value);
                            setStepErrors({});
                        }}
                        className={cn(
                            "p-4 rounded-2xl border-2 transition-all text-left",
                            sameForAll === value
                                ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/25"
                                : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400",
                        )}
                    >
                        <p className="font-black text-sm mb-1">
                            {emoji} {label}
                        </p>
                        <p
                            className={cn(
                                "text-xs font-medium",
                                sameForAll === value
                                    ? "text-zinc-400"
                                    : "text-zinc-500",
                            )}
                        >
                            {desc}
                        </p>
                    </button>
                ))}
            </div>
            <FieldError message={stepErrors["mode"]} />
        </CardContent>
    );

    const renderProductSettings = (productIndex?: number) => {
        const isGlobalMode = sameForAll === true;
        const settings = isGlobalMode
            ? globalSettings
            : products[productIndex!];
        const setSettings = isGlobalMode
            ? (updates: Partial<ProductSettings>) =>
                  setGlobalSettings((p) => ({ ...p, ...updates }))
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

        const TechButton = ({ t }: { t: string }) => (
            <button
                key={t}
                type="button"
                onClick={() => {
                    setSettings({
                        tech: t,
                        material: "",
                        subtype: "",
                        colorMode: "",
                        colors: [],
                    });
                    setStepErrors((p) => {
                        const n = { ...p };
                        delete n.tech;
                        return n;
                    });
                }}
                className={cn(
                    "h-10 rounded-xl border-2 text-sm font-bold transition-all",
                    settings.tech === t
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                )}
            >
                {t}
            </button>
        );

        const MatButton = ({ m }: { m: string }) => (
            <button
                key={m}
                type="button"
                onClick={() => {
                    setSettings({
                        material: m,
                        subtype: "",
                        colorMode: "",
                        colors: [],
                    });
                    setStepErrors((p) => {
                        const n = { ...p };
                        delete n.material;
                        return n;
                    });
                }}
                className={cn(
                    "h-10 rounded-xl border-2 text-sm font-bold truncate px-2 transition-all",
                    settings.material === m
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                )}
            >
                {m}
            </button>
        );

        return (
            <CardContent className="space-y-5 px-6 py-5">
                <div>
                    <h2 className="text-xl font-black text-zinc-900">
                        {isGlobalMode
                            ? "Production Settings"
                            : `Part #${productIndex! + 1} Settings`}
                    </h2>
                    {!isGlobalMode && products[productIndex!].file && (
                        <p className="text-xs font-medium text-zinc-400 mt-0.5 truncate">
                            {products[productIndex!].file?.name}
                        </p>
                    )}
                </div>

                {/* Technology */}
                <div className="space-y-2">
                    <SectionLabel required>Technology</SectionLabel>
                    <div className="grid grid-cols-3 gap-2">
                        {["FDM", "SLA/DLP", "SLS"].map((t) => (
                            <TechButton key={t} t={t} />
                        ))}
                    </div>
                    <FieldError message={stepErrors["tech"]} />
                </div>

                {/* Material */}
                {settings.tech && (
                    <div className="space-y-2">
                        <SectionLabel required>Material</SectionLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.keys((MATERIALS as any)[settings.tech]).map(
                                (m) => (
                                    <MatButton key={m} m={m} />
                                ),
                            )}
                        </div>
                        <FieldError message={stepErrors["material"]} />
                    </div>
                )}

                {/* Subtype */}
                {settings.material && subtypes.length > 0 && (
                    <div className="space-y-2">
                        <SectionLabel required>Subtype</SectionLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {subtypes.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                        setSettings({
                                            subtype: s,
                                            colorMode: "",
                                            colors: [],
                                        });
                                        setStepErrors((p) => {
                                            const n = { ...p };
                                            delete n.subtype;
                                            return n;
                                        });
                                    }}
                                    className={cn(
                                        "h-10 rounded-xl border-2 text-sm font-bold transition-all",
                                        settings.subtype === s
                                            ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <FieldError message={stepErrors["subtype"]} />
                    </div>
                )}

                {/* Color config */}
                {(settings.subtype ||
                    (settings.tech &&
                        settings.tech !== "FDM" &&
                        settings.material)) && (
                    <div className="space-y-2">
                        <SectionLabel required>
                            Colour Configuration
                        </SectionLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {["single", "multi"].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => {
                                        setSettings({
                                            colorMode: mode as
                                                | "single"
                                                | "multi",
                                            colors: [],
                                        });
                                        setStepErrors((p) => {
                                            const n = { ...p };
                                            delete n.colorMode;
                                            return n;
                                        });
                                    }}
                                    className={cn(
                                        "h-10 rounded-xl border-2 text-sm font-bold transition-all",
                                        settings.colorMode === mode
                                            ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                                    )}
                                >
                                    {mode === "single"
                                        ? "Single Colour"
                                        : "Multi Colour"}
                                </button>
                            ))}
                        </div>
                        <FieldError message={stepErrors["colorMode"]} />

                        {settings.colorMode && (
                            <div className="space-y-2">
                                <div
                                    className={cn(
                                        "flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100",
                                        stepErrors["colors"] &&
                                            "border-red-200",
                                    )}
                                >
                                    {(colorSource || []).map((c: string) => {
                                        const isSelected =
                                            settings.colors.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => {
                                                    const newColors =
                                                        settings.colorMode ===
                                                        "single"
                                                            ? [c]
                                                            : isSelected
                                                              ? settings.colors.filter(
                                                                    (x) =>
                                                                        x !== c,
                                                                )
                                                              : [
                                                                    ...settings.colors,
                                                                    c,
                                                                ];
                                                    setSettings({
                                                        colors: newColors,
                                                    });
                                                    setStepErrors((p) => {
                                                        const n = { ...p };
                                                        delete n.colors;
                                                        return n;
                                                    });
                                                }}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer",
                                                    isSelected
                                                        ? "bg-zinc-900 text-white border-zinc-900 shadow-sm scale-105"
                                                        : "bg-white border-zinc-200 hover:border-zinc-400 text-zinc-700",
                                                )}
                                            >
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>
                                <FieldError message={stepErrors["colors"]} />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        );
    };

    const renderContact = () => (
        <CardContent className="space-y-5 px-6 py-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Customer Details
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    We'll send your quote here
                </p>
            </div>

            <div className="space-y-4">
                {/* Full name */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-zinc-800">
                        Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        className={cn(
                            "h-11 rounded-xl font-medium border-zinc-200 text-sm",
                            stepErrors.fullName &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                        placeholder="John Smith"
                        value={contact.fullName}
                        onChange={(e) => {
                            setContact({
                                ...contact,
                                fullName: e.target.value,
                            });
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.fullName;
                                return n;
                            });
                        }}
                    />
                    <FieldError message={stepErrors.fullName} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-zinc-800">
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        <Input
                            type="email"
                            className={cn(
                                "h-11 pl-10 rounded-xl font-medium border-zinc-200 text-sm",
                                stepErrors.email &&
                                    "border-red-400 focus-visible:ring-red-400",
                            )}
                            placeholder="john@company.com"
                            value={contact.email}
                            onChange={(e) => {
                                setContact({
                                    ...contact,
                                    email: e.target.value,
                                });
                                setStepErrors((p) => {
                                    const n = { ...p };
                                    delete n.email;
                                    return n;
                                });
                            }}
                        />
                    </div>
                    <FieldError message={stepErrors.email} />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-zinc-800">
                        Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        className={cn(
                            "h-11 rounded-xl font-medium border-zinc-200 text-sm",
                            stepErrors.phone &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                        placeholder="+91 ..."
                        value={contact.phone}
                        onChange={(e) => {
                            setContact({ ...contact, phone: e.target.value });
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.phone;
                                return n;
                            });
                        }}
                    />
                    <FieldError message={stepErrors.phone} />
                </div>

                {/* Company */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-zinc-800">
                        Company Name{" "}
                        <span className="text-xs font-normal text-zinc-400">
                            (Optional)
                        </span>
                    </Label>
                    <Input
                        className="h-11 rounded-xl font-medium border-zinc-200 text-sm"
                        placeholder="Your company"
                        value={contact.company}
                        onChange={(e) =>
                            setContact({ ...contact, company: e.target.value })
                        }
                    />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-zinc-800">
                        Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        className={cn(
                            "rounded-xl min-h-[80px] border-zinc-200 font-medium text-sm p-3 resize-none",
                            stepErrors.address &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                        placeholder="Street, City, State / Province, ZIP / Postal Code, Country"
                        value={contact.address}
                        onChange={(e) => {
                            setContact({ ...contact, address: e.target.value });
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.address;
                                return n;
                            });
                        }}
                    />
                    <FieldError message={stepErrors.address} />
                </div>
            </div>
        </CardContent>
    );

    const SummaryRow = ({
        label,
        value,
    }: {
        label: string;
        value?: string | null;
    }) => {
        if (!value) return null;
        return (
            <div className="flex justify-between items-start gap-4 py-2.5 border-b border-zinc-100 last:border-0">
                <span className="text-xs text-zinc-400 flex-shrink-0 w-24">
                    {label}
                </span>
                <span className="text-xs font-semibold text-zinc-700 text-right break-all">
                    {value}
                </span>
            </div>
        );
    };

    const renderReview = () => (
        <CardContent className="space-y-5 px-6 py-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">Summary</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Review before submitting
                </p>
            </div>

            <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                {products.map((p, i) => {
                    const specs = {
                        tech: sameForAll ? globalSettings.tech : p.tech,
                        material: sameForAll
                            ? globalSettings.material
                            : p.material,
                        subtype: sameForAll
                            ? globalSettings.subtype
                            : p.subtype,
                        colors: (sameForAll
                            ? globalSettings.colors
                            : p.colors
                        ).join(", "),
                        colorMode: sameForAll
                            ? globalSettings.colorMode
                            : p.colorMode,
                    };
                    return (
                        <div
                            key={p.id}
                            className="rounded-xl border-2 border-zinc-100 p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Product #{i + 1}
                                </p>
                                <span className="bg-zinc-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                    ×{p.quantity} Units
                                </span>
                            </div>
                            <SummaryRow label="File" value={p.file?.name} />
                            <SummaryRow label="Technology" value={specs.tech} />
                            <SummaryRow
                                label="Material"
                                value={specs.material}
                            />
                            {specs.subtype && (
                                <SummaryRow
                                    label="Subtype"
                                    value={specs.subtype}
                                />
                            )}
                            <SummaryRow
                                label="Colour Mode"
                                value={
                                    specs.colorMode === "single"
                                        ? "Single Colour"
                                        : specs.colorMode === "multi"
                                          ? "Multi Colour"
                                          : undefined
                                }
                            />
                            <SummaryRow label="Colours" value={specs.colors} />
                            {p.notes && (
                                <SummaryRow label="Notes" value={p.notes} />
                            )}
                        </div>
                    );
                })}

                {/* Contact section */}
                <div className="rounded-xl border-2 border-zinc-100 p-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Contact
                    </p>
                    <SummaryRow label="Name" value={contact.fullName} />
                    <SummaryRow label="Email" value={contact.email} />
                    <SummaryRow label="Phone" value={contact.phone} />
                    <SummaryRow label="Address" value={contact.address} />
                    {contact.company && (
                        <SummaryRow label="Company" value={contact.company} />
                    )}
                </div>
            </div>

            {stepErrors.submit && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {stepErrors.submit}
                </p>
            )}
        </CardContent>
    );

    const renderThankYou = () => (
        <CardContent className="px-6 py-6 space-y-6">
            <div className="text-center space-y-3 pb-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 leading-tight">
                    Request Submitted
                    <br />
                    Successfully
                </h2>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    A confirmation email has been sent to{" "}
                    <span className="font-semibold text-zinc-700">
                        {contact.email}
                    </span>
                    . Please check your inbox and spam folder if necessary.
                </p>
            </div>

            <div className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-5 space-y-3">
                <p className="text-sm font-bold text-zinc-800">
                    What Happens Next?
                </p>
                <p className="text-xs text-zinc-500">
                    Our engineering team will now:
                </p>
                <ul className="space-y-2">
                    {[
                        "Review your design files",
                        "Validate material and process selection",
                        "Assess manufacturability",
                        "Prepare a detailed quotation with estimated lead time",
                    ].map((item, idx) => (
                        <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-zinc-600"
                        >
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
                    <Clock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <p className="text-xs text-zinc-400">
                        Expected response:{" "}
                        <span className="font-semibold text-zinc-600">
                            within 12–24 business hours
                        </span>
                    </p>
                </div>
            </div>

            <div className="rounded-2xl bg-zinc-900 text-white p-5 space-y-2">
                <p className="text-sm font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Urgent Project?
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    For time-sensitive requirements, contact us directly:
                </p>
                <a
                    href="mailto:supplychain@scribbl3d.com"
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1.5"
                >
                    <Mail className="w-3.5 h-3.5" />
                    supplychain@scribbl3d.com
                </a>
            </div>

            {onSubmit && (
                <Button
                    type="button"
                    onClick={onSubmit}
                    className="w-full h-11 text-sm font-semibold bg-zinc-900 hover:bg-zinc-700 rounded-xl"
                >
                    Close
                </Button>
            )}
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
            if (step >= settingsStartStep && step < contactStep)
                return renderProductSettings(step - settingsStartStep);
            if (step === contactStep) return renderContact();
            if (step === reviewStep) return renderReview();
        }
    };

    const totalSteps = getTotalSteps();
    const isLastStep = step === totalSteps - 1;

    if (success) {
        return (
            <div className="rounded-2xl border border-zinc-100 bg-white overflow-hidden shadow-sm">
                {renderThankYou()}
            </div>
        );
    }

    // Progress bar segments
    const progressPct =
        step === 0 ? 0 : Math.round((step / (totalSteps - 1)) * 100);

    return (
        <div className="w-full">
            <Card className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm w-full">
                {/* Progress bar */}
                <div className="h-1 bg-zinc-100 w-full">
                    <div
                        className="h-full bg-zinc-900 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                <div>{renderStep()}</div>

                <CardFooter className="flex justify-between bg-zinc-50/70 px-6 py-3 border-t border-zinc-100 gap-2">
                    <Button
                        variant="outline"
                        className="font-semibold text-sm text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700 rounded-xl h-11 px-6"
                        onClick={back}
                        disabled={step === 0}
                    >
                        Back
                    </Button>

                    <Button
                        className="h-11 px-8 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-700 text-white ml-auto transition-all"
                        onClick={isLastStep ? handleSubmit : handleNext}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : isLastStep ? (
                            "Submit Request"
                        ) : (
                            <>
                                Continue
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
