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
    Info,
    Loader2,
    Mail,
    MapPin,
    Phone,
    UploadCloud,
    Zap,
} from "lucide-react";
import { useCallback, useState } from "react";

/* -------------------------------------------------------------------------- */
/* CONFIG & TYPES                                                               */
/* -------------------------------------------------------------------------- */

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
} as const;

interface FormState {
    projectType: "prototype" | "batch" | "";
    technology: string;
    material: string;
    subtype: string;
    colorMode: "single" | "multi" | "";
    colors: string[];
    files: File[];
    notes: string;
    quantityType: "single" | "batch" | "";
    quantityNumber: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    address: string;
}

/* -------------------------------------------------------------------------- */
/* SHARED UI ATOMS                                                              */
/* -------------------------------------------------------------------------- */

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
    optional = false,
}: {
    children: React.ReactNode;
    required?: boolean;
    optional?: boolean;
}) {
    return (
        <div className="flex items-center gap-1.5 mb-1.5">
            <Label className="text-sm font-semibold text-zinc-800">
                {children}
                {required && <span className="ml-1 text-red-500">*</span>}
                {optional && (
                    <span className="ml-1.5 text-xs font-normal text-zinc-400">
                        (Optional)
                    </span>
                )}
            </Label>
        </div>
    );
}

// Selection card — no grey hover, uses zinc-900 active state
function SelectCard({
    selected,
    onClick,
    children,
    hasError,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    hasError?: boolean;
}) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 select-none",
                selected
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : hasError
                      ? "border-red-300 bg-red-50/30 hover:border-red-400"
                      : "border-zinc-200 bg-white hover:border-zinc-400",
            )}
        >
            <div
                className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5",
                    selected
                        ? "border-zinc-900 bg-zinc-900"
                        : "border-zinc-300",
                )}
            >
                {selected && <ChevronRight className="w-3 h-3 text-white" />}
            </div>
            <div className="flex-1 text-left">{children}</div>
        </div>
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

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                               */
/* -------------------------------------------------------------------------- */

export default function PrototypingRequestForm() {
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState<FormState>({
        projectType: "",
        technology: "",
        material: "",
        subtype: "",
        colorMode: "",
        colors: [],
        files: [],
        notes: "",
        quantityType: "",
        quantityNumber: "",
        fullName: "",
        email: "",
        phone: "",
        company: "",
        address: "",
    });

    const totalSteps = 8;
    const isBatch = form.projectType === "batch";

    // Prevent trackpad scroll from changing number inputs
    const preventScrollChange = useCallback(
        (e: React.WheelEvent<HTMLInputElement>) => {
            e.currentTarget.blur();
        },
        [],
    );

    const getStepErrors = (): Record<string, string> => {
        const errs: Record<string, string> = {};
        const flow = isBatch
            ? [
                  "intro",
                  "type",
                  "files",
                  "tech",
                  "mat",
                  "details",
                  "contact",
                  "review",
              ]
            : [
                  "intro",
                  "type",
                  "tech",
                  "mat",
                  "details",
                  "files",
                  "contact",
                  "review",
              ];
        const current = flow[step];

        if (current === "type" && !form.projectType)
            errs.projectType = "Please select a project type";
        if (current === "tech" && !form.technology)
            errs.technology = "Please select a technology";
        if (current === "mat" && !form.material)
            errs.material = "Please select a material";
        if (current === "details") {
            if (!form.colorMode)
                errs.colorMode = "Please select a colour configuration";
            if (form.colors.length === 0)
                errs.colors = "Please select at least one colour";
        }
        if (current === "files") {
            if (form.files.length === 0)
                errs.files = "Please upload at least one design file";
            if (!form.quantityType)
                errs.quantityType = "Please select a quantity option";
            if (form.quantityType === "batch" && !form.quantityNumber)
                errs.quantityNumber = "Please enter a quantity";
        }
        if (current === "contact") {
            if (!form.fullName) errs.fullName = "Full name is required";
            if (!form.email) errs.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(form.email))
                errs.email = "Please enter a valid email";
            if (!form.phone) errs.phone = "Phone number is required";
            if (!form.address) errs.address = "Address is required";
        }
        return errs;
    };

    const next = () => {
        if (step === 0) {
            setStep(1);
            return;
        }
        const errs = getStepErrors();
        if (Object.keys(errs).length > 0) {
            setStepErrors(errs);
            return;
        }
        setStepErrors({});
        setStep((s) => s + 1);
    };
    const back = () => {
        setStepErrors({});
        setStep((s) => Math.max(s - 1, 0));
    };

    const toggleColor = (color: string) => {
        setForm((p) => {
            if (p.colorMode === "single") return { ...p, colors: [color] };
            return {
                ...p,
                colors: p.colors.includes(color)
                    ? p.colors.filter((c) => c !== color)
                    : [...p.colors, color],
            };
        });
        setStepErrors((p) => {
            const n = { ...p };
            delete n.colors;
            return n;
        });
    };

    const handleSubmit = async () => {
        const errs = getStepErrors();
        if (Object.keys(errs).length > 0) {
            setStepErrors(errs);
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (k === "files")
                    form.files.forEach((f) => fd.append("files", f));
                else if (k === "colors") fd.append(k, JSON.stringify(v));
                else if (k === "quantityNumber")
                    fd.append(
                        k,
                        form.quantityType === "single"
                            ? "1"
                            : form.quantityNumber,
                    );
                else fd.append(k, String(v ?? ""));
            });
            const res = await fetch("/api/prototyping-request", {
                method: "POST",
                body: fd,
            });
            if (!res.ok) throw new Error();
            setSuccess(true);
        } catch {
            setStepErrors({ submit: "Submission failed. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /* STEP RENDERERS                                                               */
    /* -------------------------------------------------------------------------- */

    const renderIntro = () => (
        <CardContent className="px-6 py-6 space-y-7">
            {/* Hero */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-100 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    3D Prototyping Request
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                        Bring your idea
                        <br />
                        <span className="text-zinc-400">to life in 3D.</span>
                    </h1>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                        Provide your technical specifications below. This helps
                        us deliver accurate quotations and high-quality prints.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated completion time: 5–8 minutes</span>
                </div>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="space-y-4">
                <p className="text-sm font-bold text-zinc-800">
                    Please keep the following ready
                </p>
                <ul className="space-y-3">
                    {[
                        {
                            label: "Project overview",
                            detail: "What you need and why",
                        },
                        {
                            label: "Preferred technology",
                            detail: "FDM, SLA/DLP, or SLS",
                        },
                        {
                            label: "Material requirements",
                            detail: "Or performance needs",
                        },
                        {
                            label: "Colour preferences",
                            detail: "Single or multi-colour",
                        },
                        {
                            label: "Design files",
                            detail: ".STL · .STEP · .STP · .OBJ · .3MF",
                        },
                    ].map(({ label, detail }) => (
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
                    Providing detailed information reduces revisions and speeds
                    up your project turnaround significantly.
                </p>
            </div>
        </CardContent>
    );

    const renderProjectType = () => (
        <CardContent className="px-6 py-5 space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Project Type
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    What kind of production do you need?
                </p>
            </div>
            <div className="space-y-2">
                <SelectCard
                    selected={form.projectType === "prototype"}
                    onClick={() => {
                        setForm({ ...form, projectType: "prototype" });
                        setStepErrors({});
                    }}
                    hasError={!!stepErrors.projectType}
                >
                    <p className="text-sm font-bold text-zinc-800">
                        Functional Prototype
                    </p>
                    <p className="text-xs text-zinc-500 font-normal mt-0.5">
                        Single or small test batch
                    </p>
                </SelectCard>
                <SelectCard
                    selected={form.projectType === "batch"}
                    onClick={() => {
                        setForm({ ...form, projectType: "batch" });
                        setStepErrors({});
                    }}
                    hasError={!!stepErrors.projectType}
                >
                    <p className="text-sm font-bold text-zinc-800">
                        Low-Volume Production
                    </p>
                    <p className="text-xs text-zinc-500 font-normal mt-0.5">
                        Batch manufacturing for pilots
                    </p>
                </SelectCard>
            </div>
            <FieldError message={stepErrors.projectType} />
        </CardContent>
    );

    const renderTechnology = () => (
        <CardContent className="px-6 py-5 space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">Technology</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Select your preferred printing method
                </p>
            </div>
            <div className="space-y-2">
                {[
                    {
                        id: "FDM",
                        title: "FDM (Filament Based)",
                        desc: "Thermoplastic filaments — cost-effective for most parts",
                        info: {
                            head: "Strong · Affordable",
                            points: [
                                "Best for functional parts",
                                "Wide material options",
                                "Visible layer lines",
                            ],
                        },
                    },
                    {
                        id: "SLA/DLP",
                        title: "SLA/DLP (Resin Based)",
                        desc: "High-detail liquid resin — smooth surface finish",
                        info: {
                            head: "High Detail · Smooth",
                            points: [
                                "Excellent surface quality",
                                "Ideal for jewellery",
                                "High accuracy",
                            ],
                        },
                    },
                    {
                        id: "SLS",
                        title: "SLS (Powder Based)",
                        desc: "Strong functional parts — no support structures needed",
                        info: {
                            head: "Industrial · Durable",
                            points: [
                                "Strong end-use parts",
                                "No supports needed",
                                "Complex geometries",
                            ],
                        },
                    },
                ].map((t) => (
                    <div
                        key={t.id}
                        onClick={() => {
                            setForm({
                                ...form,
                                technology: t.id,
                                material: "",
                                subtype: "",
                                colors: [],
                            });
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.technology;
                                return n;
                            });
                        }}
                        className={cn(
                            "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 select-none",
                            form.technology === t.id
                                ? "border-zinc-900 bg-zinc-50 shadow-sm"
                                : stepErrors.technology
                                  ? "border-red-300 bg-red-50/30 hover:border-red-400"
                                  : "border-zinc-200 bg-white hover:border-zinc-400",
                        )}
                    >
                        <div
                            className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5",
                                form.technology === t.id
                                    ? "border-zinc-900 bg-zinc-900"
                                    : "border-zinc-300",
                            )}
                        >
                            {form.technology === t.id && (
                                <ChevronRight className="w-3 h-3 text-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-zinc-800">
                                {t.title}
                            </p>
                            <p className="text-xs text-zinc-500 font-normal mt-0.5">
                                {t.desc}
                            </p>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center flex-shrink-0 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Info className="h-3.5 w-3.5 text-zinc-600" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                className="w-56 p-4 bg-zinc-900 text-white rounded-xl border-none shadow-2xl"
                            >
                                <p className="font-bold text-xs mb-2 text-zinc-400 uppercase tracking-wider">
                                    {t.info.head}
                                </p>
                                <ul className="text-xs space-y-1.5">
                                    {t.info.points.map((pt, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2"
                                        >
                                            <span className="text-zinc-500 mt-0.5">
                                                •
                                            </span>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </PopoverContent>
                        </Popover>
                    </div>
                ))}
            </div>
            <FieldError message={stepErrors.technology} />
        </CardContent>
    );

    const renderMaterial = () => (
        <CardContent className="px-6 py-5 space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">Material</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Select the material for your print
                </p>
            </div>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    {Object.keys((MATERIALS as any)[form.technology] || {}).map(
                        (m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => {
                                    setForm({
                                        ...form,
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
                                    "h-11 rounded-xl border-2 text-sm font-bold transition-all",
                                    form.material === m
                                        ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                                        : stepErrors.material
                                          ? "border-red-300 bg-red-50/20 text-zinc-700 hover:border-red-400"
                                          : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                                )}
                            >
                                {m}
                            </button>
                        ),
                    )}
                </div>
            </div>
            <FieldError message={stepErrors.material} />
        </CardContent>
    );

    const renderSubtypeColor = () => {
        const isFDM = form.technology === "FDM";
        const subtypes = isFDM
            ? Object.keys((MATERIALS.FDM as any)?.[form.material] || {})
            : [];
        const colors = isFDM
            ? (MATERIALS.FDM as any)?.[form.material]?.[form.subtype]
            : (MATERIALS as any)?.[form.technology]?.[form.material];

        return (
            <CardContent className="px-6 py-5 space-y-6">
                <div>
                    <h2 className="text-xl font-black text-zinc-900">
                        Colour & Details
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Choose subtype and colour configuration
                    </p>
                </div>

                {isFDM && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                            Material Subtype
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {subtypes.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() =>
                                        setForm({
                                            ...form,
                                            subtype: s,
                                            colorMode: "",
                                            colors: [],
                                        })
                                    }
                                    className={cn(
                                        "h-11 rounded-xl border-2 text-sm font-bold transition-all",
                                        form.subtype === s
                                            ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                        Colour Configuration
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {["single", "multi"].map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                    setForm({
                                        ...form,
                                        colorMode: mode as "single" | "multi",
                                        colors: [],
                                    });
                                    setStepErrors((p) => {
                                        const n = { ...p };
                                        delete n.colorMode;
                                        return n;
                                    });
                                }}
                                className={cn(
                                    "h-11 rounded-xl border-2 text-sm font-bold transition-all",
                                    form.colorMode === mode
                                        ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-900/20"
                                        : stepErrors.colorMode
                                          ? "border-red-300 bg-red-50/20 text-zinc-700 hover:border-red-400"
                                          : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400",
                                )}
                            >
                                {mode === "single"
                                    ? "Single Colour"
                                    : "Multi Colour"}
                            </button>
                        ))}
                    </div>
                    <FieldError message={stepErrors.colorMode} />

                    {form.colorMode && (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100">
                                {(colors || []).map((c: string) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => toggleColor(c)}
                                        className={cn(
                                            "px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all",
                                            form.colors.includes(c)
                                                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm scale-105"
                                                : "bg-white border-zinc-200 hover:border-zinc-400 text-zinc-700",
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                            <FieldError message={stepErrors.colors} />
                        </div>
                    )}
                </div>
            </CardContent>
        );
    };

    const renderAdditionalInfo = () => (
        <CardContent className="px-6 py-5 space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Files & Quantity
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Upload your design files and set quantity
                </p>
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
                <SectionLabel required>Design Files</SectionLabel>
                <div
                    className={cn(
                        "border-2 border-dashed rounded-xl p-5 text-center transition-all bg-zinc-50/50 cursor-pointer relative",
                        stepErrors.files
                            ? "border-red-300 bg-red-50/30"
                            : "border-zinc-200 hover:border-zinc-400",
                    )}
                >
                    <input
                        type="file"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                            setForm((p) => ({
                                ...p,
                                files: Array.from(e.target.files!),
                            }));
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.files;
                                return n;
                            });
                        }}
                    />
                    <UploadCloud className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-zinc-600">
                        {form.files.length > 0
                            ? `${form.files.length} file${form.files.length > 1 ? "s" : ""} selected`
                            : "Click to select files"}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        .STL · .STEP · .OBJ · .3MF
                    </p>
                </div>
                <FieldError message={stepErrors.files} />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
                <SectionLabel required>Quantity</SectionLabel>
                <div className="space-y-2">
                    <SelectCard
                        selected={form.quantityType === "single"}
                        onClick={() => {
                            setForm({
                                ...form,
                                quantityType: "single",
                                quantityNumber: "1",
                            });
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.quantityType;
                                return n;
                            });
                        }}
                        hasError={!!stepErrors.quantityType}
                    >
                        <p className="text-sm font-bold text-zinc-800">
                            Single Unit (1)
                        </p>
                    </SelectCard>
                    <SelectCard
                        selected={form.quantityType === "batch"}
                        onClick={() => {
                            setForm({
                                ...form,
                                quantityType: "batch",
                                quantityNumber: "",
                            });
                            setStepErrors((p) => {
                                const n = { ...p };
                                delete n.quantityType;
                                return n;
                            });
                        }}
                        hasError={!!stepErrors.quantityType}
                    >
                        <p className="text-sm font-bold text-zinc-800">
                            Multiple Units
                        </p>
                    </SelectCard>
                </div>
                <FieldError message={stepErrors.quantityType} />

                {form.quantityType === "batch" && (
                    <div className="space-y-1.5 pt-1">
                        <Input
                            type="number"
                            min="2"
                            onWheel={preventScrollChange}
                            className={cn(
                                "h-11 rounded-xl border-zinc-200 text-sm",
                                stepErrors.quantityNumber &&
                                    "border-red-400 focus-visible:ring-red-400",
                            )}
                            value={form.quantityNumber}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    quantityNumber: e.target.value,
                                });
                                setStepErrors((p) => {
                                    const n = { ...p };
                                    delete n.quantityNumber;
                                    return n;
                                });
                            }}
                            placeholder="Enter quantity..."
                        />
                        <FieldError message={stepErrors.quantityNumber} />
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <SectionLabel optional>Notes</SectionLabel>
                <Textarea
                    className="rounded-xl min-h-[90px] border-zinc-200 text-sm resize-none"
                    value={form.notes}
                    onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Surface finish, deadlines, special requirements..."
                />
            </div>
        </CardContent>
    );

    const renderContact = () => (
        <CardContent className="px-6 py-5 space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Customer Details
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    We'll send your quote here
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="col-span-2 space-y-1.5">
                        <Label className="text-sm font-semibold text-zinc-800">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            className={cn(
                                "h-11 rounded-xl border-zinc-200 text-sm",
                                stepErrors.fullName &&
                                    "border-red-400 focus-visible:ring-red-400",
                            )}
                            placeholder="John Smith"
                            value={form.fullName}
                            onChange={(e) => {
                                setForm({ ...form, fullName: e.target.value });
                                setStepErrors((p) => {
                                    const n = { ...p };
                                    delete n.fullName;
                                    return n;
                                });
                            }}
                        />
                        <FieldError message={stepErrors.fullName} />
                    </div>
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
                                "h-11 pl-10 rounded-xl border-zinc-200 text-sm",
                                stepErrors.email &&
                                    "border-red-400 focus-visible:ring-red-400",
                            )}
                            placeholder="john@company.com"
                            value={form.email}
                            onChange={(e) => {
                                setForm({ ...form, email: e.target.value });
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
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        <Input
                            className={cn(
                                "h-11 pl-10 rounded-xl border-zinc-200 text-sm",
                                stepErrors.phone &&
                                    "border-red-400 focus-visible:ring-red-400",
                            )}
                            placeholder="+91 ..."
                            value={form.phone}
                            onChange={(e) => {
                                setForm({ ...form, phone: e.target.value });
                                setStepErrors((p) => {
                                    const n = { ...p };
                                    delete n.phone;
                                    return n;
                                });
                            }}
                        />
                    </div>
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
                        className="h-11 rounded-xl border-zinc-200 text-sm"
                        placeholder="Your company"
                        value={form.company}
                        onChange={(e) =>
                            setForm({ ...form, company: e.target.value })
                        }
                    />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-zinc-800">
                        Shipping Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                        <Textarea
                            className={cn(
                                "pl-10 rounded-xl min-h-[80px] border-zinc-200 text-sm resize-none",
                                stepErrors.address &&
                                    "border-red-400 focus-visible:ring-red-400",
                            )}
                            placeholder="Street, City, State / Province, ZIP / Postal Code, Country"
                            value={form.address}
                            onChange={(e) => {
                                setForm({ ...form, address: e.target.value });
                                setStepErrors((p) => {
                                    const n = { ...p };
                                    delete n.address;
                                    return n;
                                });
                            }}
                        />
                    </div>
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
                <span className="text-xs text-zinc-400 flex-shrink-0 w-28">
                    {label}
                </span>
                <span className="text-xs font-semibold text-zinc-700 text-right break-all">
                    {value}
                </span>
            </div>
        );
    };

    const renderReview = () => (
        <CardContent className="px-6 py-5 space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">Summary</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Review before submitting
                </p>
            </div>

            <div className="space-y-3">
                {/* Project */}
                <div className="rounded-xl border-2 border-zinc-100 p-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Project
                    </p>
                    <SummaryRow
                        label="Type"
                        value={
                            form.projectType === "prototype"
                                ? "Functional Prototype"
                                : "Low-Volume Production"
                        }
                    />
                    <SummaryRow
                        label="Quantity"
                        value={
                            form.quantityType === "single"
                                ? "1 unit"
                                : `${form.quantityNumber} units`
                        }
                    />
                    <SummaryRow
                        label="Files"
                        value={
                            form.files.length > 0
                                ? `${form.files.length} file${form.files.length > 1 ? "s" : ""} uploaded`
                                : undefined
                        }
                    />
                    {form.notes && (
                        <SummaryRow label="Notes" value={form.notes} />
                    )}
                </div>

                {/* Tech & Material */}
                <div className="rounded-xl border-2 border-zinc-100 p-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Tech & Material
                    </p>
                    <SummaryRow label="Technology" value={form.technology} />
                    <SummaryRow label="Material" value={form.material} />
                    {form.subtype && (
                        <SummaryRow label="Subtype" value={form.subtype} />
                    )}
                    <SummaryRow
                        label="Colour Mode"
                        value={
                            form.colorMode === "single"
                                ? "Single Colour"
                                : form.colorMode === "multi"
                                  ? "Multi Colour"
                                  : undefined
                        }
                    />
                    {form.colors.length > 0 && (
                        <SummaryRow
                            label="Colours"
                            value={form.colors.join(", ")}
                        />
                    )}
                </div>

                {/* Contact */}
                <div className="rounded-xl border-2 border-zinc-100 p-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                        Contact
                    </p>
                    <SummaryRow label="Name" value={form.fullName} />
                    <SummaryRow label="Email" value={form.email} />
                    <SummaryRow label="Phone" value={form.phone} />
                    <SummaryRow label="Address" value={form.address} />
                    {form.company && (
                        <SummaryRow label="Company" value={form.company} />
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

    const flow = isBatch
        ? [
              renderIntro,
              renderProjectType,
              renderAdditionalInfo,
              renderTechnology,
              renderMaterial,
              renderSubtypeColor,
              renderContact,
              renderReview,
          ]
        : [
              renderIntro,
              renderProjectType,
              renderTechnology,
              renderMaterial,
              renderSubtypeColor,
              renderAdditionalInfo,
              renderContact,
              renderReview,
          ];

    /* -------------------------------------------------------------------------- */
    /* SUCCESS                                                                     */
    /* -------------------------------------------------------------------------- */

    if (success)
        return (
            <div className="max-w-xl mx-auto p-4 md:p-6">
                <Card className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <CardContent className="px-6 py-8 space-y-6">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto ring-4 ring-emerald-50">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 leading-tight">
                                Request Submitted
                                <br />
                                Successfully
                            </h2>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Thank you! We'll review your project and email
                                you a quote shortly.
                            </p>
                        </div>

                        <div className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-5 space-y-3">
                            <p className="text-sm font-bold text-zinc-800">
                                What Happens Next?
                            </p>
                            <ul className="space-y-2">
                                {[
                                    "Review your design files",
                                    "Validate material and process selection",
                                    "Prepare a detailed quotation",
                                ].map((item, i) => (
                                    <li
                                        key={i}
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
                            <a
                                href="mailto:supplychain@scribbl3d.com"
                                className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1.5"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                supplychain@scribbl3d.com
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );

    /* -------------------------------------------------------------------------- */
    /* MAIN RENDER                                                                  */
    /* -------------------------------------------------------------------------- */

    const progressPct =
        step === 0 ? 0 : Math.round((step / (totalSteps - 1)) * 100);

    return (
        <div className="max-w-xl mx-auto p-4 md:p-6">
            <Card className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                {/* Progress bar */}
                <div className="h-1 bg-zinc-100 w-full">
                    <div
                        className="h-full bg-zinc-900 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                {flow[step]()}

                <CardFooter className="flex justify-between bg-zinc-50/70 px-6 py-3 border-t border-zinc-100 gap-2">
                    {step > 0 ? (
                        <Button
                            variant="outline"
                            onClick={back}
                            className="font-semibold text-sm text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-700 rounded-xl h-11 px-6"
                        >
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button
                        onClick={step === totalSteps - 1 ? handleSubmit : next}
                        disabled={submitting}
                        className="h-11 px-8 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-700 text-white ml-auto transition-all"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : step === totalSteps - 1 ? (
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
