"use client";

import { useCheckout } from "@/providers/CheckoutProvider";
import { cn } from "@/lib/utils";
import { Package2, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    name: "Shipping Details",
    icon: Package2,
    description: "Enter your address",
  },
  {
    id: 2,
    name: "Shipping Options",
    icon: Truck,
    description: "Choose delivery method",
  },
  {
    id: 3,
    name: "Confirmation",
    icon: CheckCircle2,
    description: "Review your order",
  },
];

export function Breadcrumbs() {
  const { state, goToStep } = useCheckout();

  return (
    <div className="w-full mb-4">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Progress" className="relative">
          {/* Progress Bar Background */}
          <div className="absolute top-[18px] left-0 w-full h-1 bg-gray-100 rounded-full" />

          {/* Animated Progress Bar */}
          <motion.div
            className="absolute top-[18px] left-0 h-1 bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${((state.step - 1) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Steps */}
          <ol className="relative flex justify-between w-full">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = state.step === step.id;
              const isCompleted = state.step > step.id;

              return (
                <li key={step.name} className="flex flex-col items-center">
                  <div className="flex flex-col items-center">
                    <motion.button
                      onClick={() => goToStep(step.id)}
                      disabled={step.id > state.step}
                      className={cn(
                        "relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200",
                        isCompleted
                          ? "bg-primary border-primary hover:bg-primary/90"
                          : isActive
                          ? "bg-white border-primary"
                          : "bg-white border-gray-300",
                        step.id <= state.step
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-60"
                      )}
                      whileHover={step.id <= state.step ? { scale: 1.05 } : {}}
                      whileTap={step.id <= state.step ? { scale: 0.95 } : {}}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isCompleted
                            ? "text-white"
                            : isActive
                            ? "text-primary"
                            : "text-gray-400"
                        )}
                      />
                      {isCompleted && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </motion.button>
                    <div className="mt-2 flex flex-col items-center">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isActive
                            ? "text-primary"
                            : isCompleted
                            ? "text-gray-900"
                            : "text-gray-500"
                        )}
                      >
                        {step.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {step.description}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
