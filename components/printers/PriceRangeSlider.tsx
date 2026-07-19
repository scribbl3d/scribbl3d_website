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
            // Clamp values to valid range for slider display (prevent overflow)
            const clampedMin = Math.max(validMin, Math.min(minVal, validMax));
            const clampedMax = Math.max(validMin, Math.min(maxVal, validMax));
            
            const minPercent =
                ((clampedMin - validMin) / (validMax - validMin)) * 100;
            const maxPercent =
                ((clampedMax - validMin) / (validMax - validMin)) * 100;
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
        const value = e.target.value;
        // Allow empty string while typing
        if (value === '') {
            setMinVal(validMin);
            return;
        }
        const numValue = Number(value);
        // Allow any valid number while typing (industry standard)
        if (!isNaN(numValue) && numValue >= 0) {
            setMinVal(numValue);
        }
    };

    const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string while typing
        if (value === '') {
            setMaxVal(validMax);
            return;
        }
        const numValue = Number(value);
        // Allow any valid number while typing (industry standard)
        if (!isNaN(numValue) && numValue >= 0) {
            setMaxVal(numValue);
        }
    };

    const handleMinBlur = () => {
        // Clamp min value on blur
        let clampedMin = minVal;
        
        // If value is 0 or too low, reset to validMin
        if (clampedMin === 0 || clampedMin < validMin) {
            clampedMin = validMin;
        }
        
        // If value is too high, cap at validMax
        if (clampedMin > validMax) {
            clampedMin = validMax;
        }
        
        // Ensure min is less than max
        if (clampedMin >= maxVal) {
            clampedMin = Math.max(validMin, maxVal - 100);
        }
        
        setMinVal(clampedMin);
        onChange(clampedMin, maxVal);
    };

    const handleMaxBlur = () => {
        // Clamp max value on blur
        let clampedMax = maxVal;
        
        // If value is 0 or too low, reset to validMax
        if (clampedMax === 0 || clampedMax < validMin) {
            clampedMax = validMax;
        }
        
        // If value is too high, reset to validMax
        if (clampedMax > validMax) {
            clampedMax = validMax;
        }
        
        // Ensure max is greater than min
        if (clampedMax <= minVal) {
            clampedMax = Math.min(validMax, minVal + 100);
        }
        
        setMaxVal(clampedMax);
        onChange(minVal, clampedMax);
    };

    // Common thumb styles - Smaller, cleaner blue circle
    const thumbStyles = `
        [&::-webkit-slider-thumb]:pointer-events-auto
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-[#2563EB]
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_white,0_0_0_4px_#e5e7eb]
        [&::-webkit-slider-thumb]:transition-all
        [&::-webkit-slider-thumb]:duration-150
        [&::-webkit-slider-thumb]:hover:scale-125
        [&::-webkit-slider-thumb]:active:scale-100
        [&::-moz-range-thumb]:pointer-events-auto
        [&::-moz-range-thumb]:appearance-none
        [&::-moz-range-thumb]:w-4
        [&::-moz-range-thumb]:h-4
        [&::-moz-range-thumb]:bg-[#2563EB]
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:cursor-pointer
        [&::-moz-range-thumb]:border-3
        [&::-moz-range-thumb]:border-white
        [&::-moz-range-thumb]:shadow-[0_0_0_1px_#e5e7eb]
    `;

    return (
        <div className="mb-6 w-full max-w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2.5">
                Price (₹)
            </h3>

            {/* Slider Container */}
            <div className="relative h-6 mb-3 w-full">
                <div className="absolute inset-0 px-2">
                    {/* Background Track */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full" />

                    {/* Active Range Track */}
                    <div
                        ref={range}
                        className="absolute top-1/2 -translate-y-1/2 h-1 bg-[#2563EB] rounded-full"
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
            </div>

            {/* Min/Max Input Fields */}
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                        Min
                    </label>
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={minVal}
                            onChange={handleMinInputChange}
                            onBlur={handleMinBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            placeholder={validMin.toString()}
                            className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                        Max
                    </label>
                    <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={maxVal}
                            onChange={handleMaxInputChange}
                            onBlur={handleMaxBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            placeholder={validMax.toString()}
                            className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
