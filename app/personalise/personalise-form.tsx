"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Flame,
  Home,
  Lamp,
  Gamepad,
  Building2,
  Smartphone,
  Trophy,
  Key,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  User,
  Phone,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
interface PersonaliseFormProps {
  userSession: Session | null;
}

interface FormErrors {
  isAware?: string;
  categories?: string;
  statueDetails?: string;
  wantMore?: string;
  contactDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

type FormData = {
  isAware: string;
  categories: string[];
  statueDetails: string;
  wantMore: string;
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
};

export default function PersonaliseForm({ userSession }: PersonaliseFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    isAware: "",
    categories: [],
    statueDetails: "",
    wantMore: "",
    contactDetails: {
      name: userSession?.user?.name || "",
      email: userSession?.user?.email || "",
      phone: "",
    },
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [showThankYou, setShowThankYou] = useState(false);

  const totalSteps = 5; // Added one step for contact details

  const categories = [
    { id: "statues", label: "Statues", icon: Flame },
    { id: "home-decor", label: "Home Decor", icon: Home },
    { id: "lamps", label: "Lamps", icon: Lamp },
    { id: "gaming", label: "Gaming Accessories", icon: Gamepad },
    { id: "household", label: "Household Utilities", icon: Building2 },
    { id: "mobile", label: "Mobile Accessories", icon: Smartphone },
    { id: "figurines", label: "Figurines", icon: Trophy },
    { id: "keychains", label: "Keychains", icon: Key },
  ];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1 && !formData.isAware) {
      newErrors.isAware = "Please select an option";
    }

    if (currentStep === 2 && formData.categories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }

    if (currentStep === 3 && !formData.statueDetails) {
      newErrors.statueDetails = "Please provide statue details";
    }

    if (currentStep === 4 && !formData.wantMore) {
      newErrors.wantMore = "Please select an option";
    }

    if (currentStep === 5) {
      const contactErrors: FormErrors["contactDetails"] = {};

      if (!formData.contactDetails.name) {
        contactErrors.name = "Name is required";
      }
      if (!formData.contactDetails.email) {
        contactErrors.email = "Email is required";
      } else if (
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.contactDetails.email)
      ) {
        contactErrors.email = "Please enter a valid email address";
      }
      if (!formData.contactDetails.phone) {
        contactErrors.phone = "Phone number is required";
      } else if (
        !/^\d{10}$/.test(formData.contactDetails.phone.replace(/[\s\-()]/g, "").replace(/^\+\d{1,3}/, "").replace(/^0/, ""))
      ) {
        contactErrors.phone = "Please enter a valid 10-digit phone number";
      }

      if (Object.keys(contactErrors).length > 0) {
        newErrors.contactDetails = contactErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step === totalSteps) {
      handleSubmit();
    } else {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/personalise-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: userSession?.user?.id,
        }),
      });

      if (response.ok) {
        setShowThankYou(true);
        toast({
          title: "Success!",
          description: "Your preferences have been saved successfully.",
        });
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "There was a problem saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom radio button style
  const radioBase =
    "relative flex items-center cursor-pointer group py-2 px-3 rounded-lg transition border-2 border-transparent hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400";
  const radioCircleBase =
    "w-6 h-6 flex items-center justify-center rounded-full border-2 transition mr-3";

  // For category icons, set color based on selection
  const getCategoryIconColor = (selected: boolean) =>
    selected ? "text-blue-500" : "text-gray-400 group-hover:text-blue-400";

  if (showThankYou) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-xl shadow-lg">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Thank you!</h2>
        <p className="text-lg text-gray-700 mb-4 text-center max-w-xl">
          Your preferences have been submitted successfully. We appreciate your
          input and will use it to personalize your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="relative flex items-center justify-between mb-8 px-2"
        style={{ minHeight: 56 }}
      >
        <div
          className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full z-0"
          style={{ transform: "translateY(-50%)" }}
        />
        <div
          className="absolute top-1/2 left-0 h-2 bg-blue-500 rounded-full z-10 transition-all duration-300"
          style={{
            width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
            transform: "translateY(-50%)",
          }}
        />
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`relative z-20 flex flex-col items-center w-1/5`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg transition-all duration-300
                ${
                  i + 1 === step
                    ? "bg-blue-600 text-white shadow-lg border-4 border-white"
                    : i + 1 < step
                      ? "bg-blue-100 text-blue-600 border-4 border-white"
                      : "bg-gray-100 text-gray-400 border-4 border-white"
                }
              `}
              style={{
                boxShadow:
                  i + 1 === step
                    ? "0 2px 8px 0 rgba(0, 123, 255, 0.15)"
                    : undefined,
              }}
            >
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <Card className="p-8 bg-white border border-gray-200 shadow-lg">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Have you purchased personalized or customized products before?
            </h2>
            <p className="text-gray-600">
              This helps us understand your experience with customized products.
            </p>
            <RadioGroup
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, isAware: value }));
                if (errors.isAware) {
                  setErrors((prev) => ({ ...prev, isAware: undefined }));
                }
              }}
              value={formData.isAware}
            >
              <label
                className={`${radioBase} ${formData.isAware === "yes" ? "border-blue-600 bg-blue-50 shadow" : "border-gray-300 bg-white"}`}
                tabIndex={0}
              >
                <span
                  className={`${radioCircleBase} ${formData.isAware === "yes" ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white group-hover:border-blue-400"}`}
                ></span>
                <span
                  className={`font-semibold ${formData.isAware === "yes" ? "text-blue-900" : "text-gray-700"}`}
                >
                  Yes, I have
                </span>
                <input
                  type="radio"
                  value="yes"
                  checked={formData.isAware === "yes"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, isAware: "yes" }))
                  }
                  className="sr-only"
                />
              </label>
              <label
                className={`${radioBase} ${formData.isAware === "no" ? "border-blue-600 bg-blue-50 shadow" : "border-gray-300 bg-white"}`}
                tabIndex={0}
              >
                <span
                  className={`${radioCircleBase} ${formData.isAware === "no" ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white group-hover:border-blue-400"}`}
                ></span>
                <span
                  className={`font-semibold ${formData.isAware === "no" ? "text-blue-900" : "text-gray-700"}`}
                >
                  No, this is my first time
                </span>
                <input
                  type="radio"
                  value="no"
                  checked={formData.isAware === "no"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, isAware: "no" }))
                  }
                  className="sr-only"
                />
              </label>
            </RadioGroup>
            {errors.isAware && (
              <p className="text-red-500 text-sm mt-2">{errors.isAware}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                What interests you?
              </h2>
              <p className="text-gray-600 mt-2">
                Select all categories that interest you. You can choose multiple
                options.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleCategoryToggle(id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    formData.categories.includes(id)
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow"
                      : "border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-500"
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 ${getCategoryIconColor(formData.categories.includes(id))}`}
                  />
                  <span className="text-sm text-center font-medium mt-1">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-sm mt-2">{errors.categories}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Tell us about your ideal statue
            </h2>
            <p className="text-gray-600">
              Describe the size, style, and any specific details you&apos;d like
              in your custom statue.
            </p>
            <Textarea
              placeholder="E.g., I'm looking for a 12-inch tall statue in a modern style..."
              value={formData.statueDetails}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  statueDetails: e.target.value,
                }));
                if (errors.statueDetails) {
                  setErrors((prev) => ({ ...prev, statueDetails: undefined }));
                }
              }}
              className="min-h-[150px] bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md shadow-sm"
            />
            {errors.statueDetails && (
              <p className="text-red-500 text-sm mt-2">
                {errors.statueDetails}
              </p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Would you like to explore our product catalog?
            </h2>
            <p className="text-gray-600">
              We can show you our current collection based on your interests.
            </p>
            <RadioGroup
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, wantMore: value }));
                if (errors.wantMore) {
                  setErrors((prev) => ({ ...prev, wantMore: undefined }));
                }
              }}
              value={formData.wantMore}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="yes"
                  id="more-yes"
                  className="border-blue-500 text-blue-500"
                />
                <Label htmlFor="more-yes" className="text-gray-700">
                  Yes, show me the catalog
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="no"
                  id="more-no"
                  className="border-blue-500 text-blue-500"
                />
                <Label htmlFor="more-no" className="text-gray-700">
                  No, I&apos;ll browse later
                </Label>
              </div>
            </RadioGroup>
            {errors.wantMore && (
              <p className="text-red-500 text-sm mt-2">{errors.wantMore}</p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Contact Information
            </h2>
            <p className="text-gray-600">
              Please provide your contact details so we can reach out to you
              about your preferences.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.contactDetails.name}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        contactDetails: {
                          ...prev.contactDetails,
                          name: e.target.value,
                        },
                      }));
                      if (errors.contactDetails?.name) {
                        setErrors((prev) => ({
                          ...prev,
                          contactDetails: {
                            ...prev.contactDetails,
                            name: undefined,
                          },
                        }));
                      }
                    }}
                    className="pl-10 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md shadow-sm"
                    placeholder="Your name"
                  />
                </div>
                {errors.contactDetails?.name && (
                  <p className="text-red-500 text-sm">
                    {errors.contactDetails.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactDetails.email}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        contactDetails: {
                          ...prev.contactDetails,
                          email: e.target.value,
                        },
                      }));
                      if (errors.contactDetails?.email) {
                        setErrors((prev) => ({
                          ...prev,
                          contactDetails: {
                            ...prev.contactDetails,
                            email: undefined,
                          },
                        }));
                      }
                    }}
                    className="pl-10 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md shadow-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.contactDetails?.email && (
                  <p className="text-red-500 text-sm">
                    {errors.contactDetails.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contactDetails.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        contactDetails: {
                          ...prev.contactDetails,
                          phone: e.target.value,
                        },
                      }));
                    }}
                    className="pl-10 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md shadow-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="border-gray-300 text-gray-700 bg-white rounded-xl px-8 py-3 text-lg font-semibold shadow hover:bg-gray-100 hover:text-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-blue-600 text-white rounded-xl px-8 py-3 text-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              "Saving..."
            ) : step === totalSteps ? (
              "Submit"
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
