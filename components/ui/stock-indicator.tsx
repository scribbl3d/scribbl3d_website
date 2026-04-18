"use client";

interface StockIndicatorProps {
    inStock: boolean;
    size?: "sm" | "md";
    showText?: boolean;
    className?: string;
}

export function StockIndicator({
    inStock,
    size = "md",
    showText = true,
    className = "",
}: StockIndicatorProps) {
    const textSize = size === "sm" ? "text-xs" : "text-sm";
    const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

    return (
        <div
            className={`flex items-center gap-2 ${textSize} ${
                inStock ? "text-green-600" : "text-red-500"
            } ${className}`}
        >
            <span
                className={`${dotSize} rounded-full ${
                    inStock ? "bg-green-500" : "bg-red-500"
                }`}
            />
            {showText && <span>{inStock ? "In Stock" : "Out of Stock"}</span>}
        </div>
    );
}
