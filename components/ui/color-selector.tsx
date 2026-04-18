"use client";

import { Check } from "lucide-react";

interface ColorOption {
    id: string;
    name: string;
    hex: string | null;
    inStock?: boolean;
}

interface ColorSelectorProps {
    colors: ColorOption[];
    selectedColorId: string | null;
    onColorChange: (colorId: string) => void;
    showOutOfStockIndicator?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
};

const checkSizes = {
    sm: 10,
    md: 12,
    lg: 14,
};

export function ColorSelector({
    colors,
    selectedColorId,
    onColorChange,
    showOutOfStockIndicator = true,
    size = "md",
    className = "",
}: ColorSelectorProps) {
    return (
        <div className={`flex gap-2 flex-wrap ${className}`}>
            {colors.map((color) => {
                const isSelected = selectedColorId === color.id;
                const isOOS = showOutOfStockIndicator && color.inStock === false;

                return (
                    <button
                        key={color.id}
                        onClick={() => !isOOS && onColorChange(color.id)}
                        disabled={isOOS}
                        title={
                            isOOS
                                ? `${color.name} — Out of Stock`
                                : color.name
                        }
                        className={`relative ${sizeClasses[size]} rounded-full border-2 transition-all ${
                            isSelected
                                ? "ring-2 ring-blue-600 ring-offset-1 border-blue-600"
                                : "border-gray-300 hover:scale-110"
                        } ${isOOS ? "opacity-40 cursor-not-allowed !hover:scale-100" : ""}`}
                        style={{
                            backgroundColor: color.hex ?? "#E5E7EB",
                        }}
                    >
                        {isSelected && !isOOS && (
                            <Check
                                size={checkSizes[size]}
                                className="absolute inset-0 m-auto text-white drop-shadow"
                            />
                        )}
                        {isOOS && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <span className="block w-[110%] h-[2px] bg-red-500 rotate-45 rounded" />
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
