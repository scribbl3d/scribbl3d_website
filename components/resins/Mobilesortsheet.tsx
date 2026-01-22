"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";

interface MobileSortSheetProps {
    isOpen: boolean;
    onClose: () => void;
    sortBy: "new" | "price_asc" | "price_desc";
    setSortBy: (sort: "new" | "price_asc" | "price_desc") => void;
}

const sortOptions = [
    { value: "new", label: "New Arrivals" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
] as const;

export default function MobileSortSheet({
    isOpen,
    onClose,
    sortBy,
    setSortBy,
}: MobileSortSheetProps) {
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

    const handleSelect = (value: "new" | "price_asc" | "price_desc") => {
        setSortBy(value);
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
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Sort
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Options */}
                <div className="py-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                            <span
                                className={`text-base ${
                                    sortBy === option.value
                                        ? "text-gray-900 font-medium"
                                        : "text-gray-600"
                                }`}
                            >
                                {option.label}
                            </span>
                            {sortBy === option.value && (
                                <Check size={20} className="text-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Safe area padding for iOS */}
                <div className="h-6" />
            </div>
        </>
    );
}
