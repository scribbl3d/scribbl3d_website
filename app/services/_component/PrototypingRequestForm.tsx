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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";

/* -------------------------------------------------------------------------- */
/* FULL MATERIAL CONFIG (UNCHANGED, COMPLETE) */
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
};

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

interface FormState {
    projectType: "prototype" | "batch" | "";
    technology: string;
    material: string;
    subtype: string;
    colors: string[];
    files: File[];
    notes: string;
    quantityType: string;
    quantityNumber: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
}

/* -------------------------------------------------------------------------- */
/* COMPONENT */
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

    /* ---------------- FILE HANDLER ---------------- */

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setForm((p) => ({ ...p, files: Array.from(e.target.files!) }));
    };

    /* ---------------- COLOR TOGGLE ---------------- */

    const toggleColor = (color: string) => {
        setForm((p) => ({
            ...p,
            colors: p.colors.includes(color)
                ? p.colors.filter((c) => c !== color)
                : [...p.colors, color],
        }));
    };

    /* -------------------------------------------------------------------------- */
    /* SUBMIT (REAL API CALL) */
    /* -------------------------------------------------------------------------- */

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const fd = new FormData();

            fd.append("projectType", form.projectType);
            fd.append("technology", form.technology);
            fd.append("material", form.material);
            fd.append("subtype", form.subtype);
            fd.append("colors", JSON.stringify(form.colors));
            fd.append("notes", form.notes);
            fd.append("quantityType", form.quantityType);
            fd.append("quantityNumber", form.quantityNumber);
            fd.append("fullName", form.fullName);
            fd.append("email", form.email);
            fd.append("phone", form.phone);
            fd.append("company", form.company);

            form.files.forEach((f) => fd.append("files", f));

            const res = await fetch("/api/prototyping-request", {
                method: "POST",
                body: fd,
            });

            if (!res.ok) throw new Error("Submit failed");
            setSuccess(true);
        } catch {
            alert("Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /* STEP RENDERERS */
    /* -------------------------------------------------------------------------- */

    const renderIntro = () => (
        <>
            <CardHeader>
                <CardTitle>3D Prototyping Request Form</CardTitle>
                <CardDescription>
                    Thank you for choosing our 3D prototyping services. This
                    form captures all technical specifications required to
                    evaluate and execute your project efficiently.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <ul className="list-disc pl-5">
                    <li>Project details and application overview</li>
                    <li>Preferred 3D printing technology</li>
                    <li>Material requirements and performance expectations</li>
                    <li>Color preferences (if applicable)</li>
                    <li>Design files and additional technical notes</li>
                </ul>
            </CardContent>
        </>
    );

    const renderProjectType = () => (
        <>
            <CardHeader>
                <CardTitle>Project Type</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={form.projectType}
                    onValueChange={(v) =>
                        setForm({ ...form, projectType: v as any })
                    }
                    className="space-y-4"
                >
                    <label className="flex gap-3 border p-4 rounded-lg cursor-pointer">
                        <RadioGroupItem value="prototype" />
                        <div>
                            <b>Functional Prototype (Single / Few Units)</b>
                            <p className="text-sm text-muted-foreground">
                                Ideal for testing fit, form, and function before
                                mass production.
                            </p>
                        </div>
                    </label>

                    <label className="flex gap-3 border p-4 rounded-lg cursor-pointer">
                        <RadioGroupItem value="batch" />
                        <div>
                            <b>Low-Volume Production (Batch Manufacturing)</b>
                            <p className="text-sm text-muted-foreground">
                                Best for producing multiple units for pilots or
                                market testing.
                            </p>
                        </div>
                    </label>
                </RadioGroup>
            </CardContent>
        </>
    );

    const renderTechnology = () => (
        <>
            <CardHeader>
                <CardTitle>Select Technology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[
                    {
                        id: "FDM",
                        title: "FDM (Filament Printing)",
                        info: (
                            <>
                                <b>Strong • Affordable • Functional</b>
                                <ul className="list-disc pl-4 mt-2">
                                    <li>
                                        Best for functional parts & prototypes
                                    </li>
                                    <li>
                                        Wide material options (PLA, ABS, PETG,
                                        TPU, Nylon)
                                    </li>
                                    <li>Visible layer lines</li>
                                    <li>Cost-effective for larger parts</li>
                                </ul>
                            </>
                        ),
                    },
                    {
                        id: "SLA/DLP",
                        title: "SLA / DLP (Resin Printing)",
                        info: (
                            <>
                                <b>High Detail • Smooth Finish</b>
                                <ul className="list-disc pl-4 mt-2">
                                    <li>Excellent surface quality</li>
                                    <li>
                                        Ideal for miniatures, jewelry, precision
                                        models
                                    </li>
                                    <li>High dimensional accuracy</li>
                                    <li>Requires post-processing</li>
                                </ul>
                            </>
                        ),
                    },
                    {
                        id: "SLS",
                        title: "SLS (Powder Printing)",
                        info: (
                            <>
                                <b>Industrial • Durable • No Supports</b>
                                <ul className="list-disc pl-4 mt-2">
                                    <li>Strong end-use parts</li>
                                    <li>Complex geometries without supports</li>
                                    <li>Suitable for batch production</li>
                                </ul>
                            </>
                        ),
                    },
                ].map((t) => (
                    <label
                        key={t.id}
                        className={cn(
                            "flex items-center gap-3 border rounded-lg p-4 cursor-pointer",
                            form.technology === t.id &&
                                "border-primary bg-primary/5",
                        )}
                    >
                        <RadioGroup
                            value={form.technology}
                            onValueChange={(v) =>
                                setForm({
                                    ...form,
                                    technology: v,
                                    material: "",
                                    subtype: "",
                                    colors: [],
                                })
                            }
                        >
                            <RadioGroupItem value={t.id} />
                        </RadioGroup>

                        <span className="font-medium">{t.title}</span>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="ml-auto h-4 w-4" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                    {t.info}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </label>
                ))}
            </CardContent>
        </>
    );

    const renderMaterial = () => (
        <>
            <CardHeader>
                <CardTitle>Select Material</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={form.material}
                    onValueChange={(v) =>
                        setForm({
                            ...form,
                            material: v,
                            subtype: "",
                            colors: [],
                        })
                    }
                    className="space-y-3"
                >
                    {Object.keys(MATERIALS[form.technology] || {}).map((m) => (
                        <label
                            key={m}
                            className="flex gap-3 border rounded-lg p-3 cursor-pointer"
                        >
                            <RadioGroupItem value={m} />
                            {m}
                        </label>
                    ))}
                </RadioGroup>
            </CardContent>
        </>
    );

    const renderSubtypeColor = () => {
        const colors =
            form.technology === "FDM"
                ? MATERIALS.FDM?.[form.material]?.[form.subtype]
                : MATERIALS?.[form.technology]?.[form.material];

        return (
            <>
                <CardHeader>
                    <CardTitle>Material Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.technology === "FDM" && (
                        <RadioGroup
                            value={form.subtype}
                            onValueChange={(v) =>
                                setForm({ ...form, subtype: v, colors: [] })
                            }
                        >
                            {Object.keys(
                                MATERIALS.FDM?.[form.material] || {},
                            ).map((s) => (
                                <label
                                    key={s}
                                    className="flex gap-3 border rounded-lg p-3 cursor-pointer"
                                >
                                    <RadioGroupItem value={s} />
                                    {s}
                                </label>
                            ))}
                        </RadioGroup>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {(colors || []).map((c: string) => (
                            <Button
                                key={c}
                                type="button"
                                size="sm"
                                variant={
                                    form.colors.includes(c)
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => toggleColor(c)}
                            >
                                {c}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </>
        );
    };

    const renderAdditionalInfo = () => (
        <>
            <CardHeader>
                <CardTitle>Files & Quantity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input type="file" multiple onChange={handleFiles} />

                <Textarea
                    value={form.notes}
                    onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Tolerances, surface finish, strength, post-processing, deadlines..."
                />

                <RadioGroup
                    value={form.quantityType}
                    onValueChange={(v) => setForm({ ...form, quantityType: v })}
                >
                    {[
                        ["single", "Single Unit / Prototype"],
                        ["small", "Small Batch (2–20)"],
                        ["large", "Large Batch (20+)"],
                    ].map(([v, l]) => (
                        <label
                            key={v}
                            className="flex gap-3 border rounded-lg p-3 cursor-pointer"
                        >
                            <RadioGroupItem value={v} />
                            {l}
                        </label>
                    ))}
                </RadioGroup>

                {form.quantityType !== "single" && (
                    <Input
                        value={form.quantityNumber}
                        onChange={(e) =>
                            setForm({ ...form, quantityNumber: e.target.value })
                        }
                        placeholder="Exact quantity required"
                    />
                )}
            </CardContent>
        </>
    );
    const renderContact = () => (
        <>
            <CardHeader>
                <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    placeholder="Full Name"
                    value={form.fullName ?? ""}
                    onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                    }
                />

                <Input
                    placeholder="Email"
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <Input
                    placeholder="Phone"
                    value={form.phone ?? ""}
                    onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                    }
                />

                <Input
                    placeholder="Company (Optional)"
                    value={form.company ?? ""}
                    onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                    }
                />
            </CardContent>
        </>
    );

    const renderReview = () => (
        <>
            <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <p>
                    <b>Name:</b> {form.fullName}
                </p>
                <p>
                    <b>Email:</b> {form.email}
                </p>
                <p>
                    <b>Technology:</b> {form.technology}
                </p>
                <p>
                    <b>Material:</b> {form.material}
                </p>
                <p>
                    <b>Subtype:</b> {form.subtype}
                </p>
                <p>
                    <b>Colors:</b> {form.colors.join(", ")}
                </p>
                <p>
                    <b>Files:</b> {form.files.length}
                </p>
            </CardContent>
        </>
    );

    const renderStep = () => {
        if (step === 0) return renderIntro();
        if (step === 1) return renderProjectType();
        if (step === 2 && isBatch) return renderAdditionalInfo();
        if ((step === 2 && !isBatch) || (step === 3 && isBatch))
            return renderTechnology();
        if ((step === 3 && !isBatch) || (step === 4 && isBatch))
            return renderMaterial();
        if ((step === 4 && !isBatch) || (step === 5 && isBatch))
            return renderSubtypeColor();
        if (step === 5 && !isBatch) return renderAdditionalInfo();
        if (step === 6) return renderContact();
        return renderReview();
    };

    if (success) {
        return (
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Request Submitted Successfully</CardTitle>
                    <CardDescription>
                        Our engineering team will review your request and get
                        back to you shortly.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Card className="mx-auto max-w-2xl">
                {renderStep()}

                <CardFooter className="flex justify-between">
                    {step > 0 && (
                        <Button type="button" variant="outline" onClick={back}>
                            Back
                        </Button>
                    )}
                    {step < totalSteps - 1 ? (
                        <Button type="button" onClick={next}>
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <Progress
                value={(step / (totalSteps - 1)) * 100}
                className="mt-4"
            />
        </form>
    );
}
