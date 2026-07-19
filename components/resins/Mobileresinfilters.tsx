"use client";

import { ResinFiltersState } from "@/app/resins/page";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import PriceRangeSlider from "@/components/printers/PriceRangeSlider";

type FiltersMeta = {
    materialTypes: string[];
    technologies: string[];
    resolutions: string[];
    colours: string[];
    brands: string[];
    price: { min: number; max: number };
};

interface MobileResinFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: ResinFiltersState;
    setFilters: React.Dispatch<React.SetStateAction<ResinFiltersState>>;
    onApply: () => void;
}

export default function MobileResinFilters({
    isOpen,
    onClose,
    filters,
    setFilters,
    onApply,
}: MobileResinFiltersProps) {
    const [meta, setMeta] = useState<FiltersMeta | null>(null);
    const [localFilters, setLocalFilters] =
        useState<ResinFiltersState>(filters);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/resins/filters")
            .then((r) => r.json())
            .then(setMeta);
    }, []);

    // Sync local filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

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

    const toggleArray = (key: keyof ResinFiltersState, value: string) => {
        setLocalFilters((prev) => {
            const arr = prev[key] as string[];
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

    const handleClearAll = () => {
        setLocalFilters({
            materialTypes: [],
            technologies: [],
            resolutions: [],
            colours: [],
            brands: [],
            washable: null,
            price: null,
        });
        setExpandedSections(new Set());
    };

    const handleApply = () => {
        setFilters(localFilters);
        onApply();
        onClose();
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
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Filters
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {!meta ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Material Type - Always Open */}
                            <div className="border-b border-gray-200 pb-4">
                                <p className="text-base font-semibold text-gray-900 mb-3">Material Type</p>
                                <div className="space-y-3">
                                    {meta.materialTypes.map((m) => (
                                        <FilterItem
                                            key={m}
                                            label={m}
                                            checked={localFilters.materialTypes.includes(m)}
                                            onChange={() => toggleArray("materialTypes", m)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Brand - Dropdown */}
                            <AccordionSection
                                title="Brand"
                                isExpanded={expandedSections.has("brand")}
                                onToggle={() => toggleSection("brand")}
                            >
                                {meta.brands.map((b) => (
                                    <FilterItem
                                        key={b}
                                        label={b}
                                        checked={localFilters.brands.includes(b)}
                                        onChange={() => toggleArray("brands", b)}
                                    />
                                ))}
                            </AccordionSection>

                            {/* Colour - Dropdown */}
                            <AccordionSection
                                title="Colour"
                                isExpanded={expandedSections.has("colour")}
                                onToggle={() => toggleSection("colour")}
                            >
                                {meta.colours.map((c) => (
                                    <FilterItem
                                        key={c}
                                        label={c}
                                        checked={localFilters.colours.includes(c)}
                                        onChange={() => toggleArray("colours", c)}
                                    />
                                ))}
                            </AccordionSection>

                            {/* Resolution - Dropdown */}
                            <AccordionSection
                                title="Resolution"
                                isExpanded={expandedSections.has("resolution")}
                                onToggle={() => toggleSection("resolution")}
                            >
                                {meta.resolutions.map((r) => (
                                    <FilterItem
                                        key={r}
                                        label={r}
                                        checked={localFilters.resolutions.includes(r)}
                                        onChange={() => toggleArray("resolutions", r)}
                                    />
                                ))}
                            </AccordionSection>

                            {/* Printer Compatibility - Dropdown */}
                            <AccordionSection
                                title="Printer Compatibility"
                                isExpanded={expandedSections.has("printer")}
                                onToggle={() => toggleSection("printer")}
                            >
                                {meta.technologies.map((t) => (
                                    <FilterItem
                                        key={t}
                                        label={t}
                                        checked={localFilters.technologies.includes(t)}
                                        onChange={() => toggleArray("technologies", t)}
                                    />
                                ))}
                            </AccordionSection>

                            {/* Price - Always Visible */}
                            <PriceRangeSlider
                                min={meta.price.min}
                                max={meta.price.max}
                                minValue={localFilters.price?.[0] ?? null}
                                maxValue={localFilters.price?.[1] ?? null}
                                onChange={(minPrice, maxPrice) => {
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        price: minPrice !== null && maxPrice !== null ? [minPrice, maxPrice] : null,
                                    }));
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-4 py-4 border-t border-gray-100 bg-white">
                    <button
                        onClick={handleClearAll}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-3 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
}

/* Accordion Section Component */
function AccordionSection({
    title,
    isExpanded,
    onToggle,
    children,
}: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-gray-200 pb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-2 text-left"
            >
                <span className="text-base font-semibold text-gray-900">{title}</span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                />
            </button>
            {isExpanded && (
                <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

/* Filter Item Component */
function FilterItem({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
            <Checkbox
                checked={checked}
                onCheckedChange={onChange}
                className="h-5 w-5 rounded border-gray-300"
            />
            <span>{label}</span>
        </label>
    );
}
