"use client";

import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MobileFilterBarProps {
    onOpenFilters: () => void;
    activeFilterCount?: number;
    sortBy: "new" | "price_asc" | "price_desc";
    onSortChange: (sort: "new" | "price_asc" | "price_desc") => void;
}

const sortOptions = [
    { value: "new", label: "New Arrivals" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
] as const;

export default function MobileFilterBar({
    onOpenFilters,
    activeFilterCount = 0,
    sortBy,
    onSortChange,
}: MobileFilterBarProps) {
    const [showSortSheet, setShowSortSheet] = useState(false);

    // Prevent body scroll when sort sheet is open
    useEffect(() => {
        if (showSortSheet) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showSortSheet]);

    return (
        <>
            {/* ============ STICKY BOTTOM BAR ============ */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
                {/* SORT BY Button */}
                <button
                    onClick={() => setShowSortSheet(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 text-gray-900 active:bg-gray-100 transition-colors"
                >
                    <ArrowUpDown size={16} strokeWidth={2.5} />
                    <span className="text-xs font-semibold tracking-wider uppercase">
                        Sort By
                    </span>
                </button>

                {/* Vertical Divider */}
                <div className="w-px bg-gray-200 my-2" />

                {/* FILTERS Button */}
                <button
                    onClick={onOpenFilters}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 text-gray-900 active:bg-gray-100 transition-colors relative"
                >
                    <SlidersHorizontal size={16} strokeWidth={2.5} />
                    <span className="text-xs font-semibold tracking-wider uppercase">
                        Filters
                    </span>
                    {/* Green dot when filters are active */}
                    {activeFilterCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-green-500 absolute top-2.5 right-[calc(50%-40px)]" />
                    )}
                </button>
            </div>

            {/* ============ SORT BOTTOM SHEET ============ */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
                    showSortSheet
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setShowSortSheet(false)}
            />

            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl transition-transform duration-300 ease-out ${
                    showSortSheet ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900">
                        Sort By
                    </h3>
                    <button
                        onClick={() => setShowSortSheet(false)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Sort Options */}
                <div className="py-2 pb-8">
                    {sortOptions.map((option) => {
                        const isSelected = sortBy === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onSortChange(option.value);
                                    setShowSortSheet(false);
                                }}
                                className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${
                                    isSelected
                                        ? "bg-blue-50"
                                        : "hover:bg-gray-50 active:bg-gray-100"
                                }`}
                            >
                                <span
                                    className={`text-sm ${
                                        isSelected
                                            ? "text-blue-600 font-semibold"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {option.label}
                                </span>

                                {/* Radio indicator */}
                                <span
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isSelected
                                            ? "border-blue-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {isSelected && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
