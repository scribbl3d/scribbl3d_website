"use client";

import { useCheckout } from "@/providers/CheckoutProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Truck,
  User,
  Mail,
  Phone,
  type LucideIcon,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";
// import type { ShippingDetails as CheckoutShippingDetails } from "@/types/checkout";

// type ShippingDetails = CheckoutShippingDetails & {
//   items?: Array<{ id: string; name: string; price: number; quantity: number }>;
// };

// type ShippingOption = {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   estimatedDays: string;
// };

interface ContentItem {
  icon?: LucideIcon;
  text: string;
}

interface Section {
  title: string;
  icon: LucideIcon;
  content: ContentItem[];
}

export function Confirmation() {
  const { state, prevStep } = useCheckout();
  const { shippingDetails, selectedShipping } = state;

  if (!shippingDetails || !selectedShipping) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  const sections: Section[] = [
    {
      title: "Contact Information",
      icon: User,
      content: [
        { icon: Mail, text: shippingDetails.email },
        { icon: Phone, text: shippingDetails.phone },
      ],
    },
    {
      title: "Shipping Address",
      icon: MapPin,
      content: [
        { text: shippingDetails.fullName },
        { text: shippingDetails.address },
        { text: shippingDetails.landmark || "" },
        {
          text: `${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.pincode}`,
        },
      ].filter((item) => item.text),
    },
    {
      title: "Shipping Method",
      icon: Truck,
      content: [
        { text: selectedShipping.name },
        { text: selectedShipping.description },
        { text: formatPrice(selectedShipping.price) },
      ],
    },
  ];

  const totalAmount = selectedShipping.price;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-lg">{section.title}</h3>
                  </div>
                  <div className="ml-9 pl-2 border-l-2 border-gray-100 space-y-2">
                    {section.content.map((item, i) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={i} className="flex items-center space-x-2">
                          {ItemIcon && (
                            <ItemIcon className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-gray-600">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {index < sections.length - 1 && <Separator className="my-3" />}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shipping
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
