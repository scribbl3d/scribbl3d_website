"use client";

import FilterPanel from "@/components/printers/FilterPanel";
import PrinterGrid from "@/components/printers/PrinterGrid";
import PrinterHero from "@/components/printers/PrinterHero";
import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";
import { useEffect, useState } from "react";

export default function PrintersPage() {
    const [printers, setPrinters] = useState([]);

    // SAFE INITIALIZATION: Initialize with empty arrays to prevent UI errors
    const [filters, setFilters] = useState({
        technology: [],
        brand: [],
        volumeCategory: [],
        material: [],
        recyclingRatio: [],
        atmosphereControl: [],
        priceRange: null,
        application: [],
        experience: [],
        connectivity: [],
    });

    // STATE: Track selected filters (Arrays for multi-select)
    const [selectedFilters, setSelectedFilters] = useState({
        technology: [],
        brand: [],
        volumeCategory: [],
        material: [],
        recyclingRatio: [],
        atmosphereControl: [],
        minPrice: null,
        maxPrice: null,
        application: [],
        experience: [],
        connectivity: [],
    });

    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchPrinters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilters]);

    const fetchPrinters = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            // APPEND ARRAYS: Loop through all array-based filters
            const arrayFilters = [
                "technology",
                "brand",
                "volumeCategory",
                "material",
                "recyclingRatio",
                "atmosphereControl",
                "application",
                "experience",
                "connectivity",
            ];

            arrayFilters.forEach((key) => {
                // @ts-ignore - Accessing state dynamically
                if (selectedFilters[key]?.length > 0) {
                    // @ts-ignore
                    selectedFilters[key].forEach((val) =>
                        params.append(key, val)
                    );
                }
            });

            // APPEND SINGLE VALUES: Price
            if (selectedFilters.minPrice)
                params.append("minPrice", selectedFilters.minPrice);
            if (selectedFilters.maxPrice)
                params.append("maxPrice", selectedFilters.maxPrice);

            const response = await fetch(`/api/printers?${params.toString()}`);
            const data = await response.json();

            setPrinters(data.printers || []);
            setTotal(data.total || 0);

            // UPDATE FILTERS: Only if data exists
            if (data.filters) {
                setFilters(data.filters);
            }
        } catch (error) {
            console.error("Error fetching printers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterKey: string, value: any) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [filterKey]: value,
        }));
    };

    const resetFilters = () => {
        setSelectedFilters({
            technology: [],
            brand: [],
            volumeCategory: [],
            material: [],
            recyclingRatio: [],
            atmosphereControl: [],
            minPrice: null,
            maxPrice: null,
            application: [],
            experience: [],
            connectivity: [],
        });
    };

    const removeFilter = (filterKey: string, value?: string) => {
        setSelectedFilters((prev) => {
            // @ts-ignore
            const current = prev[filterKey];
            if (Array.isArray(current)) {
                return {
                    ...prev,
                    [filterKey]: current.filter((v) => v !== value),
                };
            }
            return {
                ...prev,
                [filterKey]: null,
            };
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PrinterHero />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <FilterPanel
                            filters={filters}
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onReset={resetFilters}
                        />
                    </div>
                    {/* Grid */}
                    <div className="lg:w-3/4">
                        <SelectedFiltersBar
                            selectedFilters={selectedFilters}
                            onRemove={removeFilter}
                        />
                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-gray-600">
                                Showing{" "}
                                <span className="font-semibold">{total}</span>{" "}
                                printer{total !== 1 ? "s" : ""}
                            </p>
                            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                                <option>Sort by: Popularity</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                <p className="mt-4 text-gray-600">
                                    Loading printers...
                                </p>
                            </div>
                        ) : (
                            <PrinterGrid printers={printers} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
