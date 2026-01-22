"use client";

import { ResinFiltersState } from "@/app/resins/page";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

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
                        <div className="space-y-1">
                            {/* Material Type */}
                            <FilterSection title="Material Type">
                                {meta.materialTypes.map((m) => (
                                    <FilterItem
                                        key={m}
                                        label={m}
                                        checked={localFilters.materialTypes.includes(
                                            m,
                                        )}
                                        onChange={() =>
                                            toggleArray("materialTypes", m)
                                        }
                                    />
                                ))}
                            </FilterSection>

                            {/* Printer Compatibility */}
                            <FilterSection title="Printer Compatibility">
                                {meta.technologies.map((t) => (
                                    <FilterItem
                                        key={t}
                                        label={t}
                                        checked={localFilters.technologies.includes(
                                            t,
                                        )}
                                        onChange={() =>
                                            toggleArray("technologies", t)
                                        }
                                    />
                                ))}
                            </FilterSection>

                            {/* Washable Resin */}
                            <FilterSection title="Washable Resin">
                                <FilterItem
                                    label="Yes (Water Washable)"
                                    checked={localFilters.washable === true}
                                    onChange={(v) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            washable: v ? true : null,
                                        }))
                                    }
                                />
                                <FilterItem
                                    label="No (IPA Wash)"
                                    checked={localFilters.washable === false}
                                    onChange={(v) =>
                                        setLocalFilters((p) => ({
                                            ...p,
                                            washable: v ? false : null,
                                        }))
                                    }
                                />
                            </FilterSection>

                            {/* Resolution */}
                            <FilterSection title="Resolution Optimization">
                                {meta.resolutions.map((r) => (
                                    <FilterItem
                                        key={r}
                                        label={r}
                                        checked={localFilters.resolutions.includes(
                                            r,
                                        )}
                                        onChange={() =>
                                            toggleArray("resolutions", r)
                                        }
                                    />
                                ))}
                            </FilterSection>

                            {/* Colour */}
                            <FilterSection title="Color">
                                {meta.colours.map((c) => (
                                    <FilterItem
                                        key={c}
                                        label={c}
                                        checked={localFilters.colours.includes(
                                            c,
                                        )}
                                        onChange={() =>
                                            toggleArray("colours", c)
                                        }
                                    />
                                ))}
                            </FilterSection>

                            {/* Brand */}
                            <FilterSection title="Brand">
                                {meta.brands.map((b) => (
                                    <FilterItem
                                        key={b}
                                        label={b}
                                        checked={localFilters.brands.includes(
                                            b,
                                        )}
                                        onChange={() =>
                                            toggleArray("brands", b)
                                        }
                                    />
                                ))}
                            </FilterSection>
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

/* Filter Section Component */
function FilterSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
            <p className="text-sm font-medium text-gray-500 mb-3">{title}</p>
            <div className="space-y-3 pl-1">{children}</div>
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
