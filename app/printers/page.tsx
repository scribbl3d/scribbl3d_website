// app/printers/page.tsx
"use client";

import FilterPanel from "@/components/printers/FilterPanel";
import PrinterGrid from "@/components/printers/PrinterGrid";
import PrinterHero from "@/components/printers/PrinterHero";
import { useEffect, useState } from "react";
export default function PrintersPage() {
    const [printers, setPrinters] = useState([]);
    const [filters, setFilters] = useState({});
    const [selectedFilters, setSelectedFilters] = useState({
        technology: null,
        brand: null,
        volumeCategory: null,
        material: [],
        recyclingRatio: null,
        atmosphereControl: null,
        minPrice: null,
        maxPrice: null,
        application: [],
        experience: null,
        connectivity: [],
    });
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchPrinters();
    }, [selectedFilters]);

    const fetchPrinters = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();

            if (selectedFilters.technology) {
                params.append("technology", selectedFilters.technology);
            }
            if (selectedFilters.brand) {
                params.append("brand", selectedFilters.brand);
            }
            if (selectedFilters.volumeCategory) {
                params.append("volumeCategory", selectedFilters.volumeCategory);
            }
            if (selectedFilters.material.length > 0) {
                selectedFilters.material.forEach((m) =>
                    params.append("material", m)
                );
            }
            if (selectedFilters.recyclingRatio) {
                params.append("recyclingRatio", selectedFilters.recyclingRatio);
            }
            if (selectedFilters.atmosphereControl) {
                params.append(
                    "atmosphereControl",
                    selectedFilters.atmosphereControl
                );
            }
            if (selectedFilters.minPrice) {
                params.append("minPrice", selectedFilters.minPrice);
            }
            if (selectedFilters.maxPrice) {
                params.append("maxPrice", selectedFilters.maxPrice);
            }
            if (selectedFilters.application.length > 0) {
                selectedFilters.application.forEach((a) =>
                    params.append("application", a)
                );
            }
            if (selectedFilters.experience) {
                params.append("experience", selectedFilters.experience);
            }
            if (selectedFilters.connectivity.length > 0) {
                selectedFilters.connectivity.forEach((c) =>
                    params.append("connectivity", c)
                );
            }

            const response = await fetch(`/api/printers?${params.toString()}`);
            const data = await response.json();

            setPrinters(data.printers);
            setFilters(data.filters);
            setTotal(data.total);
        } catch (error) {
            console.error("Error fetching printers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterKey, value) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [filterKey]: value,
        }));
    };

    const resetFilters = () => {
        setSelectedFilters({
            technology: null,
            brand: null,
            volumeCategory: null,
            material: [],
            recyclingRatio: null,
            atmosphereControl: null,
            minPrice: null,
            maxPrice: null,
            application: [],
            experience: null,
            connectivity: [],
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <PrinterHero />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <div className="lg:w-1/4">
                        <FilterPanel
                            filters={filters}
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onReset={resetFilters}
                        />
                    </div>

                    {/* Printers Grid */}
                    <div className="lg:w-3/4">
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
                                <option>Name: A to Z</option>
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
