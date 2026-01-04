"use client";

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
        Array.isArray(v) ? v.length > 0 : v !== null
    );

    const handleArrayToggle = (key: string, value: string) => {
        const current = selectedFilters[key] || [];
        const updated = current.includes(value)
            ? current.filter((item: string) => item !== value)
            : [...current, value];
        onFilterChange(key, updated);
    };

    const isStepUnlocked = (key: string) =>
        selectedFilters[key] && selectedFilters[key].length > 0;
    const isPriceSet = () =>
        (selectedFilters.minPrice && selectedFilters.minPrice !== "") ||
        (selectedFilters.maxPrice && selectedFilters.maxPrice !== "");

    const renderTechnologyButtons = () => {
        const technologies = filters?.technology || [];
        // Show loading state if empty, or generic text
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

    // Robust Checkbox Renderer
    const renderCheckboxFilter = (
        key: string,
        displayName: string,
        options: string[],
        disabled: boolean = false,
        previousName: string = ""
    ) => {
        // If options haven't loaded yet from API, don't render anything
        if (!options || options.length === 0) return null;

        return (
            <div className={`mb-8 ${disabled ? "opacity-50" : ""}`}>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                    {displayName}
                    {disabled && (
                        <span className="text-xs text-gray-400 font-normal ml-2">
                            (Select {previousName} first)
                        </span>
                    )}
                </h3>
                <div className="space-y-3">
                    {options.map((option) => (
                        <label
                            key={option}
                            className={`flex items-center cursor-pointer group ${disabled ? "cursor-not-allowed" : ""}`}
                        >
                            <input
                                type="checkbox"
                                disabled={disabled}
                                checked={
                                    selectedFilters[key]?.includes(option) ||
                                    false
                                }
                                onChange={() =>
                                    !disabled && handleArrayToggle(key, option)
                                }
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span
                                className={`ml-3 text-sm text-gray-700 ${!disabled && "group-hover:text-blue-600"}`}
                            >
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
                {renderTechnologyButtons()}

                {isStepUnlocked("technology") &&
                    renderCheckboxFilter("brand", "Brand", filters.brand)}

                {isStepUnlocked("brand")
                    ? renderCheckboxFilter(
                          "volumeCategory",
                          "Build Volume",
                          filters.volumeCategory
                      )
                    : isStepUnlocked("technology") &&
                      renderCheckboxFilter(
                          "volumeCategory",
                          "Build Volume",
                          ["Less than 300 mm", "300 – 500 mm", "Above 500 mm"],
                          true,
                          "Brand"
                      )}

                {isStepUnlocked("volumeCategory") &&
                    renderCheckboxFilter(
                        "material",
                        "Material",
                        filters.material
                    )}

                {/* Price Range: Shows after Material */}
                {isStepUnlocked("material") && filters.priceRange && (
                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            Price Range
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={selectedFilters.minPrice || ""}
                                        onChange={(e) =>
                                            onFilterChange(
                                                "minPrice",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={selectedFilters.maxPrice || ""}
                                        onChange={(e) =>
                                            onFilterChange(
                                                "maxPrice",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chamber Type: Shows if Price is typed OR Material is selected */}
                {(isPriceSet() || isStepUnlocked("material")) &&
                    renderCheckboxFilter(
                        "atmosphereControl",
                        "Chamber Type",
                        filters.atmosphereControl
                    )}

                {/* Connectivity: Shows after Chamber Type */}
                {isStepUnlocked("atmosphereControl") &&
                    renderCheckboxFilter(
                        "connectivity",
                        "Connectivity",
                        filters.connectivity
                    )}

                {/* Others: Show at the end */}
                {isStepUnlocked("connectivity") && (
                    <>
                        {renderCheckboxFilter(
                            "application",
                            "Application",
                            filters.application
                        )}
                        {renderCheckboxFilter(
                            "recyclingRatio",
                            "Recycling Ratio",
                            filters.recyclingRatio
                        )}
                        {renderCheckboxFilter(
                            "experience",
                            "Experience Level",
                            filters.experience
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
