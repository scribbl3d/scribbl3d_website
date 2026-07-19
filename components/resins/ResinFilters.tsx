"use client";

import { ResinFiltersState } from "@/app/resins/page";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
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
            <PriceRangeSlider
                min={meta.price.min}
                max={meta.price.max}
                minValue={filters.price?.[0] ?? null}
                maxValue={filters.price?.[1] ?? null}
                onChange={(minPrice, maxPrice) => {
                    setFilters((prev) => ({
                        ...prev,
                        price: minPrice !== null && maxPrice !== null ? [minPrice, maxPrice] : null,
                    }));
                }}
            />
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
