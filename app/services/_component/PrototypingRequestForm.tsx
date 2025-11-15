"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface FormData {
  projectType: string;
  technology: string;
  material: string;
  materialSubtype: string;
  color: string;
  filamentColor: string;
  resinColor: string;
  customMaterial: string;
  designFile: File | null;
  specialRequirements: string;
  bulkQuantity: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
}

const initialFormData: FormData = {
  projectType: "",
  technology: "",
  material: "",
  materialSubtype: "",
  color: "",
  filamentColor: "",
  resinColor: "",
  customMaterial: "",
  designFile: null,
  specialRequirements: "",
  bulkQuantity: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  company: "",
};

export function PrototypingRequestForm({
  onSubmit,
}: {
  onSubmit?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 9;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, designFile: file }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.projectType) {
          newErrors.projectType = "Please select a project type";
        }
        break;
      case 2:
        if (!formData.technology) {
          newErrors.technology = "Please select a technology";
        }
        break;
      case 3:
        if (!formData.material) {
          newErrors.material = "Please select a material";
        }
        break;
      case 4:
        if (!formData.color) {
          newErrors.color = "Please select a color option";
        }
        break;
      case 6:
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
      setStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 7) return; // Only process submission on the review step

    if (!validateStep()) return;

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value);
        } else {
          submitData.append(key, String(value));
        }
      });

      // Replace with your actual API endpoint
      const response = await fetch("/api/prototyping-request", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        console.log("Form submitted successfully");
        setIsSubmitted(true);
        setStep(totalSteps - 1);
        onSubmit?.();
      } else {
        console.error("Failed to submit form");
        setErrors({ submit: "Failed to submit form. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome Screen
        return (
          <>
            <CardHeader>
              <CardTitle>Welcome to the 3D Prototyping Request Form</CardTitle>
              <CardDescription>
                This form will guide you through submitting your specifications
                for 3D prototyping projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please have the following information ready:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Project type details</li>
                <li>Preferred 3D printing technology</li>
                <li>Material specifications</li>
                <li>Color preferences</li>
                <li>Any additional design files or requirements</li>
              </ul>
            </CardContent>
          </>
        );

      case 1: // Project Type Selection
        return (
          <>
            <CardHeader>
              <CardTitle>Project Type Selection</CardTitle>
              <CardDescription>Choose your project type.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.projectType}
                onValueChange={(value) =>
                  handleSelectChange("projectType", value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3D prototype" id="3D prototype" />
                  <Label htmlFor="3D prototype">3D prototype</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Small Batch Manufacturing"
                    id="Small Batch Manufacturing"
                  />
                  <Label htmlFor="Small Batch Manufacturing">
                    Small Batch Manufacturing
                  </Label>
                </div>
              </RadioGroup>
              {errors.projectType && (
                <p className="text-sm text-red-500 mt-2">
                  {errors.projectType}
                </p>
              )}
            </CardContent>
          </>
        );

      case 2: // Technology Choice
        return (
          <>
            <CardHeader>
              <CardTitle>3D Printing Technology</CardTitle>
              <CardDescription>
                Select your preferred 3D printing technology.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.technology}
                onValueChange={(value) =>
                  handleSelectChange("technology", value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FDM" id="FDM" />
                  <Label htmlFor="FDM">FDM (Filament Based)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Fused Deposition Modeling: Uses thermoplastic
                          filaments.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SLA/DLP" id="SLA/DLP" />
                  <Label htmlFor="SLA/DLP">SLA/DLP (Resin Based)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Stereolithography/Digital Light Processing: Uses
                          liquid resins.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SLS" id="SLS" />
                  <Label htmlFor="SLS">SLS (Powder Based)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Selective Laser Sintering: Uses powdered materials.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Others" id="Others" />
                  <Label htmlFor="Others">Others</Label>
                </div>
              </RadioGroup>
              {errors.technology && (
                <p className="text-sm text-red-500 mt-2">{errors.technology}</p>
              )}
            </CardContent>
          </>
        );

      case 3: // Material Selection
        return (
          <>
            <CardHeader>
              <CardTitle>Material Selection</CardTitle>
              <CardDescription>
                Choose the material based on the selected technology.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.material}
                onValueChange={(value) => handleSelectChange("material", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {formData.technology === "FDM" && (
                    <>
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="TPU">TPU</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="PA">PA (Nylon)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                  {formData.technology === "SLA/DLP" && (
                    <>
                      <SelectItem value="Standard Resin">
                        Standard Resin
                      </SelectItem>
                      <SelectItem value="ABS like Resin">
                        ABS like Resin
                      </SelectItem>
                      <SelectItem value="Flexible Resin">
                        Flexible Resin
                      </SelectItem>
                      <SelectItem value="PLA Resin">PLA Resin</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                  {formData.technology === "SLS" && (
                    <>
                      <SelectItem value="Nylon">Nylon</SelectItem>
                      <SelectItem value="Aluminium">Aluminium</SelectItem>
                      <SelectItem value="Carbonfiber">Carbonfiber</SelectItem>
                      <SelectItem value="TPU 70A">TPU 70A</SelectItem>
                      <SelectItem value="PP">PP</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.material && (
                <p className="text-sm text-red-500 mt-2">{errors.material}</p>
              )}

              {formData.material && formData.material !== "Other" && (
                <div className="mt-4">
                  <Label>Material Subtype</Label>
                  <Select
                    value={formData.materialSubtype}
                    onValueChange={(value) =>
                      handleSelectChange("materialSubtype", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material subtype" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.material === "PLA" && (
                        <>
                          <SelectItem value="PLA+">PLA+</SelectItem>
                          <SelectItem value="PLA Matte">PLA Matte</SelectItem>
                          <SelectItem value="PLA Glow In Dark">
                            PLA Glow In Dark
                          </SelectItem>
                          <SelectItem value="PLA Wood">PLA Wood</SelectItem>
                          <SelectItem value="PLA Marble">PLA Marble</SelectItem>
                          <SelectItem value="PLA Carbonfiber">
                            PLA Carbonfiber
                          </SelectItem>
                        </>
                      )}
                      {formData.material === "ABS" && (
                        <>
                          <SelectItem value="ABS">ABS</SelectItem>
                          <SelectItem value="ABS GF">
                            ABS GF (Glass Filled)
                          </SelectItem>
                          <SelectItem value="ABS CF">
                            ABS CF (Carbon Fiber)
                          </SelectItem>
                          <SelectItem value="ABS FR">
                            ABS FR (Flame Retardant)
                          </SelectItem>
                        </>
                      )}
                      {formData.material === "TPU" && (
                        <>
                          <SelectItem value="TPU 95A">TPU 95A</SelectItem>
                          <SelectItem value="TPU 85A">TPU 85A</SelectItem>
                        </>
                      )}
                      {formData.material === "PETG" && (
                        <>
                          <SelectItem value="PETG">PETG</SelectItem>
                          <SelectItem value="PETG GF">
                            PETG GF (Glass Filled)
                          </SelectItem>
                          <SelectItem value="PETG CF">
                            PETG CF (Carbon Fiber)
                          </SelectItem>
                          <SelectItem value="PETG FR">
                            PETG FR (Flame Retardant)
                          </SelectItem>
                        </>
                      )}
                      {formData.material === "PA" && (
                        <>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PA GF">
                            PA GF (Glass Filled)
                          </SelectItem>
                          <SelectItem value="PA CF">
                            PA CF (Carbon Fiber)
                          </SelectItem>
                          <SelectItem value="PA FR">
                            PA FR (Flame Retardant)
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.material === "Other" && (
                <div className="mt-4">
                  <Label htmlFor="customMaterial">Describe the material</Label>
                  <Textarea
                    id="customMaterial"
                    name="customMaterial"
                    value={formData.customMaterial}
                    onChange={handleInputChange}
                    placeholder="Please describe the material you want to use"
                  />
                </div>
              )}
            </CardContent>
          </>
        );

      case 4: // Color and Detail Customization
        return (
          <>
            <CardHeader>
              <CardTitle>Color Selection</CardTitle>
              <CardDescription>
                Choose your preferred colors and customization options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Product Color</Label>
                  <RadioGroup
                    value={formData.color}
                    onValueChange={(value) =>
                      handleSelectChange("color", value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Standard" id="standard" />
                      <Label htmlFor="standard">Standard Color</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Multicolor" id="multicolor" />
                      <Label htmlFor="multicolor">Multicolor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Custom" id="custom" />
                      <Label htmlFor="custom">Custom Color</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.technology === "FDM" && (
                  <div>
                    <Label>Filament Color</Label>
                    <Select
                      value={formData.filamentColor}
                      onValueChange={(value) =>
                        handleSelectChange("filamentColor", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select filament color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transparent">Transparent</SelectItem>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="Grey">Grey</SelectItem>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Red">Red</SelectItem>
                        <SelectItem value="Orange">Orange</SelectItem>
                        <SelectItem value="Yellow">Yellow</SelectItem>
                        <SelectItem value="Green">Green</SelectItem>
                        <SelectItem value="Sky Blue">Sky Blue</SelectItem>
                        <SelectItem value="Blue">Blue</SelectItem>
                        <SelectItem value="Pink">Pink</SelectItem>
                        <SelectItem value="Purple">Purple</SelectItem>
                        <SelectItem value="Brown">Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.technology === "SLA/DLP" && (
                  <div>
                    <Label>Resin Color</Label>
                    <Select
                      value={formData.resinColor}
                      onValueChange={(value) =>
                        handleSelectChange("resinColor", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resin color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transparent">Transparent</SelectItem>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="Grey">Grey</SelectItem>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Beige">Beige</SelectItem>
                        <SelectItem value="Skin">Skin</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        );

      case 5: // Additional Specifications
        return (
          <>
            <CardHeader>
              <CardTitle>Additional Specifications</CardTitle>
              <CardDescription>
                Upload design files and provide any special requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="designFile">
                    Upload Design File (if available)
                  </Label>
                  <Input
                    id="designFile"
                    type="file"
                    onChange={handleFileChange}
                    accept=".stl,.obj,.step,.stp"
                  />
                </div>
                <div>
                  <Label htmlFor="specialRequirements">
                    Special Requirements
                  </Label>
                  <Textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Enter any special requirements or notes"
                  />
                </div>
                <div>
                  <Label htmlFor="bulkQuantity">
                    Do you need this in bulk quantity?
                  </Label>
                  <Input
                    id="bulkQuantity"
                    name="bulkQuantity"
                    value={formData.bulkQuantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity if applicable"
                  />
                </div>
              </div>
            </CardContent>
          </>
        );

      case 6: // Contact Information
        return (
          <>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Please provide your contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="company">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </>
        );

      case 7: // Review and Submit
        return (
          <>
            <CardHeader>
              <CardTitle>Review Your Request</CardTitle>
              <CardDescription>
                Please review your information before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Project Details</h3>
                  <p>Project Type: {formData.projectType}</p>
                  <p>Technology: {formData.technology}</p>
                  <p>Material: {formData.material}</p>
                  {formData.materialSubtype && (
                    <p>Material Subtype: {formData.materialSubtype}</p>
                  )}
                  {formData.customMaterial && (
                    <p>Custom Material: {formData.customMaterial}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Color Selection</h3>
                  <p>Product Color: {formData.color}</p>
                  {formData.filamentColor && (
                    <p>Filament Color: {formData.filamentColor}</p>
                  )}
                  {formData.resinColor && (
                    <p>Resin Color: {formData.resinColor}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Additional Specifications</h3>
                  <p>
                    Design File:{" "}
                    {formData.designFile
                      ? formData.designFile.name
                      : "Not provided"}
                  </p>
                  <p>
                    Special Requirements:{" "}
                    {formData.specialRequirements || "None"}
                  </p>
                  <p>
                    Bulk Quantity: {formData.bulkQuantity || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Contact Information</h3>
                  <p>
                    Name: {formData.firstName} {formData.lastName}
                  </p>
                  <p>Email: {formData.email}</p>
                  <p>Phone: {formData.phone}</p>
                  {formData.company && <p>Company: {formData.company}</p>}
                </div>
              </div>
              {errors.submit && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </>
        );

      case 8: // Confirmation
        return (
          <>
            <CardHeader>
              <CardTitle>Thank You!</CardTitle>
              <CardDescription>
                Your 3D prototyping request has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                We have received your request and will get back to you shortly.
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
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              {step < totalSteps - 2 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : step === 7 ? (
                <Button type="submit">Submit Request</Button>
              ) : null}
            </>
          )}
        </CardFooter>
      </Card>
      {!isSubmitted && (
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
