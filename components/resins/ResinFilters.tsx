"use client";

import { ResinFiltersState } from "@/app/resins/page";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type FiltersMeta = {
    materialTypes: string[];
    technologies: string[];
    resolutions: string[];
    colours: string[];
    brands: string[];
    price: { min: number; max: number };
};

export default function ResinFilters({
    filters,
    setFilters,
}: {
    filters: ResinFiltersState;
    setFilters: React.Dispatch<React.SetStateAction<ResinFiltersState>>;
}) {
    const [meta, setMeta] = useState<FiltersMeta | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/resins/filters")
            .then((r) => r.json())
            .then(setMeta);
    }, []);

    if (!meta) {
        return <Card className="p-6">Loading filters…</Card>;
    }

    const toggleArray = (key: keyof ResinFiltersState, value: string) => {
        setFilters((prev) => {
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

    const priceValue: [number, number] = filters.price ?? [
        meta.price.min,
        meta.price.max,
    ];

    return (
        <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Filters</h3>

            {/* Material Type - Always Open */}
            <div className="border-b border-gray-200 pb-4">
                <p className="font-medium mb-3">Material Type</p>
                <div className="space-y-2">
                    {meta.materialTypes.map((m) => (
                        <Item
                            key={m}
                            label={m}
                            checked={filters.materialTypes.includes(m)}
                            onChange={() => toggleArray("materialTypes", m)}
                        />
                    ))}
                </div>
            </div>

            <AccordionSection
                title="Brand"
                isExpanded={expandedSections.has("brand")}
                onToggle={() => toggleSection("brand")}
            >
                {meta.brands.map((b) => (
                    <Item
                        key={b}
                        label={b}
                        checked={filters.brands.includes(b)}
                        onChange={() => toggleArray("brands", b)}
                    />
                ))}
            </AccordionSection>

            <AccordionSection
                title="Colour"
                isExpanded={expandedSections.has("colour")}
                onToggle={() => toggleSection("colour")}
            >
                {meta.colours.map((c) => (
                    <Item
                        key={c}
                        label={c}
                        checked={filters.colours.includes(c)}
                        onChange={() => toggleArray("colours", c)}
                    />
                ))}
            </AccordionSection>

            <AccordionSection
                title="Resolution"
                isExpanded={expandedSections.has("resolution")}
                onToggle={() => toggleSection("resolution")}
            >
                {meta.resolutions.map((r) => (
                    <Item
                        key={r}
                        label={r}
                        checked={filters.resolutions.includes(r)}
                        onChange={() => toggleArray("resolutions", r)}
                    />
                ))}
            </AccordionSection>

            <AccordionSection
                title="Printer Compatibility"
                isExpanded={expandedSections.has("printer")}
                onToggle={() => toggleSection("printer")}
            >
                {meta.technologies.map((t) => (
                    <Item
                        key={t}
                        label={t}
                        checked={filters.technologies.includes(t)}
                        onChange={() => toggleArray("technologies", t)}
                    />
                ))}
            </AccordionSection>

            {/* ================= PRICE (FINAL UI) ================= */}
            <div className="border-b border-gray-200 pb-4">
                <p className="font-medium mb-4">Price (₹)</p>

                <div className="px-1">
                    <Slider
                        min={meta.price.min}
                        max={meta.price.max}
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
                    {/* Min */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Min</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                ₹
                            </span>
                            <input
                                type="number"
                                min={meta.price.min}
                                max={priceValue[1]}
                                value={priceValue[0]}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        price: [
                                            Number(e.target.value) ||
                                                meta.price.min,
                                            priceValue[1],
                                        ],
                                    }))
                                }
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Max */}
                    <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Max</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                                ₹
                            </span>
                            <input
                                type="number"
                                min={priceValue[0]}
                                max={meta.price.max}
                                value={priceValue[1]}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        price: [
                                            priceValue[0],
                                            Number(e.target.value) ||
                                                meta.price.max,
                                        ],
                                    }))
                                }
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* helpers */

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
                className="w-full flex items-center justify-between mb-3 text-left hover:text-blue-600 transition-colors"
            >
                <span className="font-medium">{title}</span>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                />
            </button>
            {isExpanded && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
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
        <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={checked} onCheckedChange={onChange} />
            {label}
        </label>
    );
}
