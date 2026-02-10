"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface FormData {
    // File Upload
    designFile: File | null;

    // Project Specifications
    quantity: string;
    requirements: string;

    // Technology and Material
    technology: string;
    material: string;
    materialSubtype: string;

    // Colors
    productColor: string;
    filamentColor: string;
    resinColor: string;

    // Contact Information
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    company: string;
}

const initialFormData: FormData = {
    designFile: null,
    quantity: "",
    requirements: "",
    technology: "",
    material: "",
    materialSubtype: "",
    productColor: "",
    filamentColor: "",
    resinColor: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
};

export function SmallBatchManufacturingForm({
    onSubmit,
}: {
    onSubmit?: () => void;
}) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const totalSteps = 7; // Including introduction, review, and confirmation steps

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, designFile: file }));
    };

    // Helper function to rename file with customer name and timestamp
    const renameFileWithCustomerInfo = (
        file: File,
        firstName: string,
        lastName: string,
    ): File => {
        // Generate timestamp in format YYYYMMDD_HHMMSS
        const now = new Date();
        const timestamp =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            "_" +
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");

        // Extract extension from original file
        const lastDotIndex = file.name.lastIndexOf(".");
        const extension =
            lastDotIndex !== -1 ? file.name.slice(lastDotIndex) : "";

        // Clean customer name (remove special characters, replace spaces with underscores)
        const cleanFirstName = firstName.trim().replace(/[^a-zA-Z0-9]/g, "");
        const cleanLastName = lastName.trim().replace(/[^a-zA-Z0-9]/g, "");

        // Create new filename: FirstName_LastName_YYYYMMDD_HHMMSS.extension
        const newFileName = `${cleanFirstName}_${cleanLastName}_${timestamp}${extension}`;

        // Create a new File object with the renamed filename
        return new File([file], newFileName, { type: file.type });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1: // File Upload & Quantity
                if (!formData.designFile) {
                    newErrors.designFile = "Please upload a design file";
                }
                if (!formData.quantity) {
                    newErrors.quantity = "Please enter the quantity";
                }
                break;
            case 2: // Technology and Material
                if (!formData.technology) {
                    newErrors.technology = "Please select a technology";
                }
                if (!formData.material) {
                    newErrors.material = "Please select a material";
                }
                break;
            case 3: // Colors
                if (!formData.productColor) {
                    newErrors.productColor = "Please select a product color";
                }
                break;
            case 4: // Contact Information
                if (!formData.firstName) {
                    newErrors.firstName = "First name is required";
                }
                if (!formData.lastName) {
                    newErrors.lastName = "Last name is required";
                }
                if (!formData.email) {
                    newErrors.email = "Email is required";
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    newErrors.email = "Please enter a valid email";
                }
                if (!formData.phone) {
                    newErrors.phone = "Phone number is required";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep((prev) => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only process submission if we're on the review step
        if (step !== 5) {
            return;
        }

        if (!validateStep()) return;

        try {
            const submitData = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === "designFile" && value instanceof File) {
                    // Rename file with customer name and timestamp before uploading
                    const renamedFile = renameFileWithCustomerInfo(
                        value,
                        formData.firstName,
                        formData.lastName,
                    );
                    submitData.append(key, renamedFile);
                } else if (value instanceof File) {
                    submitData.append(key, value);
                } else {
                    submitData.append(key, String(value));
                }
            });

            const response = await fetch("/api/small-batch-manufacturing", {
                method: "POST",
                body: submitData,
            });

            if (response.ok) {
                console.log("Form submitted successfully");
                setIsSubmitted(true);
                setTimeout(() => {
                    setStep(totalSteps - 1);
                }, 100);
                onSubmit?.();
            } else {
                console.error("Failed to submit form");
                setErrors({
                    submit: "Failed to submit form. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setErrors({ submit: "An error occurred. Please try again." });
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Introduction
                return (
                    <>
                        <CardHeader>
                            <CardTitle>
                                Small Batch Manufacturing Request
                            </CardTitle>
                            <CardDescription>
                                Welcome! This form will guide you through
                                specifying your manufacturing needs. Please have
                                your design files ready. The process takes about
                                5-10 minutes to complete.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    What you will need:
                                </h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Design files (.obj, .stl, .xt, .stp,
                                        .step, .3mf)
                                    </li>
                                    <li>Quantity requirements</li>
                                    <li>Material preferences</li>
                                    <li>Contact information</li>
                                </ul>
                            </div>
                        </CardContent>
                    </>
                );

            case 1: // File Upload & Project Specifications
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Project Specifications</CardTitle>
                            <CardDescription>
                                Start by uploading your design files and
                                specifying the quantity needed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="designFile">
                                    Design Files (Max 10MB)
                                </Label>
                                <Input
                                    id="designFile"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".obj,.stl,.xt,.stp,.step,.3mf"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Supported formats: .obj, .stl, .xt, .stp,
                                    .step, .3mf
                                </p>
                                {errors.designFile && (
                                    <p className="text-sm text-red-500">
                                        {errors.designFile}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">
                                    Number of Pieces Required
                                </Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-red-500">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="requirements">
                                    Particular Requirements
                                </Label>
                                <Textarea
                                    id="requirements"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleInputChange}
                                    placeholder="Enter any specific requirements or notes"
                                />
                            </div>
                        </CardContent>
                    </>
                );

            case 2: // Technology and Material Selection
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Technology and Material</CardTitle>
                            <CardDescription>
                                Select your preferred 3D printing technology and
                                material.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>3D Printing Technology</Label>
                                <RadioGroup
                                    value={formData.technology}
                                    onValueChange={(value) =>
                                        handleSelectChange("technology", value)
                                    }
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="FDM" id="FDM" />
                                        <Label htmlFor="FDM">
                                            FDM (Filament Based)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="SLA/DLP"
                                            id="SLA/DLP"
                                        />
                                        <Label htmlFor="SLA/DLP">
                                            SLA/DLP (Resin Based)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="SLS" id="SLS" />
                                        <Label htmlFor="SLS">
                                            SLS (Powder Based)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="Others"
                                            id="Others"
                                        />
                                        <Label htmlFor="Others">Others</Label>
                                    </div>
                                </RadioGroup>
                                {errors.technology && (
                                    <p className="text-sm text-red-500">
                                        {errors.technology}
                                    </p>
                                )}
                            </div>

                            {formData.technology && (
                                <div className="space-y-2">
                                    <Label>Material Selection</Label>
                                    <Select
                                        value={formData.material}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "material",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formData.technology === "FDM" && (
                                                <>
                                                    <SelectItem value="PLA">
                                                        PLA
                                                    </SelectItem>
                                                    <SelectItem value="ABS">
                                                        ABS
                                                    </SelectItem>
                                                    <SelectItem value="TPU">
                                                        TPU
                                                    </SelectItem>
                                                    <SelectItem value="PETG">
                                                        PETG
                                                    </SelectItem>
                                                    <SelectItem value="PA">
                                                        PA (Nylon)
                                                    </SelectItem>
                                                    <SelectItem value="Other">
                                                        Other
                                                    </SelectItem>
                                                </>
                                            )}
                                            {formData.technology ===
                                                "SLA/DLP" && (
                                                <>
                                                    <SelectItem value="Standard Resin">
                                                        Standard Resin
                                                    </SelectItem>
                                                    <SelectItem value="ABS-like Resin">
                                                        ABS-like Resin
                                                    </SelectItem>
                                                    <SelectItem value="Flexible Resin">
                                                        Flexible Resin
                                                    </SelectItem>
                                                    <SelectItem value="PLA Resin">
                                                        PLA Resin
                                                    </SelectItem>
                                                    <SelectItem value="Other">
                                                        Other
                                                    </SelectItem>
                                                </>
                                            )}
                                            {formData.technology === "SLS" && (
                                                <>
                                                    <SelectItem value="Nylon">
                                                        Nylon
                                                    </SelectItem>
                                                    <SelectItem value="Aluminium">
                                                        Aluminium
                                                    </SelectItem>
                                                    <SelectItem value="Carbonfiber">
                                                        Carbonfiber
                                                    </SelectItem>
                                                    <SelectItem value="TPU 70A">
                                                        TPU 70A
                                                    </SelectItem>
                                                    <SelectItem value="PP">
                                                        PP
                                                    </SelectItem>
                                                    <SelectItem value="Other">
                                                        Other
                                                    </SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.material && (
                                        <p className="text-sm text-red-500">
                                            {errors.material}
                                        </p>
                                    )}
                                </div>
                            )}

                            {formData.material && (
                                <div className="space-y-2">
                                    <Label>Material Subtype</Label>
                                    <Select
                                        value={formData.materialSubtype}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "materialSubtype",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select material subtype" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formData.material === "PLA" && (
                                                <>
                                                    <SelectItem value="PLA+">
                                                        PLA+
                                                    </SelectItem>
                                                    <SelectItem value="PLA Matte">
                                                        PLA Matte
                                                    </SelectItem>
                                                    <SelectItem value="PLA Glow In Dark">
                                                        PLA Glow In Dark
                                                    </SelectItem>
                                                    <SelectItem value="PLA Wood">
                                                        PLA Wood
                                                    </SelectItem>
                                                    <SelectItem value="PLA Marble">
                                                        PLA Marble
                                                    </SelectItem>
                                                    <SelectItem value="PLA Carbonfiber">
                                                        PLA Carbonfiber
                                                    </SelectItem>
                                                </>
                                            )}
                                            {formData.material === "ABS" && (
                                                <>
                                                    <SelectItem value="ABS">
                                                        ABS
                                                    </SelectItem>
                                                    <SelectItem value="ABS GF">
                                                        ABS GF
                                                    </SelectItem>
                                                    <SelectItem value="ABS CF">
                                                        ABS CF
                                                    </SelectItem>
                                                    <SelectItem value="ABS FR">
                                                        ABS FR
                                                    </SelectItem>
                                                </>
                                            )}
                                            {formData.material === "TPU" && (
                                                <>
                                                    <SelectItem value="TPU 95A">
                                                        TPU 95A
                                                    </SelectItem>
                                                    <SelectItem value="TPU 85A">
                                                        TPU 85A
                                                    </SelectItem>
                                                </>
                                            )}
                                            {formData.material === "PETG" && (
                                                <>
                                                    <SelectItem value="PETG">
                                                        PETG
                                                    </SelectItem>
                                                    <SelectItem value="PETG GF">
                                                        PETG GF
                                                    </SelectItem>
                                                    <SelectItem value="PETG CF">
                                                        PETG CF
                                                    </SelectItem>
                                                    <SelectItem value="PETG FR">
                                                        PETG FR
                                                    </SelectItem>
                                                </>
                                            )}
                                            {formData.material === "PA" && (
                                                <>
                                                    <SelectItem value="Nylon 6">
                                                        Nylon 6
                                                    </SelectItem>
                                                    <SelectItem value="Nylon 66">
                                                        Nylon 66
                                                    </SelectItem>
                                                    <SelectItem value="PA Mineral filled">
                                                        PA Mineral filled
                                                    </SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </>
                );

            case 3: // Colors
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Color Selection</CardTitle>
                            <CardDescription>
                                Choose your preferred colors for the product.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Product Color</Label>
                                <RadioGroup
                                    value={formData.productColor}
                                    onValueChange={(value) =>
                                        handleSelectChange(
                                            "productColor",
                                            value,
                                        )
                                    }
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="Standard"
                                            id="standard"
                                        />
                                        <Label htmlFor="standard">
                                            Standard Color
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="Multicolor"
                                            id="multicolor"
                                        />
                                        <Label htmlFor="multicolor">
                                            Multicolor
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="Custom"
                                            id="custom"
                                        />
                                        <Label htmlFor="custom">
                                            Custom Color
                                        </Label>
                                    </div>
                                </RadioGroup>
                                {errors.productColor && (
                                    <p className="text-sm text-red-500">
                                        {errors.productColor}
                                    </p>
                                )}
                            </div>

                            {formData.technology === "FDM" && (
                                <div className="space-y-2">
                                    <Label>Filament Color</Label>
                                    <Select
                                        value={formData.filamentColor}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "filamentColor",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select filament color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Transparent">
                                                Transparent
                                            </SelectItem>
                                            <SelectItem value="Black">
                                                Black
                                            </SelectItem>
                                            <SelectItem value="Grey">
                                                Grey
                                            </SelectItem>
                                            <SelectItem value="White">
                                                White
                                            </SelectItem>
                                            <SelectItem value="Red">
                                                Red
                                            </SelectItem>
                                            <SelectItem value="Blue">
                                                Blue
                                            </SelectItem>
                                            <SelectItem value="Green">
                                                Green
                                            </SelectItem>
                                            <SelectItem value="Yellow">
                                                Yellow
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {formData.technology === "SLA/DLP" && (
                                <div className="space-y-2">
                                    <Label>Resin Color</Label>
                                    <Select
                                        value={formData.resinColor}
                                        onValueChange={(value) =>
                                            handleSelectChange(
                                                "resinColor",
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select resin color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Transparent">
                                                Transparent
                                            </SelectItem>
                                            <SelectItem value="Black">
                                                Black
                                            </SelectItem>
                                            <SelectItem value="Grey">
                                                Grey
                                            </SelectItem>
                                            <SelectItem value="White">
                                                White
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </>
                );

            case 4: // Contact Information
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>
                                Please provide your contact details so we can
                                get back to you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First Name
                                    </Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                    />
                                    {errors.firstName && (
                                        <p className="text-sm text-red-500">
                                            {errors.firstName}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                    />
                                    {errors.lastName && (
                                        <p className="text-sm text-red-500">
                                            {errors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">
                                    Company Name (Optional)
                                </Label>
                                <Input
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                    </>
                );

            case 5: // Review
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Review Your Request</CardTitle>
                            <CardDescription>
                                Please review your information before
                                submitting.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium">
                                        Project Specifications
                                    </h3>
                                    <p>Quantity: {formData.quantity}</p>
                                    <p>File: {formData.designFile?.name}</p>
                                    {formData.requirements && (
                                        <p>
                                            Requirements:{" "}
                                            {formData.requirements}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium">
                                        Technology and Material
                                    </h3>
                                    <p>Technology: {formData.technology}</p>
                                    <p>Material: {formData.material}</p>
                                    {formData.materialSubtype && (
                                        <p>
                                            Material Subtype:{" "}
                                            {formData.materialSubtype}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium">
                                        Color Selection
                                    </h3>
                                    <p>
                                        Product Color: {formData.productColor}
                                    </p>
                                    {formData.filamentColor && (
                                        <p>
                                            Filament Color:{" "}
                                            {formData.filamentColor}
                                        </p>
                                    )}
                                    {formData.resinColor && (
                                        <p>
                                            Resin Color: {formData.resinColor}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium">
                                        Contact Information
                                    </h3>
                                    <p>
                                        Name: {formData.firstName}{" "}
                                        {formData.lastName}
                                    </p>
                                    <p>Email: {formData.email}</p>
                                    <p>Phone: {formData.phone}</p>
                                    {formData.company && (
                                        <p>Company: {formData.company}</p>
                                    )}
                                </div>
                            </div>
                            {errors.submit && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {errors.submit}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </>
                );
            case 6: // Confirmation
                return (
                    <>
                        <CardHeader>
                            <CardTitle>Thank You!</CardTitle>
                            <CardDescription>
                                Your small batch manufacturing request has been
                                submitted successfully.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>
                                We have received your request and will get back
                                to you shortly.
                            </p>
                            <p>
                                Your reference number is:{" "}
                                {/* Add a reference number if available */}
                            </p>
                        </CardContent>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="w-full max-w-2xl mx-auto">
                {renderStep()}
                <CardFooter className="flex justify-between">
                    {!isSubmitted && (
                        <>
                            {step > 0 && step < totalSteps - 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                >
                                    Previous
                                </Button>
                            )}
                            {step < totalSteps - 2 ? (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        nextStep();
                                    }}
                                >
                                    Next
                                </Button>
                            ) : step === 5 ? (
                                <Button type="submit">Submit Request</Button>
                            ) : null}
                        </>
                    )}
                </CardFooter>
            </Card>
            {!isSubmitted && step < totalSteps - 1 && (
                <div className="mt-4">
                    <Progress
                        value={(step / (totalSteps - 1)) * 100}
                        className="w-full"
                    />
                </div>
            )}
        </form>
    );
}
