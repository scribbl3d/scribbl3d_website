"use client";

import { SlidersHorizontal } from "lucide-react";

interface MobileFilamentFilterBarProps {
    onOpenFilters: () => void;
    activeFilterCount: number;
    sortBy: "new" | "price_asc" | "price_desc";
    onSortChange: (value: "new" | "price_asc" | "price_desc") => void;
}

export default function MobileFilamentFilterBar({
    onOpenFilters,
    activeFilterCount,
    sortBy,
    onSortChange,
}: MobileFilamentFilterBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
            <div className="flex gap-3">
                <button
                    onClick={onOpenFilters}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors relative"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as any)}
                    className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                        paddingRight: "2.5rem",
                    }}
                >
                    <option value="new">New Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>
        </div>
    );
}
