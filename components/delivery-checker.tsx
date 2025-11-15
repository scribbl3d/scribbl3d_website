"use client";

import { useState } from "react";
import { Truck, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface DeliveryOption {
  type: "express" | "standard";
  date: Date;
  price: number;
}

export function DeliveryChecker() {
  const [pincode, setPincode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode");
      setShowOptions(false);
      return;
    }

    setError("");
    setIsChecking(true);

    // Simulate API call
    setTimeout(() => {
      setIsChecking(false);
      setShowOptions(true);
    }, 800);
  };

  const deliveryOptions: DeliveryOption[] = [
    {
      type: "express",
      date: new Date(),
      price: 200,
    },
    {
      type: "standard",
      date: new Date(),
      price: 100,
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pincode">Check Delivery Options</Label>
        <div className="flex gap-2">
          <Input
            id="pincode"
            type="text"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value);
              setError("");
              setShowOptions(false);
            }}
            maxLength={6}
            className="font-mono"
          />
          <Button onClick={handleCheck} disabled={isChecking}>
            {isChecking ? "Checking..." : "Check"}
          </Button>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {showOptions && (
        <div className="space-y-3">
          {deliveryOptions.map((option) => (
            <Card key={option.type} className="relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  option.type === "express" ? "bg-blue-500" : "bg-green-500"
                }`}
              />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck
                        className={`h-4 w-4 ${
                          option.type === "express"
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      />
                      <span className="font-medium">
                        {option.type === "express"
                          ? "Express Delivery"
                          : "Standard Delivery"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        Estimated delivery by{" "}
                        {option.date.toLocaleString("default", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          weekday: "long",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{option.price}</div>
                    <div className="text-sm text-gray-500">Shipping</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
