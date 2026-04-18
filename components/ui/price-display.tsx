"use client";

interface PriceDisplayProps {
    price: number;
    originalPrice?: number | null;
    discount?: number | null;
    showGST?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
    layout?: "horizontal" | "vertical";
}

const sizeClasses = {
    sm: {
        price: "text-[13px] sm:text-[16px]",
        original: "text-[10px] sm:text-[14px]",
        discount: "text-[8px] sm:text-[12px] h-[14px] sm:h-[22px] px-1 sm:px-2",
        gst: "text-[9px] sm:text-[13px]",
    },
    md: {
        price: "text-lg sm:text-xl",
        original: "text-sm",
        discount: "text-xs px-2 py-0.5",
        gst: "text-xs",
    },
    lg: {
        price: "text-xl sm:text-2xl",
        original: "text-base",
        discount: "text-sm px-2.5 py-1",
        gst: "text-sm",
    },
};

export function PriceDisplay({
    price,
    originalPrice,
    discount,
    showGST = true,
    size = "sm",
    className = "",
    layout = "horizontal",
}: PriceDisplayProps) {
    const classes = sizeClasses[size];

    return (
        <div className={`mb-2.5 ${className}`}>
            <div
                className={`flex items-baseline gap-3 ${layout === "vertical" ? "flex-col items-start gap-1" : "sm:gap-0 sm:justify-start"}`}
            >
                <span className={`${classes.price} font-bold text-[#101828]`}>
                    ₹{price.toLocaleString("en-IN")}
                </span>
                {originalPrice && originalPrice > price && (
                    <span
                        className={`${layout === "horizontal" ? "sm:ml-3" : ""} ${classes.original} font-normal line-through text-[#99A1AF]`}
                    >
                        ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                )}
                {discount && discount > 0 && (
                    <span
                        className={`${layout === "horizontal" ? "hidden sm:inline-flex sm:ml-2" : ""} ${classes.discount} items-center rounded-full font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]`}
                    >
                        {discount}% OFF
                    </span>
                )}
            </div>

            {showGST && (
                <div
                    className={`flex items-center gap-3 ${layout === "vertical" ? "mt-0" : "sm:gap-2.5 mt-1 sm:justify-start"}`}
                >
                    <p className={`${classes.gst} text-[#667085]`}>
                        (incl. GST)
                    </p>
                    {discount && discount > 0 && layout === "horizontal" && (
                        <span className="sm:hidden inline-flex items-center text-[8px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF] h-[14px] px-1 rounded-full">
                            {discount}% OFF
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
