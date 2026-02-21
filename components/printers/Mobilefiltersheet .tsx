"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MobileFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    selectedFilters: any;
    onFilterChange: (key: string, value: any) => void;
    onReset: () => void;
}

/* ================= MOBILE PRICE RANGE SLIDER (FIXED) ================= */
function MobilePriceRangeSlider({
    min,
    max,
    minValue,
    maxValue,
    onChange,
}: {
    min: number;
    max: number;
    minValue: number | null;
    maxValue: number | null;
    onChange: (minPrice: number | null, maxPrice: number | null) => void;
}) {
    // Values are already in rupees - no conversion needed
    const validMin = min || 0;
    const validMax = max || 100000;

    const [minVal, setMinVal] = useState(minValue ?? validMin);
    const [maxVal, setMaxVal] = useState(maxValue ?? validMax);

    const range = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (minValue === null && maxValue === null) {
            setMinVal(validMin);
            setMaxVal(validMax);
        }
    }, [minValue, maxValue, validMin, validMax]);

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

    return (
        <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
                Price (₹)
            </h4>

            {/* Slider Container */}
            <div className="relative h-8 mb-4">
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
                    className="absolute top-1/2 -translate-y-1/2 w-full h-6 appearance-none bg-transparent pointer-events-none
                        [&::-webkit-slider-thumb]:pointer-events-auto
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-7
                        [&::-webkit-slider-thumb]:h-7
                        [&::-webkit-slider-thumb]:bg-[#2563EB]
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_white,0_0_0_5px_#e5e7eb,0_4px_6px_rgba(0,0,0,0.1)]
                        [&::-moz-range-thumb]:pointer-events-auto
                        [&::-moz-range-thumb]:appearance-none
                        [&::-moz-range-thumb]:w-7
                        [&::-moz-range-thumb]:h-7
                        [&::-moz-range-thumb]:bg-[#2563EB]
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-4
                        [&::-moz-range-thumb]:border-white
                        [&::-moz-range-thumb]:shadow-[0_0_0_1px_#e5e7eb,0_4px_6px_rgba(0,0,0,0.1)]"
                />

                {/* Max Thumb */}
                <input
                    type="range"
                    min={validMin}
                    max={validMax}
                    value={maxVal}
                    onChange={handleMaxChange}
                    style={{ zIndex: 4 }}
                    className="absolute top-1/2 -translate-y-1/2 w-full h-6 appearance-none bg-transparent pointer-events-none
                        [&::-webkit-slider-thumb]:pointer-events-auto
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-7
                        [&::-webkit-slider-thumb]:h-7
                        [&::-webkit-slider-thumb]:bg-[#2563EB]
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_white,0_0_0_5px_#e5e7eb,0_4px_6px_rgba(0,0,0,0.1)]
                        [&::-moz-range-thumb]:pointer-events-auto
                        [&::-moz-range-thumb]:appearance-none
                        [&::-moz-range-thumb]:w-7
                        [&::-moz-range-thumb]:h-7
                        [&::-moz-range-thumb]:bg-[#2563EB]
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-4
                        [&::-moz-range-thumb]:border-white
                        [&::-moz-range-thumb]:shadow-[0_0_0_1px_#e5e7eb,0_4px_6px_rgba(0,0,0,0.1)]"
                />
            </div>

            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-400 mb-4">
                <span>₹{validMin.toLocaleString("en-IN")}</span>
                <span>₹{validMax.toLocaleString("en-IN")}</span>
            </div>

            {/* Min/Max Input Fields */}
            <div className="flex gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
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
                            className="w-full pl-7 pr-2 py-3 text-sm border border-gray-200 rounded-xl bg-white
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
                <div className="flex items-end pb-3">
                    <span className="text-gray-300">—</span>
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
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
                            className="w-full pl-7 pr-2 py-3 text-sm border border-gray-200 rounded-xl bg-white
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================= MAIN COMPONENT ================= */
export default function MobileFilterSheet({
    isOpen,
    onClose,
    filters = {},
    selectedFilters,
    onFilterChange,
    onReset,
}: MobileFilterSheetProps) {
    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleArrayToggle = (key: string, value: string) => {
        const current = selectedFilters[key] || [];
        const updated = current.includes(value)
            ? current.filter((item: string) => item !== value)
            : [...current, value];
        onFilterChange(key, updated);
    };

    const handleTechnologySelect = (tech: string) => {
        const isSelected = selectedFilters.technology?.includes(tech);

        if (isSelected) {
            onReset();
        } else {
            onFilterChange("technology", [tech]);
            onFilterChange("brand", []);
            onFilterChange("volumeCategory", []);
            onFilterChange("material", []);
            onFilterChange("chamberType", []);
            onFilterChange("connectivity", []);
            onFilterChange("application", []);
            onFilterChange("recyclingRatio", []);
            onFilterChange("experience", []);
            onFilterChange("minPrice", null);
            onFilterChange("maxPrice", null);
        }
    };

    /* ================= SMART SKIP LOGIC ================= */
    const isStepUnlocked = (key: string) =>
        selectedFilters[key] && selectedFilters[key].length > 0;

    const hasOptions = (key: string) => filters[key] && filters[key].length > 0;

    const showBrand = () => isStepUnlocked("technology") && hasOptions("brand");

    const showVolume = () => {
        if (!isStepUnlocked("technology")) return false;
        if (hasOptions("brand")) {
            return isStepUnlocked("brand") && hasOptions("volumeCategory");
        }
        return hasOptions("volumeCategory");
    };

    const showMaterial = () => {
        if (!isStepUnlocked("technology")) return false;
        const brandOk = !hasOptions("brand") || isStepUnlocked("brand");
        const volumeOk =
            !hasOptions("volumeCategory") || isStepUnlocked("volumeCategory");
        return brandOk && volumeOk && hasOptions("material");
    };

    const showChamberType = () => {
        if (!isStepUnlocked("technology")) return false;
        const brandOk = !hasOptions("brand") || isStepUnlocked("brand");
        const volumeOk =
            !hasOptions("volumeCategory") || isStepUnlocked("volumeCategory");
        const materialOk =
            !hasOptions("material") || isStepUnlocked("material");
        return brandOk && volumeOk && materialOk && hasOptions("chamberType");
    };

    const showConnectivity = () => {
        if (!isStepUnlocked("technology")) return false;
        const brandOk = !hasOptions("brand") || isStepUnlocked("brand");
        const volumeOk =
            !hasOptions("volumeCategory") || isStepUnlocked("volumeCategory");
        const materialOk =
            !hasOptions("material") || isStepUnlocked("material");
        const chamberOk =
            !hasOptions("chamberType") || isStepUnlocked("chamberType");
        return (
            brandOk &&
            volumeOk &&
            materialOk &&
            chamberOk &&
            hasOptions("connectivity")
        );
    };

    const showFinalFilters = () => {
        if (!isStepUnlocked("technology")) return false;
        const brandOk = !hasOptions("brand") || isStepUnlocked("brand");
        const volumeOk =
            !hasOptions("volumeCategory") || isStepUnlocked("volumeCategory");
        const materialOk =
            !hasOptions("material") || isStepUnlocked("material");
        const chamberOk =
            !hasOptions("chamberType") || isStepUnlocked("chamberType");
        const connectivityOk =
            !hasOptions("connectivity") || isStepUnlocked("connectivity");
        return brandOk && volumeOk && materialOk && chamberOk && connectivityOk;
    };

    const getSelectedTechnology = () => selectedFilters.technology?.[0] || null;

    const handlePriceChange = (
        minPrice: number | null,
        maxPrice: number | null,
    ) => {
        onFilterChange("minPrice", minPrice);
        onFilterChange("maxPrice", maxPrice);
    };

    const renderCheckboxFilter = (
        key: string,
        displayName: string,
        options: string[],
    ) => {
        if (!options || options.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    {displayName}
                </h4>
                <div className="space-y-3">
                    {options.map((option: string) => (
                        <label
                            key={option}
                            className="flex items-center cursor-pointer active:bg-gray-100 -mx-2 px-2 py-1 rounded-lg"
                        >
                            <input
                                type="checkbox"
                                checked={
                                    selectedFilters[key]?.includes(option) ||
                                    false
                                }
                                onChange={() => handleArrayToggle(key, option)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Filters
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-6">
                    <div className="bg-gray-50 rounded-2xl p-5">
                        {/* Technology Section */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Technology
                            </h4>
                            <div className="space-y-2">
                                {(
                                    filters?.technology || [
                                        "FDM / FFF",
                                        "SLA / DLP",
                                        "SLS",
                                    ]
                                ).map((tech: string) => (
                                    <button
                                        key={tech}
                                        onClick={() =>
                                            handleTechnologySelect(tech)
                                        }
                                        className={`w-full px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all border ${
                                            selectedFilters.technology?.includes(
                                                tech,
                                            )
                                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                                : "bg-white text-gray-700 border-gray-200 active:bg-gray-100"
                                        }`}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4" />

                        {/* Progressive unlock message or filters */}
                        {!isStepUnlocked("technology") ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                                Select a printing technology to view compatible
                                filters.
                            </p>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    Filters unlock progressively to ensure only
                                    compatible {getSelectedTechnology()}{" "}
                                    printers are shown.
                                </p>

                                <div className="border-t border-gray-200 my-4" />

                                {showBrand() &&
                                    renderCheckboxFilter(
                                        "brand",
                                        "Brand",
                                        filters.brand,
                                    )}
                                {showVolume() &&
                                    renderCheckboxFilter(
                                        "volumeCategory",
                                        "Build Volume",
                                        filters.volumeCategory,
                                    )}
                                {showMaterial() &&
                                    renderCheckboxFilter(
                                        "material",
                                        "Material",
                                        filters.material,
                                    )}
                                {showChamberType() &&
                                    renderCheckboxFilter(
                                        "chamberType",
                                        "Chamber Type",
                                        filters.chamberType,
                                    )}
                                {showConnectivity() &&
                                    renderCheckboxFilter(
                                        "connectivity",
                                        "Connectivity",
                                        filters.connectivity,
                                    )}

                                {showFinalFilters() && (
                                    <>
                                        {hasOptions("application") &&
                                            renderCheckboxFilter(
                                                "application",
                                                "Application",
                                                filters.application,
                                            )}
                                        {hasOptions("recyclingRatio") &&
                                            renderCheckboxFilter(
                                                "recyclingRatio",
                                                "Recycling Ratio",
                                                filters.recyclingRatio,
                                            )}
                                        {hasOptions("experience") &&
                                            renderCheckboxFilter(
                                                "experience",
                                                "Experience Level",
                                                filters.experience,
                                            )}

                                        {filters?.priceRange &&
                                            (filters.priceRange.min > 0 ||
                                                filters.priceRange.max > 0) && (
                                                <MobilePriceRangeSlider
                                                    min={filters.priceRange.min}
                                                    max={filters.priceRange.max}
                                                    minValue={
                                                        selectedFilters.minPrice
                                                    }
                                                    maxValue={
                                                        selectedFilters.maxPrice
                                                    }
                                                    onChange={handlePriceChange}
                                                />
                                            )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white safe-area-bottom">
                    <button
                        onClick={onReset}
                        className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 px-4 text-sm font-medium text-white bg-[#2563EB] rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .safe-area-bottom {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom));
                }
            `}</style>
        </>
    );
}
