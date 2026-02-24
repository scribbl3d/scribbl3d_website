"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    Check,
    CheckCircle2,
    FileText,
    Info,
    Layers,
    Package,
    Palette,
    Settings,
} from "lucide-react";
import { useState } from "react";

/* -------------------------------------------------------------------------- */
/* CONFIG & TYPES */
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
};

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
    address: string; // Added field
}

/* -------------------------------------------------------------------------- */
/* CUSTOM SELECTABLE ITEM */
/* -------------------------------------------------------------------------- */

const SelectableBox = ({ selected, onClick, children, className }: any) => (
    <div
        onClick={onClick}
        className={cn(
            "group flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all duration-200",
            selected
                ? "border-black bg-gray-50 ring-1 ring-black shadow-sm"
                : "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50/50",
            className,
        )}
    >
        <div
            className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                selected
                    ? "border-black bg-black text-white"
                    : "border-gray-300 group-hover:border-gray-400",
            )}
        >
            {selected && <Check className="h-4 w-4 stroke-[3]" />}
        </div>
        <div className="flex-1 text-left">{children}</div>
    </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------------------------------------------------- */

export default function PrototypingRequestForm() {
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

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
        address: "", // Initialized field
    });

    const totalSteps = 8;
    const isBatch = form.projectType === "batch";

    const canGoNext = () => {
        if (step === 0) return true;
        if (step === 1) return form.projectType !== "";
        // Updated validation to include address
        if (step === 6)
            return (
                !!form.fullName &&
                !!form.email &&
                !!form.phone &&
                !!form.address
            );

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

        if (current === "tech") return form.technology !== "";
        if (current === "mat") return form.material !== "";
        if (current === "details")
            return form.colorMode !== "" && form.colors.length > 0;
        if (current === "files") {
            const hasFiles = form.files.length > 0;
            const hasQty =
                form.quantityType === "single" ||
                (form.quantityType === "batch" && form.quantityNumber !== "");
            return hasFiles && hasQty;
        }
        return true;
    };

    const next = () => {
        if (canGoNext()) setStep((s) => s + 1);
    };
    const back = () => setStep((s) => Math.max(s - 1, 0));

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
    };

    const handleSubmit = async () => {
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
            alert("Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /* STEP RENDERERS */
    /* -------------------------------------------------------------------------- */

    const renderIntro = () => (
        <div className="animate-in fade-in duration-500">
            <CardHeader className="space-y-4">
                <div className="h-12 w-12 bg-black/5 rounded-full flex items-center justify-center">
                    <Settings className="text-black h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">
                    3D Prototyping Request Form
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600">
                    Provide your technical specifications below. This
                    information helps us deliver accurate quotations and
                    high-quality prints.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Checklist:
                    </p>
                    <ul className="space-y-3">
                        {[
                            { icon: FileText, text: "Project overview" },
                            { icon: Settings, text: "Preferred technology" },
                            { icon: Layers, text: "Material requirements" },
                            { icon: Palette, text: "Color preferences" },
                            { icon: Package, text: "Design files (STL/STEP)" },
                        ].map((item, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-3 text-[13px] text-gray-700"
                            >
                                <item.icon className="h-4 w-4 text-black shrink-0" />
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </div>
    );

    const renderProjectType = () => (
        <CardContent className="pt-8 space-y-6">
            <CardTitle className="text-xl font-bold">Project Type *</CardTitle>
            <div className="grid gap-3">
                <SelectableBox
                    selected={form.projectType === "prototype"}
                    onClick={() =>
                        setForm({ ...form, projectType: "prototype" })
                    }
                >
                    <p className="text-sm font-bold">Functional Prototype</p>
                    <p className="text-[12px] text-gray-500">
                        Single or small test batch.
                    </p>
                </SelectableBox>
                <SelectableBox
                    selected={form.projectType === "batch"}
                    onClick={() => setForm({ ...form, projectType: "batch" })}
                >
                    <p className="text-sm font-bold">Low-Volume Production</p>
                    <p className="text-[12px] text-gray-500">
                        Batch manufacturing for pilots.
                    </p>
                </SelectableBox>
            </div>
        </CardContent>
    );

    const renderTechnology = () => (
        <CardContent className="pt-8 space-y-6">
            <CardTitle className="text-xl font-bold">Technology *</CardTitle>
            <div className="grid gap-3">
                {[
                    {
                        id: "FDM",
                        title: "FDM (Filament Printing)",
                        head: "Strong • Affordable",
                        info: [
                            "Best for functional parts",
                            "Wide material options",
                            "Visible layer lines",
                        ],
                    },
                    {
                        id: "SLA/DLP",
                        title: "SLA / DLP (Resin)",
                        head: "High Detail • Smooth",
                        info: [
                            "Excellent surface quality",
                            "Ideal for jewelry",
                            "High accuracy",
                        ],
                    },
                    {
                        id: "SLS",
                        title: "SLS (Powder)",
                        head: "Industrial • Durable",
                        info: [
                            "Strong end-use parts",
                            "No supports needed",
                            "Complex geometries",
                        ],
                    },
                ].map((t) => (
                    <SelectableBox
                        key={t.id}
                        selected={form.technology === t.id}
                        onClick={() =>
                            setForm({
                                ...form,
                                technology: t.id,
                                material: "",
                                subtype: "",
                                colors: [],
                            })
                        }
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold">{t.title}</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Info className="h-4 w-4 text-black" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    side="top"
                                    className="w-64 p-4 bg-black text-white rounded-xl border-none shadow-2xl"
                                >
                                    <p className="font-bold text-xs mb-2 text-gray-400">
                                        {t.head}
                                    </p>
                                    <ul className="text-[11px] space-y-1.5 list-disc pl-4">
                                        {t.info.map((line, idx) => (
                                            <li key={idx}>{line}</li>
                                        ))}
                                    </ul>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </SelectableBox>
                ))}
            </div>
        </CardContent>
    );

    const renderMaterial = () => (
        <CardContent className="pt-8 space-y-6">
            <CardTitle className="text-xl font-bold">Material *</CardTitle>
            <div className="grid grid-cols-2 gap-3">
                {Object.keys(MATERIALS[form.technology] || {}).map((m) => (
                    <Button
                        key={m}
                        type="button"
                        variant={form.material === m ? "default" : "outline"}
                        className={cn(
                            "h-12 font-bold rounded-xl",
                            form.material === m
                                ? "bg-black text-white"
                                : "border-gray-200",
                        )}
                        onClick={() =>
                            setForm({
                                ...form,
                                material: m,
                                subtype: "",
                                colorMode: "",
                                colors: [],
                            })
                        }
                    >
                        {m}
                    </Button>
                ))}
            </div>
        </CardContent>
    );

    const renderSubtypeColor = () => {
        const isFDM = form.technology === "FDM";
        const subtypes = isFDM
            ? Object.keys(MATERIALS.FDM?.[form.material] || {})
            : [];
        const colors = isFDM
            ? MATERIALS.FDM?.[form.material]?.[form.subtype]
            : MATERIALS?.[form.technology]?.[form.material];
        return (
            <CardContent className="pt-8 space-y-8">
                <CardTitle className="text-xl font-bold">
                    Color & Details *
                </CardTitle>
                {isFDM && (
                    <div className="space-y-4">
                        <p className="text-[11px] font-bold uppercase text-gray-400 tracking-widest text-center">
                            Material Subtype
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {subtypes.map((s) => (
                                <Button
                                    key={s}
                                    type="button"
                                    variant={
                                        form.subtype === s
                                            ? "secondary"
                                            : "outline"
                                    }
                                    className={cn(
                                        "h-10 font-bold rounded-xl border-gray-200",
                                        form.subtype === s &&
                                            "bg-black text-white",
                                    )}
                                    onClick={() =>
                                        setForm({
                                            ...form,
                                            subtype: s,
                                            colorMode: "",
                                            colors: [],
                                        })
                                    }
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <p className="text-[11px] font-bold uppercase text-gray-400 tracking-widest text-center">
                        Color Configuration
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <SelectableBox
                            selected={form.colorMode === "single"}
                            onClick={() =>
                                setForm({
                                    ...form,
                                    colorMode: "single",
                                    colors: [],
                                })
                            }
                        >
                            <span className="text-[13px] font-bold">
                                Single
                            </span>
                        </SelectableBox>
                        <SelectableBox
                            selected={form.colorMode === "multi"}
                            onClick={() =>
                                setForm({
                                    ...form,
                                    colorMode: "multi",
                                    colors: [],
                                })
                            }
                        >
                            <span className="text-[13px] font-bold">Multi</span>
                        </SelectableBox>
                    </div>
                    {form.colorMode && (
                        <div className="flex flex-wrap justify-center gap-2 pt-4">
                            {(colors || []).map((c: string) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => toggleColor(c)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl border text-[11px] font-bold transition-all",
                                        form.colors.includes(c)
                                            ? "bg-black text-white border-black scale-105"
                                            : "border-gray-200",
                                    )}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        );
    };

    const renderAdditionalInfo = () => (
        <CardContent className="pt-8 space-y-8">
            <CardTitle className="text-xl font-bold">Files & Qty *</CardTitle>
            <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                    Upload (STL/STEP) *
                </p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50">
                    <Input
                        type="file"
                        multiple
                        className="cursor-pointer"
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                files: Array.from(e.target.files!),
                            }))
                        }
                    />
                    {form.files.length > 0 && (
                        <p className="text-xs mt-2 font-bold text-black">
                            {form.files.length} files selected
                        </p>
                    )}
                </div>
            </div>
            <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                    Quantity *
                </p>
                <div className="grid gap-3">
                    <SelectableBox
                        selected={form.quantityType === "single"}
                        onClick={() =>
                            setForm({
                                ...form,
                                quantityType: "single",
                                quantityNumber: "1",
                            })
                        }
                    >
                        <span className="text-sm font-bold">
                            Single Unit (1)
                        </span>
                    </SelectableBox>
                    <SelectableBox
                        selected={form.quantityType === "batch"}
                        onClick={() =>
                            setForm({
                                ...form,
                                quantityType: "batch",
                                quantityNumber: "",
                            })
                        }
                    >
                        <span className="text-sm font-bold">
                            Multiple Units
                        </span>
                    </SelectableBox>
                </div>
                {form.quantityType === "batch" && (
                    <Input
                        type="number"
                        min="2"
                        className="h-12 rounded-xl mt-2"
                        value={form.quantityNumber}
                        onChange={(e) =>
                            setForm({ ...form, quantityNumber: e.target.value })
                        }
                        placeholder="Enter count..."
                    />
                )}
            </div>
            <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                    Notes (Optional)
                </p>
                <Textarea
                    className="rounded-xl min-h-[100px]"
                    value={form.notes}
                    onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Surface finish, deadlines..."
                />
            </div>
        </CardContent>
    );

    const renderContact = () => (
        <CardContent className="pt-8 space-y-6">
            <CardTitle className="text-xl font-bold">
                Contact & Shipping *
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                        Full Name *
                    </p>
                    <Input
                        className="h-12 rounded-xl"
                        placeholder="Full Name *"
                        value={form.fullName || ""}
                        onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                        Email *
                    </p>
                    <Input
                        className="h-12 rounded-xl"
                        placeholder="Email *"
                        type="email"
                        value={form.email || ""}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                        Phone *
                    </p>
                    <Input
                        className="h-12 rounded-xl"
                        placeholder="Phone *"
                        value={form.phone || ""}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                        Company
                    </p>
                    <Input
                        className="h-12 rounded-xl"
                        placeholder="Company"
                        value={form.company || ""}
                        onChange={(e) =>
                            setForm({ ...form, company: e.target.value })
                        }
                    />
                </div>
                {/* Added Address Field */}
                <div className="col-span-1 sm:col-span-2 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                        Shipping Address *
                    </p>
                    <Textarea
                        className="rounded-xl min-h-[80px] border-gray-200 focus:border-black"
                        placeholder="Full shipping address including city, state, and pincode..."
                        value={form.address || ""}
                        onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                        }
                    />
                </div>
            </div>
        </CardContent>
    );

    const renderReview = () => (
        <CardContent className="pt-8 space-y-6">
            <CardTitle className="text-xl font-bold">Review</CardTitle>
            <div className="bg-gray-50 p-6 rounded-2xl text-[13px] space-y-3 border border-gray-100">
                <div className="flex justify-between">
                    <span className="text-gray-400 uppercase font-bold text-[10px]">
                        Technology
                    </span>
                    <span className="font-bold">{form.technology}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 uppercase font-bold text-[10px]">
                        Material
                    </span>
                    <span className="font-bold">{form.material}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 uppercase font-bold text-[10px]">
                        Quantity
                    </span>
                    <span className="font-bold">
                        {form.quantityType === "single"
                            ? "1"
                            : form.quantityNumber}
                    </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-400 uppercase font-bold text-[10px]">
                        Contact
                    </span>
                    <span className="font-bold">{form.fullName}</span>
                </div>
                {/* Added Address to Review */}
                <div className="flex flex-col border-t pt-3">
                    <span className="text-gray-400 uppercase font-bold text-[10px] mb-1">
                        Shipping Address
                    </span>
                    <span className="font-medium text-gray-700">
                        {form.address}
                    </span>
                </div>
            </div>
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

    if (success)
        return (
            <Card className="max-w-md mx-auto py-16 text-center shadow-2xl rounded-[40px] border-none">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
                <CardTitle className="text-3xl font-black">
                    Submitted!
                </CardTitle>
                <CardDescription className="px-10 mt-4 text-gray-500">
                    We'll review your project and email you shortly.
                </CardDescription>
            </Card>
        );

    return (
        <div className="max-w-xl mx-auto p-4 md:p-10">
            <Card className="shadow-2xl rounded-[32px] border-none overflow-hidden bg-white ring-1 ring-gray-100">
                <Progress
                    value={(step / (totalSteps - 1)) * 100}
                    className="h-1 rounded-none bg-gray-100"
                />
                {flow[step]()}
                <CardFooter className="flex justify-between bg-gray-50/50 p-8 border-t">
                    {step > 0 && (
                        <Button
                            variant="ghost"
                            onClick={back}
                            className="font-bold text-gray-400"
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={step === totalSteps - 1 ? handleSubmit : next}
                        disabled={!canGoNext() || submitting}
                        className={cn(
                            "px-10 h-12 rounded-xl font-bold shadow-lg ml-auto",
                            canGoNext()
                                ? "bg-black text-white"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed",
                        )}
                    >
                        {submitting
                            ? "..."
                            : step === totalSteps - 1
                              ? "Submit"
                              : "Next"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
