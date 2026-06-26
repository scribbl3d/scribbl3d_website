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
            ? "text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2.5 sm:py-1"
            : "text-[8px] sm:text-[10px] px-2 py-1 sm:px-3 sm:py-1.5";

    const positionClasses =
        position === "absolute"
            ? "absolute"
            : "";

    return (
        <div
            className={`${positionClasses} bg-red-500 text-white ${sizeClasses} font-bold uppercase tracking-widest rounded-full z-10 ${className}`}
        >
            Out of Stock
        </div>
    );
}
