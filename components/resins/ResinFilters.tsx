"use client";

import { ResinFiltersState } from "@/app/resins/page";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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

    const priceValue: [number, number] = filters.price ?? [
        meta.price.min,
        meta.price.max,
    ];

    return (
        <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Filters</h3>

            <Section title="Material Type">
                {meta.materialTypes.map((m) => (
                    <Item
                        key={m}
                        label={m}
                        checked={filters.materialTypes.includes(m)}
                        onChange={() => toggleArray("materialTypes", m)}
                    />
                ))}
            </Section>

            <Section title="Washable Resin">
                <Item
                    label="Water Washable"
                    checked={filters.washable === true}
                    onChange={(v) =>
                        setFilters((p) => ({
                            ...p,
                            washable: v ? true : null,
                        }))
                    }
                />
            </Section>

            <Section title="Printer Compatibility">
                {meta.technologies.map((t) => (
                    <Item
                        key={t}
                        label={t}
                        checked={filters.technologies.includes(t)}
                        onChange={() => toggleArray("technologies", t)}
                    />
                ))}
            </Section>

            <Section title="Resolution">
                {meta.resolutions.map((r) => (
                    <Item
                        key={r}
                        label={r}
                        checked={filters.resolutions.includes(r)}
                        onChange={() => toggleArray("resolutions", r)}
                    />
                ))}
            </Section>

            <Section title="Colour">
                {meta.colours.map((c) => (
                    <Item
                        key={c}
                        label={c}
                        checked={filters.colours.includes(c)}
                        onChange={() => toggleArray("colours", c)}
                    />
                ))}
            </Section>

            <Section title="Brand">
                {meta.brands.map((b) => (
                    <Item
                        key={b}
                        label={b}
                        checked={filters.brands.includes(b)}
                        onChange={() => toggleArray("brands", b)}
                    />
                ))}
            </Section>

            {/* ================= PRICE (FINAL UI) ================= */}
            <div className="space-y-4">
                <p className="font-medium">Price (₹)</p>

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
                />

                <div className="grid grid-cols-2 gap-4">
                    {/* Min */}
                    <div>
                        <label className="text-sm text-gray-500">Min</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Max */}
                    <div>
                        <label className="text-sm text-gray-500">Max</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* helpers */

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="font-medium mb-2">{title}</p>
            <div className="space-y-2">{children}</div>
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
