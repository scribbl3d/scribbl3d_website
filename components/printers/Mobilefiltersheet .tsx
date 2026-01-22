"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface MobileFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    filters: any;
    selectedFilters: any;
    onFilterChange: (key: string, value: any) => void;
    onReset: () => void;
}

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
            // Deselect technology - clear all filters
            onReset();
        } else {
            // Select new technology - reset dependent filters
            onFilterChange("technology", [tech]);
            onFilterChange("brand", []);
            onFilterChange("volumeCategory", []);
            onFilterChange("material", []);
            onFilterChange("atmosphereControl", []);
            onFilterChange("connectivity", []);
            onFilterChange("application", []);
            onFilterChange("recyclingRatio", []);
            onFilterChange("experience", []);
            onFilterChange("minPrice", null);
            onFilterChange("maxPrice", null);
        }
    };

    const isStepUnlocked = (key: string) =>
        selectedFilters[key] && selectedFilters[key].length > 0;

    const getSelectedTechnology = () => {
        return selectedFilters.technology?.[0] || null;
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
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            Filters
                        </h3>

                        {/* Technology Section */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 mt-4">
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
                                                : "bg-white text-gray-700 border-gray-200"
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
                                {/* Progressive unlock info */}
                                <p className="text-sm text-gray-500 mb-4">
                                    Filters unlock progressively to ensure only
                                    compatible {getSelectedTechnology()}{" "}
                                    printers are shown.
                                </p>

                                <div className="border-t border-gray-200 my-4" />

                                {/* Brand Section */}
                                {filters?.brand?.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                            Brand
                                        </h4>
                                        <div className="space-y-3">
                                            {filters.brand.map(
                                                (brand: string) => (
                                                    <label
                                                        key={brand}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectedFilters.brand?.includes(
                                                                    brand,
                                                                ) || false
                                                            }
                                                            onChange={() =>
                                                                handleArrayToggle(
                                                                    "brand",
                                                                    brand,
                                                                )
                                                            }
                                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700">
                                                            {brand}
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Build Volume - unlocks after Brand */}
                                {isStepUnlocked("brand")
                                    ? filters?.volumeCategory?.length > 0 && (
                                          <div className="mb-6">
                                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                  Build Volume
                                              </h4>
                                              <div className="space-y-3">
                                                  {filters.volumeCategory.map(
                                                      (vol: string) => (
                                                          <label
                                                              key={vol}
                                                              className="flex items-center cursor-pointer"
                                                          >
                                                              <input
                                                                  type="checkbox"
                                                                  checked={
                                                                      selectedFilters.volumeCategory?.includes(
                                                                          vol,
                                                                      ) || false
                                                                  }
                                                                  onChange={() =>
                                                                      handleArrayToggle(
                                                                          "volumeCategory",
                                                                          vol,
                                                                      )
                                                                  }
                                                                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                              />
                                                              <span className="ml-3 text-sm text-gray-700">
                                                                  {vol}
                                                              </span>
                                                          </label>
                                                      ),
                                                  )}
                                              </div>
                                          </div>
                                      )
                                    : isStepUnlocked("technology") &&
                                      filters?.brand?.length > 0 && (
                                          <div className="mb-6 opacity-50">
                                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                  Build Volume
                                                  <span className="text-xs text-gray-400 font-normal ml-2">
                                                      (Select Brand first)
                                                  </span>
                                              </h4>
                                              <div className="space-y-3">
                                                  {[
                                                      "Less than 300 mm",
                                                      "300 – 500 mm",
                                                      "Above 500 mm",
                                                  ].map((vol: string) => (
                                                      <label
                                                          key={vol}
                                                          className="flex items-center cursor-not-allowed"
                                                      >
                                                          <input
                                                              type="checkbox"
                                                              disabled
                                                              className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                                                          />
                                                          <span className="ml-3 text-sm text-gray-700">
                                                              {vol}
                                                          </span>
                                                      </label>
                                                  ))}
                                              </div>
                                          </div>
                                      )}

                                {/* Material - unlocks after Build Volume */}
                                {isStepUnlocked("volumeCategory") &&
                                    filters?.material?.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                Material
                                            </h4>
                                            <div className="space-y-3">
                                                {filters.material.map(
                                                    (mat: string) => (
                                                        <label
                                                            key={mat}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedFilters.material?.includes(
                                                                        mat,
                                                                    ) || false
                                                                }
                                                                onChange={() =>
                                                                    handleArrayToggle(
                                                                        "material",
                                                                        mat,
                                                                    )
                                                                }
                                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <span className="ml-3 text-sm text-gray-700">
                                                                {mat}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Chamber Type - unlocks after Material */}
                                {isStepUnlocked("material") &&
                                    filters?.atmosphereControl?.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                Chamber Type
                                            </h4>
                                            <div className="space-y-3">
                                                {filters.atmosphereControl.map(
                                                    (atm: string) => (
                                                        <label
                                                            key={atm}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedFilters.atmosphereControl?.includes(
                                                                        atm,
                                                                    ) || false
                                                                }
                                                                onChange={() =>
                                                                    handleArrayToggle(
                                                                        "atmosphereControl",
                                                                        atm,
                                                                    )
                                                                }
                                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <span className="ml-3 text-sm text-gray-700">
                                                                {atm}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Connectivity - unlocks after Chamber Type */}
                                {isStepUnlocked("atmosphereControl") &&
                                    filters?.connectivity?.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                Connectivity
                                            </h4>
                                            <div className="space-y-3">
                                                {filters.connectivity.map(
                                                    (conn: string) => (
                                                        <label
                                                            key={conn}
                                                            className="flex items-center cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedFilters.connectivity?.includes(
                                                                        conn,
                                                                    ) || false
                                                                }
                                                                onChange={() =>
                                                                    handleArrayToggle(
                                                                        "connectivity",
                                                                        conn,
                                                                    )
                                                                }
                                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <span className="ml-3 text-sm text-gray-700">
                                                                {conn}
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Additional filters after connectivity */}
                                {isStepUnlocked("connectivity") && (
                                    <>
                                        {filters?.application?.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                    Application
                                                </h4>
                                                <div className="space-y-3">
                                                    {filters.application.map(
                                                        (app: string) => (
                                                            <label
                                                                key={app}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        selectedFilters.application?.includes(
                                                                            app,
                                                                        ) ||
                                                                        false
                                                                    }
                                                                    onChange={() =>
                                                                        handleArrayToggle(
                                                                            "application",
                                                                            app,
                                                                        )
                                                                    }
                                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-700">
                                                                    {app}
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {filters?.recyclingRatio?.length >
                                            0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                    Recycling Ratio
                                                </h4>
                                                <div className="space-y-3">
                                                    {filters.recyclingRatio.map(
                                                        (ratio: string) => (
                                                            <label
                                                                key={ratio}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        selectedFilters.recyclingRatio?.includes(
                                                                            ratio,
                                                                        ) ||
                                                                        false
                                                                    }
                                                                    onChange={() =>
                                                                        handleArrayToggle(
                                                                            "recyclingRatio",
                                                                            ratio,
                                                                        )
                                                                    }
                                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-700">
                                                                    {ratio}
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {filters?.experience?.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                    Experience Level
                                                </h4>
                                                <div className="space-y-3">
                                                    {filters.experience.map(
                                                        (exp: string) => (
                                                            <label
                                                                key={exp}
                                                                className="flex items-center cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        selectedFilters.experience?.includes(
                                                                            exp,
                                                                        ) ||
                                                                        false
                                                                    }
                                                                    onChange={() =>
                                                                        handleArrayToggle(
                                                                            "experience",
                                                                            exp,
                                                                        )
                                                                    }
                                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                <span className="ml-3 text-sm text-gray-700">
                                                                    {exp}
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Price Range */}
                                        {filters?.priceRange && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                    Price Range
                                                </h4>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Min"
                                                        value={
                                                            selectedFilters.minPrice ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            onFilterChange(
                                                                "minPrice",
                                                                e.target
                                                                    .value ||
                                                                    null,
                                                            )
                                                        }
                                                        className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Max"
                                                        value={
                                                            selectedFilters.maxPrice ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            onFilterChange(
                                                                "maxPrice",
                                                                e.target
                                                                    .value ||
                                                                    null,
                                                            )
                                                        }
                                                        className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white"
                                                    />
                                                </div>
                                            </div>
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
                        className="flex-1 py-3.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 px-4 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
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
