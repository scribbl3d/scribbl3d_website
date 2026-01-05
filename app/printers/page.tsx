"use client";

import FilterPanel from "@/components/printers/FilterPanel";
import PrinterGrid from "@/components/printers/PrinterGrid";
import PrinterHero from "@/components/printers/PrinterHero";
import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";
import { useEffect, useState } from "react";

const PAGE_LIMIT = 5;

export default function PrintersPage() {
    const [printers, setPrinters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    /* ================= FILTER OPTIONS ================= */
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

    /* ================= SELECTED FILTERS ================= */
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

    /* ================= SORT & PAGINATION ================= */
    const [sortBy, setSortBy] = useState<string>("new");
    const [page, setPage] = useState<number>(1);

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        fetchPrinters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilters, sortBy, page]);

    /* Reset page when filters or sort change */
    useEffect(() => {
        setPage(1);
    }, [selectedFilters, sortBy]);

    const fetchPrinters = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            /* ARRAY FILTERS */
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
                // @ts-ignore
                if (selectedFilters[key]?.length > 0) {
                    // @ts-ignore
                    selectedFilters[key].forEach((val) =>
                        params.append(key, val)
                    );
                }
            });

            /* PRICE FILTER */
            if (selectedFilters.minPrice)
                params.append("minPrice", selectedFilters.minPrice);
            if (selectedFilters.maxPrice)
                params.append("maxPrice", selectedFilters.maxPrice);

            /* SORT & PAGINATION */
            params.append("sortBy", sortBy);
            params.append("page", String(page));
            params.append("limit", String(PAGE_LIMIT));

            const res = await fetch(`/api/printers?${params.toString()}`);
            const data = await res.json();

            setPrinters(data.printers || []);
            setTotal(data.total || 0);

            if (data.filters) {
                setFilters(data.filters);
            }
        } catch (err) {
            console.error("Error fetching printers:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FILTER HANDLERS ================= */
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

    /* ================= UI ================= */
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

                        {/* Top Bar */}
                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-gray-600">
                                Showing{" "}
                                <span className="font-semibold">{total}</span>{" "}
                                printer{total !== 1 ? "s" : ""}
                            </p>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
                            >
                                <option value="new">New Arrivals</option>
                                <option value="price_asc">
                                    Price: Low to High
                                </option>
                                <option value="price_desc">
                                    Price: High to Low
                                </option>
                                <option value="discount_asc">
                                    Discount: Low to High
                                </option>
                                <option value="discount_desc">
                                    Discount: High to Low
                                </option>
                            </select>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                                <p className="mt-4 text-gray-600">
                                    Loading printers...
                                </p>
                            </div>
                        ) : (
                            <PrinterGrid
                                printers={printers}
                                page={page}
                                total={total}
                                limit={PAGE_LIMIT}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
