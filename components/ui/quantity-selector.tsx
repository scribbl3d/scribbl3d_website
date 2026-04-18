"use client";

interface QuantitySelectorProps {
    quantity: number;
    onChange: (quantity: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    className?: string;
}

export function QuantitySelector({
    quantity,
    onChange,
    min = 1,
    max = 99,
    disabled = false,
    className = "",
}: QuantitySelectorProps) {
    const handleDecrement = () => {
        if (quantity > min) {
            onChange(quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (quantity < max) {
            onChange(quantity + 1);
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                onClick={handleDecrement}
                disabled={disabled || quantity <= min}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                −
            </button>
            <div className="flex-1 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-semibold text-base">
                {quantity}
            </div>
            <button
                onClick={handleIncrement}
                disabled={disabled || quantity >= max}
                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                +
            </button>
        </div>
    );
}
