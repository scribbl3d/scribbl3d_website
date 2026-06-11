"use client";

import { X } from "lucide-react";
import { FilamentFiltersState } from "./FilamentFilters";

interface MobileFilamentFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilamentFiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FilamentFiltersState>>;
    onApply: () => void;
}

const materialTypes = ["PLA", "ABS", "PETG", "TPU", "Nylon", "Wood Fill", "Metal Fill"];
const finishTypes = ["Matte", "Glossy", "Silk", "Metallic", "Translucent"];
const brands = ["eSUN", "Hatchbox", "Overture", "Polymaker", "Prusament"];
const diameters = ["1.75mm", "2.85mm", "3mm"];
const spoolWeights = ["250g", "500g", "1kg", "2kg"];

export default function MobileFilamentFilters({
    isOpen,
    onClose,
    filters,
    setFilters,
    onApply,
}: MobileFilamentFiltersProps) {
    if (!isOpen) return null;

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

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <FilterSection
                        title="Material Type"
                        options={materialTypes}
                        selected={filters.materialTypes}
                        onToggle={(v) => toggleArrayFilter("materialTypes", v)}
                    />

                    <FilterSection
                        title="Finish"
                        options={finishTypes}
                        selected={filters.finishTypes}
                        onToggle={(v) => toggleArrayFilter("finishTypes", v)}
                    />

                    <FilterSection
                        title="Brand"
                        options={brands}
                        selected={filters.brands}
                        onToggle={(v) => toggleArrayFilter("brands", v)}
                    />

                    <FilterSection
                        title="Diameter"
                        options={diameters}
                        selected={filters.diameters}
                        onToggle={(v) => toggleArrayFilter("diameters", v)}
                    />

                    <FilterSection
                        title="Spool Weight"
                        options={spoolWeights}
                        selected={filters.spoolWeights}
                        onToggle={(v) => toggleArrayFilter("spoolWeights", v)}
                    />
                </div>

                <div className="p-4 border-t space-y-2">
                    <button
                        onClick={clearAll}
                        className="w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={() => {
                            onApply();
                            onClose();
                        }}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
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
