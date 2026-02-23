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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
}

/* -------------------------------------------------------------------------- */
/* CUSTOM SELECTABLE ITEM */
/* -------------------------------------------------------------------------- */

const SelectableBox = ({ selected, onClick, children, className }: any) => (
    <div
        onClick={onClick}
        className={cn(
            "group flex items-center gap-3 border p-4 rounded-xl cursor-pointer transition-all duration-200",
            selected
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                : "bg-card hover:border-primary/40 hover:bg-muted/30",
            className,
        )}
    >
        <div
            className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                selected
                    ? "border-primary bg-primary text-white"
                    : "border-muted-foreground/30 group-hover:border-primary/50",
            )}
        >
            {selected && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
        {children}
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
    });

    const totalSteps = 8;
    const isBatch = form.projectType === "batch";

    const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
    const back = () => setStep((s) => Math.max(s - 1, 0));

    const toggleColor = (color: string) => {
        setForm((p) => {
            if (p.colorMode === "single") {
                return { ...p, colors: [color] };
            }
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
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Settings className="text-primary h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold">
                    3D Prototyping Request Form
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                    Thank you for choosing our services. This form is designed
                    to capture all technical specifications required to evaluate
                    and execute your project efficiently.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        To ensure a smooth review, please keep ready:
                    </p>
                    <ul className="grid grid-cols-1 gap-3">
                        {[
                            {
                                icon: FileText,
                                text: "Project details and application overview",
                            },
                            {
                                icon: Settings,
                                text: "Preferred 3D printing technology",
                            },
                            {
                                icon: Layers,
                                text: "Material requirements and performance expectations",
                            },
                            {
                                icon: Palette,
                                text: "Color preferences (if applicable)",
                            },
                            {
                                icon: Package,
                                text: "Design files (STL/STEP/OBJ, etc.) and technical notes",
                            },
                        ].map((item, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-[13px] text-foreground/80"
                            >
                                <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-xs text-muted-foreground italic">
                    Providing complete and accurate information will help us
                    deliver precise quotations and optimal print quality.
                </p>
            </CardContent>
        </div>
    );

    const renderProjectType = () => (
        <CardContent className="pt-6 space-y-4">
            <CardTitle className="text-lg mb-4">Project Type</CardTitle>
            <div className="grid gap-3">
                <SelectableBox
                    selected={form.projectType === "prototype"}
                    onClick={() =>
                        setForm({ ...form, projectType: "prototype" })
                    }
                >
                    <div>
                        <p className="text-sm font-bold">
                            Functional Prototype
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                            Single / Few Units for testing fit and form.
                        </p>
                    </div>
                </SelectableBox>
                <SelectableBox
                    selected={form.projectType === "batch"}
                    onClick={() => setForm({ ...form, projectType: "batch" })}
                >
                    <div>
                        <p className="text-sm font-bold">
                            Low-Volume Production
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                            Batch Manufacturing for pilots or market testing.
                        </p>
                    </div>
                </SelectableBox>
            </div>
        </CardContent>
    );

    const renderTechnology = () => (
        <CardContent className="pt-6 space-y-4">
            <CardTitle className="text-lg mb-4">Select Technology</CardTitle>
            <TooltipProvider delayDuration={0}>
                <div className="grid gap-3">
                    {[
                        {
                            id: "FDM",
                            title: "FDM (Filament Printing)",
                            head: "Strong • Affordable • Functional",
                            info: [
                                "Best for functional parts & prototypes",
                                "Wide material options (PLA, ABS, PETG, TPU, Nylon)",
                                "Visible layer lines",
                                "Cost-effective for larger parts",
                            ],
                        },
                        {
                            id: "SLA/DLP",
                            title: "SLA / DLP (Resin Printing)",
                            head: "High Detail • Smooth Finish",
                            info: [
                                "Excellent surface quality",
                                "Ideal for miniatures, jewelry, precision models",
                                "High dimensional accuracy",
                                "Requires post-processing",
                            ],
                        },
                        {
                            id: "SLS",
                            title: "SLS (Powder Printing)",
                            head: "Industrial • Durable • No Supports",
                            info: [
                                "Strong end-use parts",
                                "Complex geometries without supports",
                                "Suitable for batch production",
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
                            <span className="text-sm font-bold">{t.title}</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="ml-auto p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Info className="h-4 w-4 text-primary" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    className="p-4 max-w-[280px] shadow-xl border-primary/20 bg-card text-card-foreground"
                                >
                                    <p className="font-bold text-primary text-xs mb-2">
                                        {t.head}
                                    </p>
                                    <ul className="text-[11px] space-y-1.5 list-disc pl-4 opacity-90">
                                        {t.info.map((line, idx) => (
                                            <li key={idx}>{line}</li>
                                        ))}
                                    </ul>
                                </TooltipContent>
                            </Tooltip>
                        </SelectableBox>
                    ))}
                </div>
            </TooltipProvider>
        </CardContent>
    );

    const renderMaterial = () => (
        <CardContent className="pt-6 space-y-4">
            <CardTitle className="text-lg">Select Material</CardTitle>
            <div className="grid grid-cols-2 gap-2">
                {Object.keys(MATERIALS[form.technology] || {}).map((m) => (
                    <Button
                        key={m}
                        type="button"
                        variant={form.material === m ? "default" : "outline"}
                        className="text-xs h-11 justify-start font-bold"
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
            <CardContent className="pt-6 space-y-6">
                <CardTitle className="text-lg font-bold">
                    Technical Details
                </CardTitle>
                {isFDM && (
                    <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                            Subtype
                        </p>
                        <div className="grid grid-cols-2 gap-2">
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
                                        "text-xs h-10 font-bold",
                                        form.subtype === s &&
                                            "border-primary ring-1 ring-primary",
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

                {((isFDM && form.subtype) || (!isFDM && form.material)) && (
                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                                Color Configuration
                            </p>
                            <div className="grid grid-cols-2 gap-2">
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
                                        Single Color
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
                                    <span className="text-[13px] font-bold">
                                        Multi Color
                                    </span>
                                </SelectableBox>
                            </div>
                        </div>

                        {form.colorMode && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                                    Available Colors
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(colors || []).map((c: string) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => toggleColor(c)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg border text-[11px] font-bold transition-all",
                                                form.colors.includes(c)
                                                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                                    : "hover:border-primary/40",
                                            )}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        );
    };

    const renderAdditionalInfo = () => (
        <CardContent className="pt-6 space-y-6">
            <CardTitle className="text-lg font-bold">
                Files & Quantity
            </CardTitle>
            <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                    Upload Files (STL/STEP)
                </p>
                <Input
                    type="file"
                    multiple
                    className="text-xs h-11 cursor-pointer"
                    onChange={(e) =>
                        setForm((p) => ({
                            ...p,
                            files: Array.from(e.target.files!),
                        }))
                    }
                />
            </div>

            <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                    Additional info we should know
                </p>
                <Textarea
                    className="text-sm min-h-[100px] rounded-xl"
                    value={form.notes}
                    onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Mention specific tolerances, surface requirements, or deadlines..."
                />
            </div>

            <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                    Select Quantity
                </p>
                <div className="grid gap-2">
                    <SelectableBox
                        selected={form.quantityType === "single"}
                        onClick={() =>
                            setForm({
                                ...form,
                                quantityType: "single",
                                quantityNumber: "",
                            })
                        }
                    >
                        <span className="text-sm font-bold">Single Unit</span>
                    </SelectableBox>
                    <SelectableBox
                        selected={form.quantityType === "batch"}
                        onClick={() =>
                            setForm({ ...form, quantityType: "batch" })
                        }
                    >
                        <span className="text-sm font-bold">
                            Specify Quantity
                        </span>
                    </SelectableBox>
                </div>

                {form.quantityType === "batch" && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1 mb-1">
                            Enter Quantity
                        </p>
                        <Input
                            type="number"
                            min="2"
                            placeholder="e.g. 15"
                            className="h-11 rounded-lg"
                            value={form.quantityNumber}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    quantityNumber: e.target.value,
                                })
                            }
                        />
                    </div>
                )}
            </div>
        </CardContent>
    );

    const renderContact = () => (
        <CardContent className="pt-6 space-y-6">
            <CardTitle className="text-lg font-bold">
                Contact Information
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                        Full Name
                    </p>
                    <Input
                        className="rounded-lg h-11"
                        placeholder="John Doe"
                        value={form.fullName || ""}
                        onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                        Email
                    </p>
                    <Input
                        className="rounded-lg h-11"
                        placeholder="john@example.com"
                        type="email"
                        value={form.email || ""}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                        Phone Number
                    </p>
                    <Input
                        className="rounded-lg h-11"
                        placeholder="+91 ..."
                        value={form.phone || ""}
                        onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                        }
                    />
                </div>
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                        Company Name
                    </p>
                    <Input
                        className="rounded-lg h-11"
                        placeholder="Optional"
                        value={form.company || ""}
                        onChange={(e) =>
                            setForm({ ...form, company: e.target.value })
                        }
                    />
                </div>
            </div>
        </CardContent>
    );

    const renderReview = () => (
        <CardContent className="pt-6 space-y-4">
            <CardTitle className="text-lg font-bold">Final Review</CardTitle>
            <div className="bg-muted/30 p-4 rounded-xl text-sm space-y-2 border border-border/50">
                <p>
                    <b>Technology:</b> {form.technology}
                </p>
                <p>
                    <b>Material:</b> {form.material}{" "}
                    {form.subtype && `(${form.subtype})`}
                </p>
                <p>
                    <b>Mode:</b> {form.colorMode} color
                </p>
                <p>
                    <b>Colors:</b> {form.colors.join(", ")}
                </p>
                <p>
                    <b>Quantity:</b>{" "}
                    {form.quantityType === "single" ? "1" : form.quantityNumber}
                </p>
                <p>
                    <b>Contact:</b> {form.fullName} ({form.email})
                </p>
            </div>
        </CardContent>
    );

    const renderStep = () => {
        switch (step) {
            case 0:
                return renderIntro();
            case 1:
                return renderProjectType();
            case 2:
                return isBatch ? renderAdditionalInfo() : renderTechnology();
            case 3:
                return isBatch ? renderTechnology() : renderMaterial();
            case 4:
                return isBatch ? renderMaterial() : renderSubtypeColor();
            case 5:
                return isBatch ? renderSubtypeColor() : renderAdditionalInfo();
            case 6:
                return renderContact();
            default:
                return renderReview();
        }
    };

    if (success)
        return (
            <Card className="max-w-md mx-auto py-12 text-center border-green-500/20 shadow-2xl">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">
                    Request Submitted
                </CardTitle>
                <CardDescription className="px-6 mt-4">
                    We've received your details. Our engineering team will
                    review the files and get back to you shortly.
                </CardDescription>
            </Card>
        );

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8">
            <Card className="shadow-2xl border-none ring-1 ring-border overflow-hidden">
                <Progress
                    value={(step / (totalSteps - 1)) * 100}
                    className="h-1.5 rounded-none bg-muted"
                />
                {renderStep()}
                <CardFooter className="flex justify-between bg-muted/10 p-6 border-t">
                    {step > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={back}
                            className="rounded-lg"
                        >
                            Back
                        </Button>
                    )}
                    <div className="ml-auto">
                        {step < totalSteps - 1 ? (
                            <Button
                                type="button"
                                onClick={next}
                                className="px-8 rounded-lg font-bold"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="px-8 rounded-lg font-bold bg-green-600 hover:bg-green-700"
                            >
                                {submitting
                                    ? "Processing..."
                                    : "Submit Project"}
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
