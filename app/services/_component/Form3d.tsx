"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface FormData {
    service: string;
    fileReference: File | null;
    requirement: string;
    fileExtension: string;
    prototype: string;
    prototypeOption: string;
    printingTechnology: string;
    material: string;
    materialType: string;
    materialDescription: string;
    quantity: string;
    productColor: string;
    filamentColor: string;
    resinColor: string;
    additionalFile: File | null;
    // Contact Information
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
}

interface FormErrors {
    [key: string]: string;
}

const initialFormData: FormData = {
    service: "",
    fileReference: null,
    requirement: "",
    fileExtension: "",
    prototype: "",
    prototypeOption: "",
    printingTechnology: "",
    material: "",
    materialType: "",
    materialDescription: "",
    quantity: "",
    productColor: "",
    filamentColor: "",
    resinColor: "",
    additionalFile: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
};

export function Form3D({ onSubmit }: { onSubmit?: () => void }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        return () => {
            setFormData(initialFormData);
            setCurrentStep(1);
            setErrors({});
            setIsSubmitting(false);
            setIsSubmitted(false);
        };
    }, []);

    // Helper function to rename file with customer name and timestamp
    const renameFileWithCustomerInfo = (
        file: File,
        firstName: string,
        lastName: string,
    ): File => {
        const now = new Date();
        const timestamp =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            "_" +
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");

        const lastDotIndex = file.name.lastIndexOf(".");
        const extension =
            lastDotIndex !== -1 ? file.name.slice(lastDotIndex) : "";

        const cleanFirstName = firstName.trim().replace(/[^a-zA-Z0-9]/g, "");
        const cleanLastName = lastName.trim().replace(/[^a-zA-Z0-9]/g, "");

        const newFileName = `${cleanFirstName}_${cleanLastName}_${timestamp}${extension}`;

        return new File([file], newFileName, { type: file.type });
    };

    const validateField = useCallback(
        (name: string, value: unknown): string => {
            switch (name) {
                case "service":
                    return !value ? "Please select a service" : "";
                case "fileReference":
                    if (!value) return "Please upload a reference file";
                    if (value instanceof File && value.size > 10 * 1024 * 1024)
                        return "File size must be less than 10MB";
                    return "";
                case "requirement":
                    return !value ? "Please describe your requirements" : "";
                case "fileExtension":
                    return !value ? "Please specify the file extension" : "";
                case "prototype":
                    return !value ? "Please select a prototype type" : "";
                case "prototypeOption":
                    return !value ? "Please select a prototype option" : "";
                case "printingTechnology":
                    return !value ? "Please select a printing technology" : "";
                case "material":
                    return !value ? "Please select a material" : "";
                case "materialType":
                    return !value ? "Please specify the material type" : "";
                case "materialDescription":
                    return !value ? "Please describe the material" : "";
                case "quantity":
                    if (!value) return "Please specify the quantity";
                    if (isNaN(Number(value)) || Number(value) < 1)
                        return "Please enter a valid quantity";
                    return "";
                case "productColor":
                    return !value ? "Please specify the product color" : "";
                case "firstName":
                    return !value ? "First name is required" : "";
                case "lastName":
                    return !value ? "Last name is required" : "";
                case "email":
                    if (!value) return "Email is required";
                    if (!/\S+@\S+\.\S+/.test(value as string))
                        return "Please enter a valid email";
                    return "";
                case "phone":
                    return !value ? "Phone number is required" : "";
                default:
                    return "";
            }
        },
        [],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            const error = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        },
        [validateField],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, files } = e.target;
            if (files) {
                const file = files[0];
                const error = validateField(name, file);
                setErrors((prev) => ({ ...prev, [name]: error }));
                if (!error) {
                    setFormData((prev) => ({ ...prev, [name]: file }));
                }
            }
        },
        [validateField],
    );

    const handleSelectChange = useCallback(
        (name: string, value: string) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
            const error = validateField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        },
        [validateField],
    );

    const getFieldsForStep = useCallback((step: number): string[] => {
        switch (step) {
            case 1:
                return ["service"];
            case 2:
                return ["fileReference", "requirement", "fileExtension"];
            case 3:
                return ["prototype", "prototypeOption", "quantity"];
            case 4:
                return ["printingTechnology"];
            case 5:
                return ["material", "materialType", "materialDescription"];
            case 6:
                return ["productColor", "filamentColor", "resinColor"];
            case 7:
                return ["additionalFile"];
            case 8:
                return ["firstName", "lastName", "email", "phone"];
            default:
                return [];
        }
    }, []);

    const validateStep = useCallback(() => {
        const currentFields = getFieldsForStep(currentStep);
        const newErrors: FormErrors = {};

        currentFields.forEach((field) => {
            const error = validateField(
                field,
                formData[field as keyof FormData],
            );
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentStep, formData, validateField, getFieldsForStep]);

    const getTotalSteps = useCallback(() => {
        let total = 8; // Added contact info step
        if (formData.prototype !== "Yes") {
            total -= 1;
        }
        if (!formData.printingTechnology) {
            total -= 1;
        }
        return total;
    }, [formData.prototype, formData.printingTechnology]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep()) return;

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (
                    (key === "fileReference" || key === "additionalFile") &&
                    value instanceof File
                ) {
                    // Rename file with customer name and timestamp before uploading
                    const renamedFile = renameFileWithCustomerInfo(
                        value,
                        formData.firstName,
                        formData.lastName,
                    );
                    formDataToSend.append(key, renamedFile);
                } else if (value instanceof File) {
                    formDataToSend.append(key, value);
                } else if (value) {
                    formDataToSend.append(key, value.toString());
                }
            });

            const response = await fetch("/api/form-responses", {
                method: "POST",
                body: formDataToSend,
            });

            if (!response.ok) {
                setErrors((prev) => ({
                    ...prev,
                    submit: "Failed to submit form. Please try again.",
                }));
                return;
            }

            setIsSubmitted(true);
            onSubmit?.();
        } catch {
            setErrors((prev) => ({
                ...prev,
                submit: "Failed to submit form. Please try again.",
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = useCallback(
        (
            label: string,
            children: React.ReactNode,
            error?: string,
            tooltip?: string,
        ) => {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label className="text-base md:text-lg font-medium">
                            {label}
                        </Label>
                        {tooltip && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="w-[200px] text-sm">
                                            {tooltip}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    {children}
                    {error && (
                        <p className="text-sm text-destructive mt-1 animate-slideIn">
                            {error}
                        </p>
                    )}
                </div>
            );
        },
        [],
    );

    const renderStep = useCallback(
        (step: number) => {
            switch (step) {
                case 1:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Which service do you need?",
                                <RadioGroup
                                    name="service"
                                    value={formData.service}
                                    onValueChange={(value) =>
                                        handleSelectChange("service", value)
                                    }
                                    className="grid gap-3"
                                >
                                    {[
                                        {
                                            value: "3D Designing",
                                            label: "3D Designing",
                                        },
                                        {
                                            value: "3D Sculpting",
                                            label: "3D Sculpting",
                                        },
                                    ].map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={option.value}
                                                className="w-6 h-6"
                                            />
                                            <Label
                                                htmlFor={option.value}
                                                className="flex-grow cursor-pointer text-base"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>,
                                errors.service,
                            )}
                        </div>
                    );

                case 2:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Upload Reference File",
                                <div className="grid gap-4">
                                    <Input
                                        type="file"
                                        name="fileReference"
                                        onChange={handleFileChange}
                                        accept=".obj,.stl,.xt,.stp,.step,.3mf,.jpg,.png,.pdf"
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Max file size: 10MB. Supported formats:
                                        .obj, .stl, .xt, .stp, .step, .3mf,
                                        .jpg, .png, .pdf
                                    </p>
                                </div>,
                                errors.fileReference,
                            )}

                            {renderField(
                                "Project Requirements",
                                <Textarea
                                    name="requirement"
                                    value={formData.requirement}
                                    onChange={handleInputChange}
                                    placeholder="Describe your project requirements..."
                                    className="min-h-[100px] resize-y"
                                />,
                                errors.requirement,
                            )}

                            {renderField(
                                "Required File Extension",
                                <Input
                                    name="fileExtension"
                                    value={formData.fileExtension}
                                    onChange={handleInputChange}
                                    placeholder="e.g., .stl, .obj, .3mf"
                                    className="h-12"
                                />,
                                errors.fileExtension,
                            )}
                        </div>
                    );

                case 3:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Do you need a prototype?",
                                <RadioGroup
                                    name="prototype"
                                    value={formData.prototype}
                                    onValueChange={(value) =>
                                        handleSelectChange("prototype", value)
                                    }
                                    className="grid gap-3"
                                >
                                    {[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ].map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={`prototype-${option.value}`}
                                                className="w-6 h-6"
                                            />
                                            <Label
                                                htmlFor={`prototype-${option.value}`}
                                                className="flex-grow cursor-pointer text-base"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>,
                                errors.prototype,
                            )}

                            {formData.prototype === "Yes" && (
                                <>
                                    {renderField(
                                        "Choose your prototype option",
                                        <RadioGroup
                                            name="prototypeOption"
                                            value={formData.prototypeOption}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "prototypeOption",
                                                    value,
                                                )
                                            }
                                            className="grid gap-3"
                                        >
                                            {[
                                                {
                                                    value: "3D prototype",
                                                    label: "3D prototype",
                                                },
                                                {
                                                    value: "Small Batch Manufacturing",
                                                    label: "Small Batch Manufacturing",
                                                },
                                            ].map((option) => (
                                                <div
                                                    key={option.value}
                                                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent"
                                                >
                                                    <RadioGroupItem
                                                        value={option.value}
                                                        id={`prototypeOption-${option.value}`}
                                                        className="w-6 h-6"
                                                    />
                                                    <Label
                                                        htmlFor={`prototypeOption-${option.value}`}
                                                        className="flex-grow cursor-pointer text-base"
                                                    >
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>,
                                        errors.prototypeOption,
                                    )}

                                    {formData.prototypeOption ===
                                        "Small Batch Manufacturing" &&
                                        renderField(
                                            "Quantity",
                                            <Input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Enter quantity needed"
                                                className="h-12"
                                            />,
                                            errors.quantity,
                                            "Minimum order quantity is 1",
                                        )}
                                </>
                            )}
                        </div>
                    );

                case 4:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Choose 3D Printing Technology",
                                <RadioGroup
                                    name="printingTechnology"
                                    value={formData.printingTechnology}
                                    onValueChange={(value) =>
                                        handleSelectChange(
                                            "printingTechnology",
                                            value,
                                        )
                                    }
                                    className="grid gap-3"
                                >
                                    {[
                                        {
                                            value: "FDM",
                                            label: "FDM (Filament Based)",
                                            tooltip:
                                                "Fused Deposition Modeling - Uses thermoplastic filaments",
                                        },
                                        {
                                            value: "SLA/DLP",
                                            label: "SLA/DLP (Resin Based)",
                                            tooltip:
                                                "Stereolithography/Digital Light Processing - Uses liquid resins",
                                        },
                                        {
                                            value: "SLS",
                                            label: "SLS (Powder Based)",
                                            tooltip:
                                                "Selective Laser Sintering - Uses powdered materials",
                                        },
                                    ].map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={`technology-${option.value}`}
                                                className="w-6 h-6"
                                            />
                                            <div className="flex-grow">
                                                <Label
                                                    htmlFor={`technology-${option.value}`}
                                                    className="flex items-center gap-2 cursor-pointer text-base"
                                                >
                                                    {option.label}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="w-[200px] text-sm">
                                                                    {
                                                                        option.tooltip
                                                                    }
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </Label>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>,
                                errors.printingTechnology,
                            )}
                        </div>
                    );

                case 5:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Select Material",
                                <Select
                                    value={formData.material}
                                    onValueChange={(value) =>
                                        handleSelectChange("material", value)
                                    }
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Choose material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {formData.printingTechnology ===
                                            "FDM" &&
                                            [
                                                { value: "PLA", label: "PLA" },
                                                { value: "ABS", label: "ABS" },
                                                { value: "TPU", label: "TPU" },
                                                {
                                                    value: "PETG",
                                                    label: "PETG",
                                                },
                                                {
                                                    value: "PA",
                                                    label: "PA (Nylon)",
                                                },
                                                {
                                                    value: "Other",
                                                    label: "Other",
                                                },
                                            ].map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        {formData.printingTechnology ===
                                            "SLA/DLP" &&
                                            [
                                                {
                                                    value: "Standard Resin",
                                                    label: "Standard Resin",
                                                },
                                                {
                                                    value: "ABS like Resin",
                                                    label: "ABS like Resin",
                                                },
                                                {
                                                    value: "Flexible Resin",
                                                    label: "Flexible Resin",
                                                },
                                                {
                                                    value: "PLA Resin",
                                                    label: "PLA Resin",
                                                },
                                            ].map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        {formData.printingTechnology ===
                                            "SLS" &&
                                            [
                                                {
                                                    value: "Nylon",
                                                    label: "Nylon",
                                                },
                                                {
                                                    value: "Aluminium",
                                                    label: "Aluminium",
                                                },
                                                {
                                                    value: "Carbonfiber",
                                                    label: "Carbonfiber",
                                                },
                                                {
                                                    value: "TPU 70A",
                                                    label: "TPU 70A",
                                                },
                                                { value: "PP", label: "PP" },
                                            ].map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>,
                                errors.material,
                            )}

                            {formData.material === "PLA" &&
                                renderField(
                                    "PLA Type",
                                    <Select
                                        value={formData.materialType}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "materialType",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select PLA type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                {
                                                    value: "PLA+",
                                                    label: "PLA+",
                                                },
                                                {
                                                    value: "PLA Matte",
                                                    label: "PLA Matte",
                                                },
                                                {
                                                    value: "PLA Glow In Dark",
                                                    label: "PLA Glow In Dark",
                                                },
                                                {
                                                    value: "PLA Wood",
                                                    label: "PLA Wood",
                                                },
                                                {
                                                    value: "PLA Marble",
                                                    label: "PLA Marble",
                                                },
                                                {
                                                    value: "PLA Carbonfiber",
                                                    label: "PLA Carbonfiber",
                                                },
                                            ].map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>,
                                    errors.materialType,
                                )}

                            {formData.material === "Other" &&
                                renderField(
                                    "Describe Material",
                                    <Textarea
                                        name="materialDescription"
                                        value={formData.materialDescription}
                                        onChange={handleInputChange}
                                        placeholder="Please describe your material requirements..."
                                        className="min-h-[100px] resize-y"
                                    />,
                                    errors.materialDescription,
                                )}
                        </div>
                    );

                case 6:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Product Color",
                                <RadioGroup
                                    name="productColor"
                                    value={formData.productColor}
                                    onValueChange={(value) =>
                                        handleSelectChange(
                                            "productColor",
                                            value,
                                        )
                                    }
                                    className="grid gap-3"
                                >
                                    {[
                                        {
                                            value: "Standard",
                                            label: "Standard Color",
                                        },
                                        {
                                            value: "Multicolor",
                                            label: "Multicolor",
                                        },
                                        {
                                            value: "Custom",
                                            label: "Custom Color",
                                        },
                                    ].map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={`color-${option.value}`}
                                                className="w-6 h-6"
                                            />
                                            <Label
                                                htmlFor={`color-${option.value}`}
                                                className="flex-grow cursor-pointer text-base"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>,
                                errors.productColor,
                            )}

                            {formData.printingTechnology === "FDM" &&
                                renderField(
                                    "Filament Color",
                                    <Select
                                        value={formData.filamentColor}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "filamentColor",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select filament color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                {
                                                    value: "Transparent",
                                                    label: "Transparent",
                                                },
                                                {
                                                    value: "Black",
                                                    label: "Black",
                                                },
                                                {
                                                    value: "Grey",
                                                    label: "Grey",
                                                },
                                                {
                                                    value: "White",
                                                    label: "White",
                                                },
                                                { value: "Red", label: "Red" },
                                                {
                                                    value: "Orange",
                                                    label: "Orange",
                                                },
                                                {
                                                    value: "Yellow",
                                                    label: "Yellow",
                                                },
                                                {
                                                    value: "Green",
                                                    label: "Green",
                                                },
                                            ].map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>,
                                )}

                            {formData.printingTechnology === "SLA/DLP" &&
                                renderField(
                                    "Resin Color",
                                    <Select
                                        value={formData.resinColor}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "resinColor",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select resin color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                {
                                                    value: "Transparent",
                                                    label: "Transparent",
                                                },
                                                {
                                                    value: "Black",
                                                    label: "Black",
                                                },
                                                {
                                                    value: "Grey",
                                                    label: "Grey",
                                                },
                                                {
                                                    value: "White",
                                                    label: "White",
                                                },
                                                {
                                                    value: "Beige",
                                                    label: "Beige",
                                                },
                                                {
                                                    value: "Skin",
                                                    label: "Skin",
                                                },
                                            ].map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>,
                                )}
                        </div>
                    );

                case 7:
                    return (
                        <div className="space-y-6">
                            {renderField(
                                "Additional Files (Optional)",
                                <div className="grid gap-4">
                                    <Input
                                        type="file"
                                        name="additionalFile"
                                        onChange={handleFileChange}
                                        accept=".obj,.stl,.xt,.stp,.step,.3mf,.jpg,.png,.pdf"
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Upload any additional reference files or
                                        documentation. Supported formats: .obj,
                                        .stl, .xt, .stp, .step, .3mf, .jpg,
                                        .png, .pdf
                                    </p>
                                </div>,
                            )}
                        </div>
                    );

                case 8:
                    return (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderField(
                                    "First Name",
                                    <Input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your first name"
                                        className="h-12"
                                    />,
                                    errors.firstName,
                                )}

                                {renderField(
                                    "Last Name",
                                    <Input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your last name"
                                        className="h-12"
                                    />,
                                    errors.lastName,
                                )}
                            </div>

                            {renderField(
                                "Email Address",
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className="h-12"
                                />,
                                errors.email,
                            )}

                            {renderField(
                                "Phone Number",
                                <Input
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number"
                                    className="h-12"
                                />,
                                errors.phone,
                            )}

                            {renderField(
                                "Company Name (Optional)",
                                <Input
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Enter your company name"
                                    className="h-12"
                                />,
                            )}
                        </div>
                    );

                default:
                    return null;
            }
        },
        [
            formData,
            errors,
            handleInputChange,
            handleFileChange,
            handleSelectChange,
            renderField,
        ],
    );

    if (isSubmitted) {
        return (
            <div className="text-center space-y-4 p-6">
                <h2 className="text-2xl font-semibold">Thank You!</h2>
                <p className="text-muted-foreground">
                    Your request has been submitted successfully. We will get
                    back to you soon.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <ScrollArea className="h-[calc(100vh-250px)] md:h-auto px-1">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="border-none shadow-none">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-xl md:text-2xl">
                                3D Service Request
                            </CardTitle>
                            <Progress
                                value={(currentStep / getTotalSteps()) * 100}
                                className="h-2"
                            />
                            <p className="text-sm text-muted-foreground">
                                Step {currentStep} of {getTotalSteps()}
                            </p>
                        </CardHeader>
                        <CardContent>{renderStep(currentStep)}</CardContent>
                    </Card>

                    {errors.submit && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors.submit}</AlertDescription>
                        </Alert>
                    )}

                    <div className="sticky bottom-0 bg-background pt-4 border-t">
                        <div className="flex justify-between gap-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setCurrentStep((prev) => prev - 1)
                                    }
                                    className="w-full md:w-32 h-12"
                                >
                                    Previous
                                </Button>
                            )}
                            {currentStep < getTotalSteps() ? (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (validateStep()) {
                                            setCurrentStep((prev) => prev + 1);
                                        }
                                    }}
                                    className="w-full md:w-32 h-12"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={cn(
                                        "w-full md:w-32 h-12",
                                        isSubmitting &&
                                            "opacity-50 cursor-not-allowed",
                                    )}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </ScrollArea>
        </div>
    );
}
