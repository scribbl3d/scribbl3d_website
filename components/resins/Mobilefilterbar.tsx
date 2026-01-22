"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface MobileFilterBarProps {
    onOpenFilters: () => void;
    onOpenSort: () => void;
    activeFilterCount?: number;
}

export default function MobileFilterBar({
    onOpenFilters,
    onOpenSort,
    activeFilterCount = 0,
}: MobileFilterBarProps) {
    return (
        <div className="flex gap-3 lg:hidden mb-4">
            {/* Filters Button - Takes more space */}
            <button
                onClick={onOpenFilters}
                className="flex-[2] flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Sort Button */}
            <button
                onClick={onOpenSort}
                className="flex-1 flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
                <ChevronDown size={18} />
                <span>Sort</span>
            </button>
        </div>
    );
}
