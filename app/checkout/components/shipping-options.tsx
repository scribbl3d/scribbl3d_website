"use client";

import { useCheckout } from "@/providers/CheckoutProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Zap, ArrowLeft, ArrowRight } from "lucide-react";
import type { ShippingOption } from "@/types/checkout";

const shippingOptions: ShippingOption[] = [
  {
    id: "free",
    name: "Free Shipping",
    description: "5-7 business days",
    price: 0,
    estimatedDays: "5-7 days",
    icon: Truck,
  },
  {
    id: "premium",
    name: "Premium Shipping",
    description: "1-2 business days",
    price: 200,
    estimatedDays: "1-2 days",
    icon: Zap,
  },
];

export function ShippingOptions() {
  const { setShippingOption, nextStep, prevStep } = useCheckout();
  const [selectedOption, setSelectedOption] = useState<string>("free");
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    const option = shippingOptions.find((opt) => opt.id === value);
    if (option) {
      setShippingOption(option);
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Shipping Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedOption}
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {shippingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onHoverStart={() => setIsHovered(option.id)}
                onHoverEnd={() => setIsHovered(null)}
              >
                <div
                  className={`
                    relative overflow-hidden rounded-lg border-2 transition-all duration-200
                    ${
                      selectedOption === option.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }
                    ${isHovered === option.id ? "border-primary/50" : ""}
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent transition-opacity duration-200" />
                  <div className="relative p-4">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`
                          p-3 rounded-full 
                          ${
                            selectedOption === option.id
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-500"
                          }
                          transition-colors duration-200
                        `}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">
                            {option.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {option.price === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            <span>₹{option.price}</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Shipping in {option.estimatedDays}
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <Button onClick={handleContinue} className="flex items-center">
            Continue to Review
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
