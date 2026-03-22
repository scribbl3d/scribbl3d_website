"use client";

import { X } from "lucide-react";

type Props = {
    selectedFilters: any;
    onRemove: (key: string, value?: string) => void;
};

// Map filter keys to display-friendly names
const filterLabels: Record<string, string> = {
    technology: "Technology",
    brand: "Brand",
    volumeCategory: "Volume Category",
    material: "Material",
    chamberType: "Chamber Type",
    connectivity: "Connectivity",
    application: "Application",
    recyclingRatio: "Recycling Ratio",
    experience: "Experience",
    minPrice: "Min Price",
    maxPrice: "Max Price",
};

export default function SelectedFiltersBar({
    selectedFilters,
    onRemove,
}: Props) {
    const chips: { key: string; label: string; value?: string }[] = [];

    Object.entries(selectedFilters).forEach(([key, value]) => {
        if (!value) return;

        // Skip null/undefined/empty values
        if (value === null || value === undefined) return;

        // Get display label for the key
        const keyLabel = filterLabels[key] || formatKey(key);

        // For array filters
        if (Array.isArray(value) && value.length > 0) {
            value.forEach((v) => {
                const displayValue = v === "__all__" ? "All" : v;
                chips.push({
                    key,
                    value: v,
                    label: `${keyLabel}: ${displayValue}`,
                });
            });
        }
        // For price filters (numbers/strings) - values already in rupees
        else if (key === "minPrice" || key === "maxPrice") {
            const displayValue =
                typeof value === "number"
                    ? `₹${value.toLocaleString("en-IN")}`
                    : `₹${value}`;
            chips.push({
                key,
                label: `${keyLabel}: ${displayValue}`,
            });
        }
    });

    if (chips.length === 0) return null;

    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((chip, index) => (
                <span
                    key={`${chip.key}-${chip.value || index}`}
                    className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                >
                    <span className="max-w-[200px] truncate">{chip.label}</span>
                    <button
                        onClick={() => onRemove(chip.key, chip.value)}
                        className="flex-shrink-0 text-blue-500 hover:text-blue-700 transition-colors"
                        aria-label={`Remove ${chip.label} filter`}
                    >
                        <X size={14} />
                    </button>
                </span>
            ))}
        </div>
    );
}

// Fallback formatter for unknown keys
function formatKey(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}
