"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    minValue: number | null;
    maxValue: number | null;
    onChange: (minPrice: number | null, maxPrice: number | null) => void;
}

export default function PriceRangeSlider({
    min,
    max,
    minValue,
    maxValue,
    onChange,
}: PriceRangeSliderProps) {
    // Values are already in rupees - no conversion needed
    const validMin = min || 0;
    const validMax = max || 100000;

    const [minVal, setMinVal] = useState(minValue ?? validMin);
    const [maxVal, setMaxVal] = useState(maxValue ?? validMax);

    const range = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset local state when props change (e.g., on filter reset)
    useEffect(() => {
        if (minValue === null && maxValue === null) {
            setMinVal(validMin);
            setMaxVal(validMax);
        }
    }, [minValue, maxValue, validMin, validMax]);

    // Update the range track width
    useEffect(() => {
        if (range.current) {
            const minPercent =
                ((minVal - validMin) / (validMax - validMin)) * 100;
            const maxPercent =
                ((maxVal - validMin) / (validMax - validMin)) * 100;
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, maxVal, validMin, validMax]);

    // Debounced onChange to avoid too many API calls
    const debouncedOnChange = useCallback(
        (newMin: number, newMax: number) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                onChange(newMin, newMax);
            }, 300);
        },
        [onChange],
    );

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxVal - 100);
        setMinVal(value);
        debouncedOnChange(value, maxVal);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minVal + 100);
        setMaxVal(value);
        debouncedOnChange(minVal, value);
    };

    const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (!isNaN(value)) {
            const clampedValue = Math.max(
                validMin,
                Math.min(value, maxVal - 100),
            );
            setMinVal(clampedValue);
        }
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (!isNaN(value)) {
            const clampedValue = Math.min(
                validMax,
                Math.max(value, minVal + 100),
            );
            setMaxVal(clampedValue);
        }
    };

    const handleInputBlur = () => {
        onChange(minVal, maxVal);
    };

    // Common thumb styles - Blue filled circle with white ring
    const thumbStyles = `
        [&::-webkit-slider-thumb]:pointer-events-auto
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-6
        [&::-webkit-slider-thumb]:h-6
        [&::-webkit-slider-thumb]:bg-[#2563EB]
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_white,0_0_0_5px_#e5e7eb,0_4px_6px_rgba(0,0,0,0.1)]
        [&::-webkit-slider-thumb]:transition-all
        [&::-webkit-slider-thumb]:duration-150
        [&::-webkit-slider-thumb]:hover:scale-110
        [&::-webkit-slider-thumb]:active:scale-95
        [&::-moz-range-thumb]:pointer-events-auto
        [&::-moz-range-thumb]:appearance-none
        [&::-moz-range-thumb]:w-6
        [&::-moz-range-thumb]:h-6
        [&::-moz-range-thumb]:bg-[#2563EB]
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:cursor-pointer
        [&::-moz-range-thumb]:border-4
        [&::-moz-range-thumb]:border-white
        [&::-moz-range-thumb]:shadow-[0_0_0_1px_#e5e7eb,0_4px_6px_rgba(0,0,0,0.1)]
    `;

    return (
        <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
                Price (₹)
            </h3>

            {/* Slider Container */}
            <div className="relative h-8 mb-6">
                {/* Background Track */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full" />

                {/* Active Range Track */}
                <div
                    ref={range}
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-[#2563EB] rounded-full"
                />

                {/* Min Thumb */}
                <input
                    type="range"
                    min={validMin}
                    max={validMax}
                    value={minVal}
                    onChange={handleMinChange}
                    style={{ zIndex: minVal > validMax - 100 ? 5 : 3 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none ${thumbStyles}`}
                />

                {/* Max Thumb */}
                <input
                    type="range"
                    min={validMin}
                    max={validMax}
                    value={maxVal}
                    onChange={handleMaxChange}
                    style={{ zIndex: 4 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-full h-1.5 appearance-none bg-transparent pointer-events-none ${thumbStyles}`}
                />
            </div>

            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-400 mb-4 px-1">
                <span>₹{validMin.toLocaleString("en-IN")}</span>
                <span>₹{validMax.toLocaleString("en-IN")}</span>
            </div>

            {/* Min/Max Input Fields */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm text-gray-500 mb-1.5">
                        Min
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={minVal}
                            onChange={handleMinInputChange}
                            onBlur={handleInputBlur}
                            min={validMin}
                            max={validMax}
                            className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
                <div className="flex items-end pb-2.5">
                    <span className="text-gray-300">—</span>
                </div>
                <div className="flex-1">
                    <label className="block text-sm text-gray-500 mb-1.5">
                        Max
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={maxVal}
                            onChange={handleMaxInputChange}
                            onBlur={handleInputBlur}
                            min={validMin}
                            max={validMax}
                            className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
