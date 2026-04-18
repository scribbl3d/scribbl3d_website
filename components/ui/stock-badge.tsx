"use client";

interface StockBadgeProps {
    inStock?: boolean;
    size?: "sm" | "md";
    position?: "absolute" | "relative";
    className?: string;
}

export function StockBadge({
    inStock = true,
    size = "md",
    position = "absolute",
    className = "",
}: StockBadgeProps) {
    if (inStock) return null;

    const sizeClasses =
        size === "sm"
            ? "text-[7px] sm:text-[10px] px-1.5 py-0.5 sm:px-2.5 sm:py-1"
            : "text-[10px] px-2.5 py-1";

    const positionClasses =
        position === "absolute"
            ? "absolute top-1.5 left-1.5 sm:top-3 sm:left-3"
            : "";

    return (
        <div
            className={`${positionClasses} bg-red-500 text-white ${sizeClasses} font-bold uppercase tracking-widest rounded-full ${className}`}
        >
            Out of Stock
        </div>
    );
}
