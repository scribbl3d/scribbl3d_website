"use client";

export default function FilterPanel({
    filters,
    selectedFilters,
    onFilterChange,
    onReset,
}) {
    const hasAnyFilters = Object.values(selectedFilters).some((v) =>
        Array.isArray(v) ? v.length > 0 : v !== null
    );

    // Helper to render technology buttons
    const renderTechnologyButtons = () => {
        const technologies = filters.technology || [];

        return (
            <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Technology
                </h3>
                <div className="space-y-2">
                    {technologies.map((tech) => (
                        <button
                            key={tech}
                            onClick={() => onFilterChange("technology", tech)}
                            className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                                selectedFilters.technology === tech
                                    ? "bg-[#2563EB] text-white shadow-sm"
                                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                        >
                            {tech}
                        </button>
                    ))}
                </div>

                {!selectedFilters.technology && (
                    <p className="mt-6 text-sm text-gray-500 text-center leading-relaxed">
                        Select a printing technology to view compatible filters.
                    </p>
                )}
            </div>
        );
    };

    // Helper to render checkbox filters
    const renderCheckboxFilter = (
        key,
        displayName,
        options,
        disabled = false
    ) => {
        if (!options || options.length === 0) return null;

        return (
            <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                    {displayName}
                    {disabled && (
                        <span className="text-xs text-gray-400 font-normal ml-2">
                            (Select{" "}
                            {key === "volumeCategory"
                                ? "brand"
                                : getPreviousFilter(key)}{" "}
                            first)
                        </span>
                    )}
                </h3>
                <div className="space-y-3">
                    {options.map((option) => (
                        <label
                            key={option}
                            className={`flex items-center cursor-pointer group ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                            <input
                                type="checkbox"
                                disabled={disabled}
                                checked={
                                    selectedFilters[key]?.includes(option) ||
                                    false
                                }
                                onChange={(e) => {
                                    if (disabled) return;
                                    const current = selectedFilters[key] || [];
                                    const updated = e.target.checked
                                        ? [...current, option]
                                        : current.filter((v) => v !== option);
                                    onFilterChange(key, updated);
                                }}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
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

    // Helper to render radio filters
    const renderRadioFilter = (key, displayName, options, disabled = false) => {
        if (!options || options.length === 0) return null;

        return (
            <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                    {displayName}
                    {disabled && (
                        <span className="text-xs text-gray-400 font-normal ml-2">
                            (Select {getPreviousFilter(key)} first)
                        </span>
                    )}
                </h3>
                <div className="space-y-3">
                    {options.map((option) => (
                        <label
                            key={option}
                            className={`flex items-center cursor-pointer group ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                            <input
                                type="radio"
                                disabled={disabled}
                                checked={selectedFilters[key] === option}
                                onChange={() => {
                                    if (!disabled) onFilterChange(key, option);
                                }}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
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

    const getPreviousFilter = (key) => {
        const order = {
            brand: "technology",
            volumeCategory: "brand",
            material: "volume",
            recyclingRatio: "material",
            atmosphereControl: "recycling ratio",
            price: "atmosphere control",
            application: "price",
            experience: "application",
            connectivity: "experience",
        };
        return order[key] || "previous filter";
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Header */}
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

            {/* Progressive reveal message */}
            {selectedFilters.technology && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Filters unlock progressively to ensure only compatible{" "}
                        {selectedFilters.technology} printers are shown.
                    </p>
                </div>
            )}

            <div className="space-y-1">
                {/* Step 1: Technology (Always visible) */}
                {renderTechnologyButtons()}

                {/* Step 2: Brand (Visible after technology selected) */}
                {selectedFilters.technology &&
                    renderCheckboxFilter("brand", "Brand", filters.brand)}

                {/* Step 3: Volume Category (Visible after brand selected) */}
                {selectedFilters.brand &&
                    renderRadioFilter(
                        "volumeCategory",
                        "Build Volume",
                        filters.volumeCategory
                    )}

                {/* Disabled state for Build Volume */}
                {!selectedFilters.brand && selectedFilters.technology && (
                    <div className="mb-8 opacity-40">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            Build Volume{" "}
                            <span className="text-xs text-gray-400 font-normal">
                                (Select brand first)
                            </span>
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center cursor-not-allowed">
                                <input
                                    type="radio"
                                    disabled
                                    className="w-5 h-5 border-gray-300"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                    Less than 300 mm
                                </span>
                            </label>
                            <label className="flex items-center cursor-not-allowed">
                                <input
                                    type="radio"
                                    disabled
                                    className="w-5 h-5 border-gray-300"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                    300 – 500 mm
                                </span>
                            </label>
                            <label className="flex items-center cursor-not-allowed">
                                <input
                                    type="radio"
                                    disabled
                                    className="w-5 h-5 border-gray-300"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                    Above 500 mm
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Step 4: Material (Visible after volume selected) */}
                {selectedFilters.volumeCategory &&
                    renderCheckboxFilter(
                        "material",
                        "Material",
                        filters.material
                    )}

                {/* Step 5: Recycling Ratio (Visible after material selected) */}
                {selectedFilters.material?.length > 0 &&
                    renderRadioFilter(
                        "recyclingRatio",
                        "Recycling Ratio",
                        filters.recyclingRatio
                    )}

                {/* Step 6: Atmosphere Control (Visible after recycling selected) */}
                {selectedFilters.recyclingRatio &&
                    renderRadioFilter(
                        "atmosphereControl",
                        "Atmosphere Control",
                        filters.atmosphereControl
                    )}

                {/* Step 7: Price Range (Visible after atmosphere selected) */}
                {selectedFilters.atmosphereControl && filters.priceRange && (
                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            Price Range
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-600 mb-1">
                                        Min Price
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="₹0"
                                        value={selectedFilters.minPrice || ""}
                                        onChange={(e) =>
                                            onFilterChange(
                                                "minPrice",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-600 mb-1">
                                        Max Price
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="₹50,000"
                                        value={selectedFilters.maxPrice || ""}
                                        onChange={(e) =>
                                            onFilterChange(
                                                "maxPrice",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Range: ₹
                                {(filters.priceRange.min / 100).toLocaleString(
                                    "en-IN"
                                )}{" "}
                                - ₹
                                {(filters.priceRange.max / 100).toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 8: Application (Visible after price selected) */}
                {(selectedFilters.minPrice || selectedFilters.maxPrice) &&
                    renderCheckboxFilter(
                        "application",
                        "Application",
                        filters.application
                    )}

                {/* Step 9: Experience (Visible after application selected) */}
                {selectedFilters.application?.length > 0 &&
                    renderRadioFilter(
                        "experience",
                        "Experience Level",
                        filters.experience
                    )}

                {/* Step 10: Connectivity (Visible after experience selected) */}
                {selectedFilters.experience &&
                    renderCheckboxFilter(
                        "connectivity",
                        "Connectivity",
                        filters.connectivity
                    )}
            </div>
        </div>
    );
}
