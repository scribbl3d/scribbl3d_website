"use client";

import { cn } from "@/lib/utils";
import { useCheckout } from "@/providers/CheckoutProvider";
import { motion } from "framer-motion";
import { CheckCircle2, Package2, Truck } from "lucide-react";

const steps = [
    {
        id: 1,
        name: "Shipping Details",
        shortName: "Details",
        icon: Package2,
        description: "Enter your address",
    },
    {
        id: 2,
        name: "Shipping Options",
        shortName: "Shipping",
        icon: Truck,
        description: "Choose delivery method",
    },
    {
        id: 3,
        name: "Confirmation",
        shortName: "Review",
        icon: CheckCircle2,
        description: "Review your order",
    },
];

export function Breadcrumbs() {
    const { state, goToStep } = useCheckout();

    return (
        <div className="w-full mb-4 sm:mb-6">
            <div className="w-full">
                <nav aria-label="Progress" className="relative">
                    {/* Connecting Line Wrapper */}
                    {/* Bounded strictly between the center of the first and last step */}
                    <div
                        className="absolute top-[16px] sm:top-[18px] h-0.5 sm:h-1 z-0"
                        style={{
                            left: `calc(100% / (${steps.length} * 2))`,
                            right: `calc(100% / (${steps.length} * 2))`,
                        }}
                    >
                        {/* Progress Bar Background */}
                        <div className="absolute inset-0 bg-gray-100 rounded-full" />

                        {/* Animated Progress Bar */}
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-primary rounded-full"
                            initial={{ width: "0%" }}
                            animate={{
                                width: `${((state.step - 1) / (steps.length - 1)) * 100}%`,
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    {/* Steps Container */}
                    {/* Switched from 'justify-between' to equally distributed via flex-1 */}
                    <ol className="relative flex w-full">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = state.step === step.id;
                            const isCompleted = state.step > step.id;

                            return (
                                <li
                                    key={step.name}
                                    className="relative flex flex-col items-center flex-1 z-10"
                                >
                                    <div className="flex flex-col items-center">
                                        <motion.button
                                            onClick={() => goToStep(step.id)}
                                            disabled={step.id > state.step}
                                            className={cn(
                                                "relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-200",
                                                isCompleted
                                                    ? "bg-primary border-primary hover:bg-primary/90 text-primary-foreground"
                                                    : isActive
                                                      ? "bg-white border-primary"
                                                      : "bg-white border-gray-300",
                                                step.id <= state.step
                                                    ? "cursor-pointer"
                                                    : "cursor-not-allowed opacity-60",
                                            )}
                                            whileHover={
                                                step.id <= state.step
                                                    ? { scale: 1.05 }
                                                    : {}
                                            }
                                            whileTap={
                                                step.id <= state.step
                                                    ? { scale: 0.95 }
                                                    : {}
                                            }
                                        >
                                            <Icon
                                                className={cn(
                                                    "w-3.5 h-3.5 sm:w-4 sm:h-4",
                                                    isCompleted
                                                        ? "text-white"
                                                        : isActive
                                                          ? "text-primary"
                                                          : "text-gray-400",
                                                )}
                                            />
                                            {isCompleted && (
                                                <motion.div
                                                    className="absolute inset-0 flex items-center justify-center"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        duration: 0.2,
                                                    }}
                                                >
                                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                                                </motion.div>
                                            )}
                                        </motion.button>
                                        <div className="mt-1.5 sm:mt-2 flex flex-col items-center">
                                            <span
                                                className={cn(
                                                    "text-[10px] sm:text-xs font-medium text-center leading-tight",
                                                    isActive
                                                        ? "text-primary"
                                                        : isCompleted
                                                          ? "text-gray-900"
                                                          : "text-gray-500",
                                                )}
                                            >
                                                <span className="sm:hidden">
                                                    {step.shortName}
                                                </span>
                                                <span className="hidden sm:inline">
                                                    {step.name}
                                                </span>
                                            </span>
                                            <span className="hidden sm:block text-[10px] text-gray-500">
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
