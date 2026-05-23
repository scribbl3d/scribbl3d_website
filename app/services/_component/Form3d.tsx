"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Clock,
    HelpCircle,
    Loader2,
    Mail,
    MapPin,
    Package,
    Phone,
    Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Material Mapping ─────────────────────────────────────────────────────────

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
        PA: {
            PA: ["White", "Black"],
            "PA GF": ["White"],
            "PA CF": ["Black"],
        },
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
    SLS: {
        Nylon: ["Black/Gray"],
    },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    fileReference: File | null;
    requirement: string;
    fileExtension: string;
    productionType: string;
    quantity: string;
    printingTechnology: string;
    materialFamily: string;
    material: string;
    color: string;
    additionalFile: File | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    company: string;
}

interface FormErrors {
    [key: string]: string;
}

const initialFormData: FormData = {
    fileReference: null,
    requirement: "",
    fileExtension: "",
    productionType: "",
    quantity: "1",
    printingTechnology: "",
    materialFamily: "",
    material: "",
    color: "",
    additionalFile: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    company: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const renameFile = (file: File, firstName: string, lastName: string): File => {
    const now = new Date();
    const ts =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");
    const ext = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";
    const clean = (s: string) => s.trim().replace(/[^a-zA-Z0-9]/g, "");
    return new File(
        [file],
        `${clean(firstName)}_${clean(lastName)}_${ts}${ext}`,
        { type: file.type },
    );
};

function getMaterialFamilies(tech: string): string[] {
    if (!tech || !(MATERIALS as any)[tech]) return [];
    return Object.keys((MATERIALS as any)[tech]);
}

function getSubTypes(tech: string, family: string): string[] {
    if (!tech || !family) return [];
    const familyData = (MATERIALS as any)[tech]?.[family];
    if (!familyData || Array.isArray(familyData)) return [];
    return Object.keys(familyData);
}

function getColors(tech: string, family: string, subType: string): string[] {
    if (!tech || !family) return [];
    const familyData = (MATERIALS as any)[tech]?.[family];
    if (!familyData) return [];
    if (Array.isArray(familyData)) return familyData as string[];
    if (!subType) return [];
    return (familyData[subType] as string[]) || [];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function InfoTooltip({ content }: { content: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative inline-flex items-center" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-1",
                    open
                        ? "bg-zinc-800 text-white"
                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700",
                )}
                aria-label="More information"
            >
                <HelpCircle className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute z-50 left-7 top-1/2 -translate-y-1/2 w-64 rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/80 p-4">
                    <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l border-b border-zinc-200 rotate-45" />
                    <div className="text-xs leading-relaxed text-zinc-500">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────

function FieldWrapper({
    label,
    error,
    tooltip,
    children,
    required = true,
}: {
    label: string;
    error?: string;
    tooltip?: React.ReactNode;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-zinc-800">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                    {!required && (
                        <span className="ml-1.5 text-xs font-normal text-zinc-400">
                            (Optional)
                        </span>
                    )}
                </Label>
                {tooltip && <InfoTooltip content={tooltip} />}
            </div>
            {/* Highlight wrapper when there's an error */}
            <div className={cn(error && "ring-2 ring-red-400/40 rounded-xl")}>
                {children}
            </div>
            {error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Radio Card ───────────────────────────────────────────────────────────────

function RadioCard({
    value,
    label,
    description,
    selected,
    id,
    hasError,
}: {
    value: string;
    label: string;
    description?: string;
    selected: boolean;
    id: string;
    hasError?: boolean;
}) {
    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                selected
                    ? "border-zinc-900 bg-zinc-50 shadow-sm"
                    : hasError
                      ? "border-red-300 bg-red-50/30 hover:border-red-400"
                      : "border-zinc-200 hover:border-zinc-300 bg-white",
            )}
        >
            <RadioGroupItem
                value={value}
                id={id}
                className="mt-0.5 flex-shrink-0"
            />
            <Label htmlFor={id} className="cursor-pointer flex-1 space-y-0.5">
                <div className="font-semibold text-sm text-zinc-800">
                    {label}
                </div>
                {description && (
                    <div className="text-xs text-zinc-500 font-normal">
                        {description}
                    </div>
                )}
            </Label>
        </div>
    );
}

// ─── Landing checklist item ───────────────────────────────────────────────────

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

export function Form3D({ onSubmit }: { onSubmit?: () => void }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [submittedProductionType, setSubmittedProductionType] = useState("");

    const materialFamilies = getMaterialFamilies(formData.printingTechnology);
    const subTypes = getSubTypes(
        formData.printingTechnology,
        formData.materialFamily,
    );
    const hasSubTypes = subTypes.length > 0;
    const colors = getColors(
        formData.printingTechnology,
        formData.materialFamily,
        formData.material,
    );

    // ── Validation ───────────────────────────────────────────────────────────

    const validateField = useCallback(
        (name: string, value: unknown): string => {
            switch (name) {
                case "requirement":
                    return !value
                        ? "Please describe your design requirements"
                        : "";
                case "fileExtension":
                    return !value ? "Please select a file format" : "";
                case "productionType":
                    return !value ? "Please select a production option" : "";
                case "quantity":
                    if (!value) return "Please specify the quantity";
                    if (isNaN(Number(value)) || Number(value) < 1)
                        return "Please enter a valid quantity";
                    return "";
                case "printingTechnology":
                    return !value ? "Please select a printing technology" : "";
                case "materialFamily":
                    return !value ? "Please select a material" : "";
                case "material":
                    return !value ? "Please select a material type" : "";
                case "color":
                    return !value ? "Please select a colour" : "";
                case "firstName":
                    return !value ? "First name is required" : "";
                case "lastName":
                    return !value ? "Last name is required" : "";
                case "email":
                    if (!value) return "Email is required";
                    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value as string))
                        return "Please enter a valid email";
                    return "";
                case "phone":
                    if (!value) return "Phone number is required";
                    if (!/^\d{10}$/.test(String(value).replace(/[\s\-()]/g, "").replace(/^\+\d{1,3}/, "").replace(/^0/, "")))
                        return "Please enter a valid 10-digit phone number";
                    return "";
                case "address":
                    return !value ? "Address is required" : "";
                default:
                    return "";
            }
        },
        [],
    );

    const getFieldsForStep = useCallback(
        (step: number): string[] => {
            switch (step) {
                case 2:
                    return ["requirement", "fileExtension"];
                case 3:
                    if (formData.productionType === "small_batch")
                        return ["productionType", "quantity"];
                    return ["productionType"];
                case 4:
                    if (formData.productionType === "design_only") return [];
                    const f = ["printingTechnology", "materialFamily"];
                    if (hasSubTypes) f.push("material");
                    f.push("color");
                    return f;
                case 5:
                    return [
                        "firstName",
                        "lastName",
                        "email",
                        "phone",
                        "address",
                    ];
                default:
                    return [];
            }
        },
        [formData.productionType, hasSubTypes],
    );

    const validateStep = useCallback(() => {
        const fields = getFieldsForStep(currentStep);
        const newErrors: FormErrors = {};
        fields.forEach((f) => {
            const err = validateField(f, formData[f as keyof FormData]);
            if (err) newErrors[f] = err;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentStep, formData, validateField, getFieldsForStep]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((p) => ({ ...p, [name]: value }));
            setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
        },
        [validateField],
    );

    const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) {
            const file = files[0];
            if (name === "fileReference" && file.size > 10 * 1024 * 1024) {
                setErrors((p) => ({
                    ...p,
                    [name]: "File size must be less than 10MB",
                }));
                return;
            }
            setFormData((p) => ({ ...p, [name]: file }));
            setErrors((p) => ({ ...p, [name]: "" }));
        }
    }, []);

    const handleSelect = useCallback(
        (name: string, value: string) => {
            setFormData((p) => ({ ...p, [name]: value }));
            setErrors((p) => ({ ...p, [name]: validateField(name, value) }));
        },
        [validateField],
    );

    // Prevent scroll from changing number inputs
    const preventScrollChange = useCallback(
        (e: React.WheelEvent<HTMLInputElement>) => {
            e.currentTarget.blur();
        },
        [],
    );

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (
                    (key === "fileReference" || key === "additionalFile") &&
                    value instanceof File
                ) {
                    fd.append(
                        key,
                        renameFile(
                            value,
                            formData.firstName,
                            formData.lastName,
                        ),
                    );
                } else if (value instanceof File) {
                    fd.append(key, value);
                } else if (value) {
                    fd.append(key, value.toString());
                }
            });

            const response = await fetch("/api/form-responses", {
                method: "POST",
                body: fd,
            });

            if (!response.ok) {
                setErrors((p) => ({
                    ...p,
                    submit: "Failed to submit. Please try again.",
                }));
                return;
            }

            setSubmittedEmail(formData.email);
            setSubmittedProductionType(formData.productionType);
            setCurrentStep(7);
        } catch {
            setErrors((p) => ({
                ...p,
                submit: "Failed to submit. Please try again.",
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const goNext = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
            return;
        }
        if (validateStep()) setCurrentStep((p) => p + 1);
    };
    const goPrev = () => setCurrentStep((p) => p - 1);

    const handleClose = () => {
        setFormData(initialFormData);
        setCurrentStep(1);
        setErrors({});
        setSubmittedEmail("");
        setSubmittedProductionType("");
        onSubmit?.();
    };

    // ── Renders ───────────────────────────────────────────────────────────────

    const renderLanding = () => (
        <div className="space-y-7">
            {/* Hero */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-100 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    3D Design Request
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 leading-[1.15]">
                        Need a 3D model
                        <br />
                        <span className="text-zinc-400">
                            designed from concept?
                        </span>
                    </h1>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                        This form helps our design team understand your
                        requirements and provide an accurate quotation.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated completion time: 5–8 minutes</span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-100" />

            {/* Checklist */}
            <div className="space-y-4">
                <p className="text-sm font-bold text-zinc-800">
                    Please keep the following ready
                </p>
                <ul className="space-y-3">
                    {[
                        "A clear description of your idea or concept",
                        "Reference images, sketches, or inspiration (if available)",
                        "Intended application of the model",
                        "Approximate dimensions or size requirements",
                        "Target material or manufacturing method (if known)",
                        "Deadline expectations",
                    ].map((item, i) => (
                        <CheckItem key={i}>{item}</CheckItem>
                    ))}
                </ul>
            </div>

            {/* Footer tip */}
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 px-5 py-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-semibold text-zinc-600">
                        Pro tip:
                    </span>{" "}
                    Providing detailed information reduces revisions and speeds
                    up your project turnaround significantly.
                </p>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Project Details
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Step 2 of 6 — Tell us about your design
                </p>
            </div>

            <FieldWrapper
                label="Reference Files"
                required={false}
                error={errors.fileReference}
                tooltip={
                    <div className="space-y-2">
                        <p className="font-semibold text-zinc-700">
                            Accepted file types include:
                        </p>
                        <ul className="space-y-1">
                            <li>• Sketches or hand-drawn diagrams</li>
                            <li>• Inspiration images</li>
                            <li>• Existing 3D files (for modification)</li>
                            <li>• Dimensioned drawings</li>
                            <li>• PDFs with specifications</li>
                        </ul>
                    </div>
                }
            >
                <div className="space-y-1.5">
                    <Input
                        type="file"
                        name="fileReference"
                        onChange={handleFile}
                        accept=".obj,.stl,.xt,.stp,.step,.3mf,.jpg,.png,.pdf"
                        className="file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-700 cursor-pointer h-11"
                    />
                    <p className="text-xs text-zinc-400">
                        Max 10 MB · .STL .STEP .STP .OBJ .3MF .XT .JPG .PNG .PDF
                    </p>
                </div>
            </FieldWrapper>

            <FieldWrapper
                label="Project Description"
                error={errors.requirement}
                tooltip={
                    <div className="space-y-2">
                        <p className="font-semibold text-zinc-700">
                            Please include:
                        </p>
                        <ul className="space-y-1">
                            <li>• What is the part or product?</li>
                            <li>• What is its intended use?</li>
                            <li>• Approximate dimensions</li>
                            <li>• Mechanical or functional requirements</li>
                            <li>• Assembly requirements (if multiple parts)</li>
                        </ul>
                        <p className="pt-1 border-t border-zinc-100 text-zinc-400">
                            The more clarity you provide, the faster we can
                            evaluate and quote accurately.
                        </p>
                    </div>
                }
            >
                <Textarea
                    name="requirement"
                    value={formData.requirement}
                    onChange={handleInput}
                    placeholder="Describe your design requirement in detail..."
                    className={cn(
                        "min-h-[120px] resize-y text-sm transition-colors",
                        errors.requirement &&
                            "border-red-400 focus-visible:ring-red-400",
                    )}
                />
            </FieldWrapper>

            <FieldWrapper
                label="Required File Format"
                error={errors.fileExtension}
            >
                <Select
                    value={formData.fileExtension}
                    onValueChange={(v) => handleSelect("fileExtension", v)}
                >
                    <SelectTrigger
                        className={cn(
                            "h-11",
                            errors.fileExtension && "border-red-400",
                        )}
                    >
                        <SelectValue placeholder="Select output format" />
                    </SelectTrigger>
                    <SelectContent>
                        {[
                            {
                                value: "STL",
                                label: "STL – Standard format for 3D printing",
                            },
                            {
                                value: "3MF",
                                label: "3MF – Advanced 3D printing format (supports color & metadata)",
                            },
                            {
                                value: "STEP/STP",
                                label: "STEP / STP – Editable CAD file for manufacturing",
                            },
                            {
                                value: "SolidWorks",
                                label: "SolidWorks (SLDPRT / SLDASM) – Native SolidWorks file",
                            },
                            {
                                value: "OBJ",
                                label: "OBJ – Visualization or rendering use",
                            },
                            {
                                value: "PDF",
                                label: "PDF (2D Drawing with dimensions) – For documentation/reference",
                            },
                            {
                                value: "Not Sure",
                                label: "Not Sure — Recommend for Me",
                            },
                        ].map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FieldWrapper>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Manufacturing Requirement
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Step 3 of 6 — Do you need physical production?
                </p>
            </div>

            <FieldWrapper
                label="Do you require physical production of this design?"
                error={errors.productionType}
            >
                <RadioGroup
                    name="productionType"
                    value={formData.productionType}
                    onValueChange={(v) => {
                        setFormData((p) => ({
                            ...p,
                            productionType: v,
                            quantity: v === "prototype" ? "1" : "",
                        }));
                        setErrors((p) => ({
                            ...p,
                            productionType: "",
                            quantity: "",
                        }));
                    }}
                    className="space-y-2"
                >
                    {[
                        {
                            value: "prototype",
                            label: "Yes — I need a 3D printed prototype",
                            description:
                                "Single unit for testing and validation",
                        },
                        {
                            value: "small_batch",
                            label: "Yes — I need small batch manufacturing",
                            description: "Multiple units for pilot production",
                        },
                        {
                            value: "design_only",
                            label: "No — I only need the design files",
                            description:
                                "Digital files only, no physical production",
                        },
                    ].map((o) => (
                        <RadioCard
                            key={o.value}
                            value={o.value}
                            id={`prod-${o.value}`}
                            label={o.label}
                            description={o.description}
                            selected={formData.productionType === o.value}
                            hasError={!!errors.productionType}
                        />
                    ))}
                </RadioGroup>
            </FieldWrapper>

            {formData.productionType === "prototype" && (
                <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border-2 border-zinc-200 px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-black text-zinc-600">
                            1
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Quantity is automatically set to{" "}
                        <span className="font-semibold text-zinc-700">1</span>{" "}
                        for prototype orders.
                    </p>
                </div>
            )}

            {formData.productionType === "small_batch" && (
                <FieldWrapper label="Quantity" error={errors.quantity}>
                    <Input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInput}
                        onWheel={preventScrollChange}
                        min="2"
                        className={cn(
                            "h-11 w-36",
                            errors.quantity &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                        placeholder="e.g. 50"
                    />
                </FieldWrapper>
            )}
        </div>
    );

    const renderStep4 = () => {
        const needsTech = formData.productionType !== "design_only";
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-black text-zinc-900">
                        {needsTech ? "Technology & Colour" : "Preferences"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Step 4 of 6 —{" "}
                        {needsTech
                            ? "Select printing method, material and colour"
                            : "No printing required"}
                    </p>
                </div>

                {!needsTech ? (
                    <div className="rounded-xl border-2 border-zinc-100 bg-zinc-50 p-5 text-sm text-zinc-500">
                        Since you only need design files, no printing technology
                        selection is required. Proceed to the next step.
                    </div>
                ) : (
                    <>
                        <FieldWrapper
                            label="3D Printing Technology"
                            error={errors.printingTechnology}
                            tooltip={
                                <div className="space-y-2">
                                    <p>
                                        <span className="font-semibold text-zinc-700">
                                            FDM
                                        </span>{" "}
                                        — Fused Deposition Modeling. Uses
                                        thermoplastic filaments. Cost-effective
                                        for most parts.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-zinc-700">
                                            SLA/DLP
                                        </span>{" "}
                                        — Resin-based printing. Ideal for
                                        high-detail, smooth surface finish
                                        parts.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-zinc-700">
                                            SLS
                                        </span>{" "}
                                        — Selective Laser Sintering.
                                        Powder-based, produces strong functional
                                        parts without support structures.
                                    </p>
                                </div>
                            }
                        >
                            <RadioGroup
                                name="printingTechnology"
                                value={formData.printingTechnology}
                                onValueChange={(v) => {
                                    setFormData((p) => ({
                                        ...p,
                                        printingTechnology: v,
                                        materialFamily: "",
                                        material: "",
                                        color: "",
                                    }));
                                    setErrors((p) => ({
                                        ...p,
                                        printingTechnology: "",
                                    }));
                                }}
                                className="space-y-2"
                            >
                                {[
                                    {
                                        value: "FDM",
                                        label: "FDM (Filament Based)",
                                        desc: "Thermoplastic filaments — cost-effective for most parts",
                                    },
                                    {
                                        value: "SLA/DLP",
                                        label: "SLA/DLP (Resin Based)",
                                        desc: "High-detail liquid resin — smooth surface finish",
                                    },
                                    {
                                        value: "SLS",
                                        label: "SLS (Powder Based)",
                                        desc: "Strong functional parts — no support structures needed",
                                    },
                                ].map((o) => (
                                    <RadioCard
                                        key={o.value}
                                        value={o.value}
                                        id={`tech-${o.value}`}
                                        label={o.label}
                                        description={o.desc}
                                        selected={
                                            formData.printingTechnology ===
                                            o.value
                                        }
                                        hasError={!!errors.printingTechnology}
                                    />
                                ))}
                            </RadioGroup>
                        </FieldWrapper>

                        {formData.printingTechnology && (
                            <FieldWrapper
                                label="Material"
                                error={errors.materialFamily}
                            >
                                <Select
                                    value={formData.materialFamily}
                                    onValueChange={(v) => {
                                        setFormData((p) => ({
                                            ...p,
                                            materialFamily: v,
                                            material: "",
                                            color: "",
                                        }));
                                        setErrors((p) => ({
                                            ...p,
                                            materialFamily: "",
                                        }));
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-11",
                                            errors.materialFamily &&
                                                "border-red-400",
                                        )}
                                    >
                                        <SelectValue placeholder="Choose material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materialFamilies.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldWrapper>
                        )}

                        {formData.materialFamily && hasSubTypes && (
                            <FieldWrapper
                                label="Material Type"
                                error={errors.material}
                            >
                                <Select
                                    value={formData.material}
                                    onValueChange={(v) => {
                                        setFormData((p) => ({
                                            ...p,
                                            material: v,
                                            color: "",
                                        }));
                                        setErrors((p) => ({
                                            ...p,
                                            material: "",
                                        }));
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-11",
                                            errors.material && "border-red-400",
                                        )}
                                    >
                                        <SelectValue placeholder="Choose type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subTypes.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldWrapper>
                        )}

                        {colors.length > 0 && (
                            <FieldWrapper label="Colour" error={errors.color}>
                                <Select
                                    value={formData.color}
                                    onValueChange={(v) =>
                                        handleSelect("color", v)
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-11",
                                            errors.color && "border-red-400",
                                        )}
                                    >
                                        <SelectValue placeholder="Choose colour" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldWrapper>
                        )}

                        <FieldWrapper label="Additional Files" required={false}>
                            <div className="space-y-1.5">
                                <Input
                                    type="file"
                                    name="additionalFile"
                                    onChange={handleFile}
                                    accept=".obj,.stl,.xt,.stp,.step,.3mf,.jpg,.png,.pdf"
                                    className="file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-700 cursor-pointer h-11"
                                />
                                <p className="text-xs text-zinc-400">
                                    Upload any additional reference files or
                                    documentation.
                                </p>
                            </div>
                        </FieldWrapper>
                    </>
                )}
            </div>
        );
    };

    const renderStep5 = () => (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-black text-zinc-900">
                    Customer Details
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Step 5 of 6 — Your contact information
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="First Name" error={errors.firstName}>
                    <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInput}
                        placeholder="John"
                        className={cn(
                            "h-11",
                            errors.firstName &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                    />
                </FieldWrapper>
                <FieldWrapper label="Last Name" error={errors.lastName}>
                    <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInput}
                        placeholder="Smith"
                        className={cn(
                            "h-11",
                            errors.lastName &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                    />
                </FieldWrapper>
            </div>

            <FieldWrapper label="Email Address" error={errors.email}>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInput}
                        placeholder="john@example.com"
                        className={cn(
                            "h-11 pl-10",
                            errors.email &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                    />
                </div>
            </FieldWrapper>

            <FieldWrapper label="Phone Number" error={errors.phone}>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInput}
                        placeholder="+1 (555) 000-0000"
                        className={cn(
                            "h-11 pl-10",
                            errors.phone &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                    />
                </div>
            </FieldWrapper>

            <FieldWrapper label="Address" error={errors.address}>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInput}
                        placeholder="Street, City, State / Province, ZIP / Postal Code, Country"
                        className={cn(
                            "pl-10 min-h-[80px] resize-none text-sm",
                            errors.address &&
                                "border-red-400 focus-visible:ring-red-400",
                        )}
                    />
                </div>
            </FieldWrapper>

            <FieldWrapper label="Company Name" required={false}>
                <Input
                    name="company"
                    value={formData.company}
                    onChange={handleInput}
                    placeholder="Your company (optional)"
                    className="h-11"
                />
            </FieldWrapper>
        </div>
    );

    const productionLabel =
        formData.productionType === "prototype"
            ? "3D Printed Prototype (×1)"
            : formData.productionType === "small_batch"
              ? `Small Batch Manufacturing (×${formData.quantity})`
              : "Design Files Only";

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

    const renderStep6 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-zinc-900">Summary</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                    Step 6 of 6 — Review before submitting
                </p>
            </div>

            <div className="space-y-3">
                {[
                    {
                        title: "Project Details",
                        rows: [
                            {
                                label: "File Format",
                                value: formData.fileExtension,
                            },
                            {
                                label: "Reference File",
                                value: formData.fileReference?.name,
                            },
                        ],
                    },
                    {
                        title: "Manufacturing",
                        rows: [{ label: "Production", value: productionLabel }],
                    },
                    {
                        title: "Tech & Material",
                        rows: [
                            {
                                label: "Technology",
                                value:
                                    formData.printingTechnology ||
                                    (formData.productionType === "design_only"
                                        ? "N/A"
                                        : undefined),
                            },
                            {
                                label: "Material",
                                value: formData.materialFamily,
                            },
                            { label: "Type", value: formData.material },
                            { label: "Colour", value: formData.color },
                        ],
                    },
                    {
                        title: "Contact",
                        rows: [
                            {
                                label: "Name",
                                value: `${formData.firstName} ${formData.lastName}`.trim(),
                            },
                            { label: "Email", value: formData.email },
                            { label: "Phone", value: formData.phone },
                            { label: "Address", value: formData.address },
                            { label: "Company", value: formData.company },
                        ],
                    },
                ].map((section) => (
                    <div
                        key={section.title}
                        className="rounded-xl border-2 border-zinc-100 p-4"
                    >
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                            {section.title}
                        </p>
                        {section.rows.map((row) => (
                            <SummaryRow
                                key={row.label}
                                label={row.label}
                                value={row.value}
                            />
                        ))}
                    </div>
                ))}

                {formData.requirement && (
                    <div className="rounded-xl border-2 border-zinc-100 p-4">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                            Description
                        </p>
                        <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">
                            {formData.requirement}
                        </p>
                    </div>
                )}
            </div>

            {errors.submit && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
            )}
        </div>
    );

    const renderThankYou = () => (
        <div className="space-y-5 py-2">
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
                    Thank you for submitting your 3D design request. A
                    confirmation email has been sent to{" "}
                    <span className="font-semibold text-zinc-700">
                        {submittedEmail}
                    </span>
                    . Please check your inbox (and spam folder, if necessary).
                </p>
            </div>

            <div className="rounded-2xl border-2 border-zinc-100 bg-zinc-50 p-5 space-y-3">
                <p className="text-sm font-bold text-zinc-800">
                    What Happens Next?
                </p>
                <p className="text-xs text-zinc-500">
                    Our design team will now:
                </p>
                <ul className="space-y-2">
                    {[
                        "Review your concept and reference files",
                        "Assess technical complexity and feasibility",
                        "Evaluate manufacturing considerations (if applicable)",
                        "Prepare a detailed quotation and estimated timeline",
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
                        You can expect a response within{" "}
                        <span className="font-semibold text-zinc-600">
                            12–24 business hours
                        </span>
                        .
                    </p>
                </div>
            </div>

            {submittedProductionType !== "design_only" && (
                <div className="rounded-2xl border-2 border-zinc-100 p-5 space-y-2">
                    <p className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-zinc-500" />
                        If Production Was Requested
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        If you selected prototyping or batch manufacturing, our
                        team will also evaluate the most suitable printing
                        process and material for your application.
                    </p>
                </div>
            )}

            <div className="rounded-2xl border-2 border-zinc-100 p-5 space-y-2">
                <p className="text-sm font-bold text-zinc-800">
                    Need to Add or Modify Details?
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    If you need to share additional files or clarify
                    specifications, simply reply to the confirmation email so we
                    can track your project accurately.
                </p>
            </div>

            <div className="rounded-2xl bg-zinc-900 text-white p-5 space-y-2">
                <p className="text-sm font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Urgent Project?
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    For time-sensitive requirements, please contact:
                </p>
                <a
                    href="mailto:supplychain@scribbl3d.com"
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1.5"
                >
                    <Mail className="w-3.5 h-3.5" />
                    supplychain@scribbl3d.com
                </a>
            </div>

            <Button
                type="button"
                onClick={handleClose}
                className="w-full h-11 text-sm font-semibold bg-zinc-900 hover:bg-zinc-700 rounded-xl"
            >
                Close
            </Button>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderLanding();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            case 4:
                return renderStep4();
            case 5:
                return renderStep5();
            case 6:
                return renderStep6();
            case 7:
                return renderThankYou();
            default:
                return null;
        }
    };

    const isLastFormStep = currentStep === 6;
    const isThankYou = currentStep === 7;

    return (
        <div className="w-full max-w-xl mx-auto">
            <ScrollArea className="h-[calc(100vh-180px)] md:h-auto px-1">
                <Card className="border-none shadow-none">
                    <CardContent className="pt-6">
                        {renderCurrentStep()}
                    </CardContent>
                </Card>

                {!isThankYou && (
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 pb-2 border-t border-zinc-100 mt-4">
                        <div className="flex justify-between gap-3 px-6">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={goPrev}
                                    className="h-11 px-6 text-sm font-semibold border-zinc-200 rounded-xl"
                                >
                                    Back
                                </Button>
                            )}
                            {isLastFormStep ? (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={cn(
                                        "h-11 px-8 text-sm font-semibold bg-zinc-900 hover:bg-zinc-700 ml-auto rounded-xl",
                                        isSubmitting &&
                                            "opacity-60 cursor-not-allowed",
                                    )}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={goNext}
                                    className="h-11 px-8 text-sm font-semibold bg-zinc-900 hover:bg-zinc-700 ml-auto rounded-xl"
                                >
                                    {currentStep === 1
                                        ? "Get Started"
                                        : "Continue"}
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
