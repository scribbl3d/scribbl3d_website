"use client";

import { X, Loader2 } from "lucide-react";
import { FilamentFiltersState } from "./FilamentFilters";
import { useEffect, useState } from "react";
import PriceRangeSlider from "@/components/printers/PriceRangeSlider";

interface MobileFilamentFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilamentFiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FilamentFiltersState>>;
    onApply: () => void;
}

type FilterOptions = {
    materials: string[];
    finishTypes: string[];
    brands: string[];
    printerCompatibility: string[];
    diameters: string[];
    spoolWeights: string[];
    priceRange: { min: number; max: number };
};

export default function MobileFilamentFilters({
    isOpen,
    onClose,
    filters,
    setFilters,
    onApply,
}: MobileFilamentFiltersProps) {
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch filter options when component mounts
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const res = await fetch("/api/filaments/filters");
                const data = await res.json();
                setFilterOptions(data);
            } catch (err) {
                console.error("Failed to fetch filter options:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFilterOptions();
    }, []);

    // Prevent body scroll when modal is open
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

    const toggleArrayFilter = (key: keyof FilamentFiltersState, value: string) => {
        setFilters((prev) => {
            const currentArray = prev[key] as string[];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((v) => v !== value)
                : [...currentArray, value];
            return { ...prev, [key]: newArray };
        });
    };

    const clearAll = () => {
        setFilters({
            materialTypes: [],
            finishTypes: [],
            brands: [],
            price: null,
            printerCompatibility: [],
            diameters: [],
            spoolWeights: [],
        });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`
                    fixed inset-x-0 bottom-0 z-50 lg:hidden
                    bg-white rounded-t-2xl
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? "translate-y-0" : "translate-y-full"}
                    max-h-[90vh] flex flex-col
                `}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading || !filterOptions ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Loading filters...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <FilterSection
                                title="Material Type"
                                options={filterOptions.materials}
                                selected={filters.materialTypes}
                                onToggle={(v) => toggleArrayFilter("materialTypes", v)}
                            />

                            <FilterSection
                                title="Finish"
                                options={filterOptions.finishTypes}
                                selected={filters.finishTypes}
                                onToggle={(v) => toggleArrayFilter("finishTypes", v)}
                            />

                            <FilterSection
                                title="Brand"
                                options={filterOptions.brands}
                                selected={filters.brands}
                                onToggle={(v) => toggleArrayFilter("brands", v)}
                            />

                            <FilterSection
                                title="Diameter"
                                options={filterOptions.diameters}
                                selected={filters.diameters}
                                onToggle={(v) => toggleArrayFilter("diameters", v)}
                            />

                            <FilterSection
                                title="Spool Weight"
                                options={filterOptions.spoolWeights}
                                selected={filters.spoolWeights}
                                onToggle={(v) => toggleArrayFilter("spoolWeights", v)}
                            />

                            <FilterSection
                                title="Printer Compatibility"
                                options={filterOptions.printerCompatibility}
                                selected={filters.printerCompatibility}
                                onToggle={(v) => toggleArrayFilter("printerCompatibility", v)}
                            />

                            {/* Price Range Filter */}
                            <PriceRangeSlider
                                min={filterOptions.priceRange.min}
                                max={filterOptions.priceRange.max}
                                minValue={filters.price?.[0] ?? null}
                                maxValue={filters.price?.[1] ?? null}
                                onChange={(minPrice, maxPrice) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        price: minPrice !== null && maxPrice !== null ? [minPrice, maxPrice] : null,
                                    }));
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-4 py-4 border-t border-gray-100 bg-white">
                            <button
                                onClick={clearAll}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => {
                                    onApply();
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

function FilterSection({
    title,
    options,
    selected,
    onToggle,
}: {
    title: string;
    options: string[];
    selected: string[];
    onToggle: (value: string) => void;
}) {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
            <div className="space-y-2">
                {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={() => onToggle(option)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
