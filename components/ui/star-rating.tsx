"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

export function StarRating({
    rating,
    onChange,
    size = "md",
    readonly = false,
    className = "",
}: StarRatingProps) {
    const [hovered, setHovered] = useState(0);

    const handleClick = (star: number) => {
        if (!readonly && onChange) {
            onChange(star);
        }
    };

    return (
        <div className={`flex gap-1 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => handleClick(star)}
                    disabled={readonly}
                    className={`p-0.5 transition-transform ${!readonly && "hover:scale-110"} ${readonly ? "cursor-default" : "cursor-pointer"}`}
                >
                    <Star
                        className={`${sizeClasses[size]} transition-colors ${
                            star <= (hovered || rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-none text-gray-300"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}
