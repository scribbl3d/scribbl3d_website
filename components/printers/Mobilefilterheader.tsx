"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface MobileFilterHeaderProps {
    onOpenFilters: () => void;
    sortBy: string;
    onSortChange: (value: string) => void;
}

export default function MobileFilterHeader({
    onOpenFilters,
    sortBy,
    onSortChange,
}: MobileFilterHeaderProps) {
    const [showSortMenu, setShowSortMenu] = useState(false);

    const sortOptions = [
        { value: "popularity", label: "Popularity" },
        { value: "new", label: "New Arrivals" },
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },
        { value: "discount_asc", label: "Discount: Low to High" },
        { value: "discount_desc", label: "Discount: High to Low" },
    ];

    const currentSortLabel =
        sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort";

    return (
        <div className="flex gap-3 px-4 py-3 bg-white border-b border-gray-100">
            {/* Filters Button */}
            <button
                onClick={onOpenFilters}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
            </button>

            {/* Sort Button */}
            <div className="relative">
                <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors min-w-[100px]"
                >
                    <ChevronDown
                        size={18}
                        className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                    />
                    <span>Sort</span>
                </button>

                {/* Sort Dropdown */}
                {showSortMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowSortMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setShowSortMenu(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                        sortBy === option.value
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
