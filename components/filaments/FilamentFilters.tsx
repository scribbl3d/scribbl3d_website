"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export type FilamentFiltersState = {
    materialTypes: string[];
    finishTypes: string[];
    brands: string[];
    price: [number, number] | null;
    printerCompatibility: string[];
    diameters: string[];
    spoolWeights: string[];
};


// Default fallback values
export const FILTER_META = {
    materialTypes: ["PLA", "PLA+", "PETG", "ABS", "TPU", "ASA", "Nylon", "Carbon Fiber"],
    finishTypes: ["Matte", "Silk", "Glossy", "Metallic", "Carbon Fiber", "Transparent", "Marble", "Wood"],
    brands: ["Elegoo", "eSUN", "SUNLU", "Polymaker", "Bambu Lab", "Anycubic"],
    printerCompatibility: ["Bambu Lab", "Creality", "Prusa", "Anycubic"],
    diameters: ["1.75mm", "2.85mm"],
    spoolWeights: ["250g", "500g", "1kg", "2kg+"],
    price: { min: 500, max: 5000 }
};

type FilterOptions = {
    materials: string[];
    finishTypes: string[];
    brands: string[];
    printerCompatibility: string[];
    diameters: string[];
    spoolWeights: string[];
    priceRange: { min: number; max: number };
};

export default function FilamentFilters({
    filters,
    setFilters,
}: {
    filters: FilamentFiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FilamentFiltersState>>;
}) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch real filter options from API
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const res = await fetch("/api/filaments/filters");
                const data = await res.json();
                setFilterOptions(data);
            } catch (err) {
                console.error("Failed to fetch filter options:", err);
                // Use fallback values
                setFilterOptions({
                    materials: FILTER_META.materialTypes,
                    finishTypes: FILTER_META.finishTypes,
                    brands: FILTER_META.brands,
                    printerCompatibility: FILTER_META.printerCompatibility,
                    diameters: FILTER_META.diameters,
                    spoolWeights: FILTER_META.spoolWeights,
                    priceRange: FILTER_META.price,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchFilterOptions();
    }, []);

    const toggleArray = (key: keyof FilamentFiltersState, value: string) => {
        setFilters((prev) => {
            const arr = (prev[key] as string[]) || [];
            return {
                ...prev,
                [key]: arr.includes(value)
                    ? arr.filter((v) => v !== value)
                    : [...arr, value],
            };
        });
    };

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const priceValue: [number, number] = filters.price ?? [
        FILTER_META.price.min,
        FILTER_META.price.max,
    ];

    if (loading) {
        return (
            <Card className="p-6 shadow-sm border-gray-100">
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading filters...</p>
                </div>
            </Card>
        );
    }

    if (!filterOptions) {
        return null;
    }

    return (
        <Card className="p-6 space-y-4 shadow-sm border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Filters</h3>

            {/* Material Type - Always Open */}
            <div className="border-b border-gray-100 pb-4">
                <p className="font-semibold text-gray-900 mb-3 text-sm">Material Type</p>
                <div className="space-y-2.5">
                    {filterOptions.materials.map((m) => (
                        <Item
                            key={m}
                            label={m}
                            checked={filters.materialTypes.includes(m)}
                            onChange={() => toggleArray("materialTypes", m)}
                        />
                    ))}
                </div>
            </div>


            {/* Finish Type */}
            <AccordionSection
                title="Finish Type"
                isExpanded={expandedSections.has("finish")}
                onToggle={() => toggleSection("finish")}
            >
                {filterOptions.finishTypes.map((f) => (
                    <Item
                        key={f}
                        label={f}
                        checked={filters.finishTypes.includes(f)}
                        onChange={() => toggleArray("finishTypes", f)}
                    />
                ))}
            </AccordionSection>

            {/* Brand */}
            <AccordionSection
                title="Brand"
                isExpanded={expandedSections.has("brand")}
                onToggle={() => toggleSection("brand")}
            >
                {filterOptions.brands.map((b) => (
                    <Item
                        key={b}
                        label={b}
                        checked={filters.brands.includes(b)}
                        onChange={() => toggleArray("brands", b)}
                    />
                ))}
            </AccordionSection>

            {/* Price */}
            <div className="border-b border-gray-100 pb-4">
                <p className="font-semibold text-gray-900 mb-4 text-sm">Price Range (₹)</p>

                <div className="px-1">
                    <Slider
                        min={filterOptions.priceRange.min}
                        max={filterOptions.priceRange.max}
                        step={100}
                        value={priceValue}
                        onValueChange={(v) =>
                            setFilters((p) => ({
                                ...p,
                                price: v as [number, number],
                            }))
                        }
                        className="mb-6"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Min</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                                type="number"
                                min={filterOptions.priceRange.min}
                                max={priceValue[1]}
                                value={priceValue[0]}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        price: [Number(e.target.value) || filterOptions.priceRange.min, priceValue[1]],
                                    }))
                                }
                                className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Max</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                                type="number"
                                min={priceValue[0]}
                                max={filterOptions.priceRange.max}
                                value={priceValue[1]}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        price: [priceValue[0], Number(e.target.value) || filterOptions.priceRange.max],
                                    }))
                                }
                                className="w-full pl-7 pr-2 py-1.5 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            <AccordionSection
                title="Advanced Filters"
                isExpanded={expandedSections.has("advanced")}
                onToggle={() => toggleSection("advanced")}
                isAdvanced
            >
                <div className="space-y-6 pt-2">
                    
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Printer Compatibility</p>
                        <div className="space-y-2">
                            {filterOptions.printerCompatibility.map((p) => (
                                <Item key={p} label={p} checked={filters.printerCompatibility.includes(p)} onChange={() => toggleArray("printerCompatibility", p)} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Diameter</p>
                        <div className="space-y-2">
                            {filterOptions.diameters.map((d) => (
                                <Item key={d} label={d} checked={filters.diameters.includes(d)} onChange={() => toggleArray("diameters", d)} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Spool Weight</p>
                        <div className="space-y-2">
                            {filterOptions.spoolWeights.map((s) => (
                                <Item key={s} label={s} checked={filters.spoolWeights.includes(s)} onChange={() => toggleArray("spoolWeights", s)} />
                            ))}
                        </div>
                    </div>

                </div>
            </AccordionSection>

        </Card>
    );
}

function AccordionSection({
    title,
    isExpanded,
    onToggle,
    children,
    isAdvanced
}: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    isAdvanced?: boolean;
}) {
    return (
        <div className="border-b border-gray-100 pb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between mb-2 text-left hover:text-blue-600 transition-colors"
            >
                <span className={`font-semibold text-sm ${isAdvanced ? 'text-gray-600' : 'text-gray-900'}`}>{title}</span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                />
            </button>
            {isExpanded && (
                <div className="space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200 mt-3">
                    {children}
                </div>
            )}
        </div>
    );
}

function Item({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 cursor-pointer group">
            <Checkbox checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
            <span className="group-hover:translate-x-0.5 transition-transform">{label}</span>
        </label>
    );
}
