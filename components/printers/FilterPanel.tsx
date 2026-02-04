"use client";

import PriceRangeSlider from "./PriceRangeSlider";

interface FilterPanelProps {
    filters: any;
    selectedFilters: any;
    onFilterChange: (key: string, value: any) => void;
    onReset: () => void;
}

export default function FilterPanel({
    filters = {},
    selectedFilters,
    onFilterChange,
    onReset,
}: FilterPanelProps) {
    const hasAnyFilters = Object.values(selectedFilters).some((v) =>
        Array.isArray(v) ? v.length > 0 : v !== null,
    );

    const handleArrayToggle = (key: string, value: string) => {
        const current = selectedFilters[key] || [];
        const updated = current.includes(value)
            ? current.filter((item: string) => item !== value)
            : [...current, value];
        onFilterChange(key, updated);
    };

    // Check if a filter step is unlocked (has selections)
    const isStepUnlocked = (key: string) =>
        selectedFilters[key] && selectedFilters[key].length > 0;

    // Check if filter has available options from API
    const hasOptions = (key: string) => filters[key] && filters[key].length > 0;

    /* ===============================================================
       SMART SKIP LOGIC: Determines if a filter should be shown
       based on previous selections, skipping empty filters
    =============================================================== */

    // Level 1: Technology - always visible
    const showTechnology = () => true;

    // Level 2: Brand - after technology selected
    const showBrand = () => isStepUnlocked("technology") && hasOptions("brand");

    // Level 3: Volume - after brand selected (or skip brand if empty)
    const showVolume = () => {
        if (!isStepUnlocked("technology")) return false;

        // If brand has options, need brand selection first
        if (hasOptions("brand")) {
            return isStepUnlocked("brand") && hasOptions("volumeCategory");
        }
        // Skip brand if no options, show volume directly
        return hasOptions("volumeCategory");
    };

    // Level 4: Material - after volume selected (or skip volume if empty)
    const showMaterial = () => {
        if (!isStepUnlocked("technology")) return false;

        // Check the chain with skips
        const brandOk = !hasOptions("brand") || isStepUnlocked("brand");
        const volumeOk =
            !hasOptions("volumeCategory") || isStepUnlocked("volumeCategory");

        return brandOk && volumeOk && hasOptions("material");
    };

    // Level 5: Chamber Type - after material selected (or skip if empty)
    const showChamberType = () => {
        if (!isStepUnlocked("technology")) return false;

        const brandOk = !hasOptions("brand") || isStepUnlocked("brand");
        const volumeOk =
            !hasOptions("volumeCategory") || isStepUnlocked("volumeCategory");
        const materialOk =
            !hasOptions("material") || isStepUnlocked("material");

        return brandOk && volumeOk && materialOk && hasOptions("chamberType");
    };

    // Level 6: Connectivity - after chamber type (or skip if empty)
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

    // Level 7+: Final filters (Application, Recycling, Experience, Price)
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

    const handlePriceChange = (
        minPrice: number | null,
        maxPrice: number | null,
    ) => {
        onFilterChange("minPrice", minPrice);
        onFilterChange("maxPrice", maxPrice);
    };

    const renderTechnologyButtons = () => {
        const technologies = filters?.technology || [];
        if (technologies.length === 0)
            return (
                <div className="text-sm text-gray-400 mb-8">
                    Loading technologies...
                </div>
            );

        const selectedTechs = selectedFilters.technology || [];

        return (
            <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Technology
                </h3>
                <div className="space-y-2">
                    {technologies.map((tech: string) => (
                        <button
                            key={tech}
                            onClick={() =>
                                handleArrayToggle("technology", tech)
                            }
                            className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all border ${
                                selectedTechs.includes(tech)
                                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                        >
                            {tech}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderCheckboxFilter = (
        key: string,
        displayName: string,
        options: string[],
    ) => {
        if (!options || options.length === 0) return null;

        return (
            <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                    {displayName}
                </h3>
                <div className="space-y-3">
                    {options.map((option) => (
                        <label
                            key={option}
                            className="flex items-center cursor-pointer group"
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
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-blue-600">
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {hasAnyFilters && (
                    <button
                        onClick={onReset}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                        Reset All
                    </button>
                )}
            </div>

            <div className="space-y-1">
                {/* 1. Technology - Always visible */}
                {showTechnology() && renderTechnologyButtons()}

                {/* Instruction text or Progressive unlock message */}
                {!isStepUnlocked("technology") ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                        Select a printing technology to view compatible filters.
                    </p>
                ) : (
                    <>
                        {/* Progressive unlock info */}
                        <div className="border-t border-gray-200 my-4" />
                        <p className="text-sm text-gray-500 mb-4">
                            Filters unlock progressively to ensure only
                            compatible {selectedFilters.technology?.[0]}{" "}
                            printers are shown.
                        </p>
                        <div className="border-t border-gray-200 my-4" />

                        {/* 2. Brand - After Technology */}
                        {showBrand() &&
                            renderCheckboxFilter(
                                "brand",
                                "Brand",
                                filters.brand,
                            )}

                        {/* 3. Build Volume - After Brand (or skip if no brands) */}
                        {showVolume() &&
                            renderCheckboxFilter(
                                "volumeCategory",
                                "Build Volume",
                                filters.volumeCategory,
                            )}

                        {/* 4. Material - After Volume (or skip if no volumes) */}
                        {showMaterial() &&
                            renderCheckboxFilter(
                                "material",
                                "Material",
                                filters.material,
                            )}

                        {/* 5. Chamber Type - After Material (or skip if no materials) */}
                        {showChamberType() &&
                            renderCheckboxFilter(
                                "chamberType",
                                "Chamber Type",
                                filters.chamberType,
                            )}

                        {/* 6. Connectivity - After Chamber Type (or skip if no chamber types) */}
                        {showConnectivity() &&
                            renderCheckboxFilter(
                                "connectivity",
                                "Connectivity",
                                filters.connectivity,
                            )}

                        {/* 7. Application - Final filters */}
                        {showFinalFilters() &&
                            hasOptions("application") &&
                            renderCheckboxFilter(
                                "application",
                                "Application",
                                filters.application,
                            )}

                        {/* 8. Recycling Ratio */}
                        {showFinalFilters() &&
                            hasOptions("recyclingRatio") &&
                            renderCheckboxFilter(
                                "recyclingRatio",
                                "Recycling Ratio",
                                filters.recyclingRatio,
                            )}

                        {/* 9. Experience Level */}
                        {showFinalFilters() &&
                            hasOptions("experience") &&
                            renderCheckboxFilter(
                                "experience",
                                "Experience Level",
                                filters.experience,
                            )}

                        {/* 10. Price Range Slider */}
                        {showFinalFilters() &&
                            filters.priceRange &&
                            (filters.priceRange.min > 0 ||
                                filters.priceRange.max > 0) && (
                                <PriceRangeSlider
                                    min={filters.priceRange.min}
                                    max={filters.priceRange.max}
                                    minValue={selectedFilters.minPrice}
                                    maxValue={selectedFilters.maxPrice}
                                    onChange={handlePriceChange}
                                />
                            )}
                    </>
                )}
            </div>
        </div>
    );
}
