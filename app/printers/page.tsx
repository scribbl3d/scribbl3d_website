"use client";

import Loader from "@/components/Loader";
import FilterPanel from "@/components/printers/FilterPanel";
import MobileFilterHeader from "@/components/printers/Mobilefilterheader";
import MobileFilterSheet from "@/components/printers/Mobilefiltersheet ";
import PrinterGrid from "@/components/printers/PrinterGrid";
import PrinterHero from "@/components/printers/PrinterHero";
import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useEffect, useState } from "react";

const PAGE_LIMIT = 9;

export default function PrintersPage() {
    const isInitialLoading = useAutoImageLoader();
    const [printers, setPrinters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    /* ================= MOBILE FILTER SHEET STATE ================= */
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    /* ================= FILTER OPTIONS (from API) ================= */
    const [filters, setFilters] = useState({
        technology: [],
        brand: [],
        volumeCategory: [],
        material: [],
        recyclingRatio: [],
        chamberType: [],
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
        chamberType: [],
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
                "chamberType",
                "application",
                "experience",
                "connectivity",
            ];

            arrayFilters.forEach((key) => {
                // @ts-ignore
                if (selectedFilters[key]?.length > 0) {
                    // @ts-ignore
                    selectedFilters[key].forEach((val) =>
                        params.append(key, val),
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
            chamberType: [],
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
        <main className="w-full">
            {/* 1. GLOBAL OVERLAY LOADER */}
            {isInitialLoading && <Loader />}
            <div
                className="min-h-screen bg-gray-50"
                style={{
                    opacity: isInitialLoading ? 0 : 1,
                    visibility: isInitialLoading ? "hidden" : "visible",
                    transition: "opacity 0.8s ease-in-out",
                }}
            >
                <div className="min-h-screen bg-gray-50">
                    <PrinterHero />

                    {/* Mobile Header with Filters & Sort - only visible on mobile */}
                    <div className="lg:hidden sticky top-0 z-30 bg-white">
                        <MobileFilterHeader
                            onOpenFilters={() => setIsMobileFilterOpen(true)}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />
                    </div>

                    {/* Mobile Filter Sheet */}
                    <MobileFilterSheet
                        isOpen={isMobileFilterOpen}
                        onClose={() => setIsMobileFilterOpen(false)}
                        filters={filters}
                        selectedFilters={selectedFilters}
                        onFilterChange={handleFilterChange}
                        onReset={resetFilters}
                    />

                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar Filter Panel - hidden on mobile */}
                            <div className="hidden lg:block lg:w-1/4">
                                <FilterPanel
                                    filters={filters}
                                    selectedFilters={selectedFilters}
                                    onFilterChange={handleFilterChange}
                                    onReset={resetFilters}
                                />
                            </div>

                            {/* Grid */}
                            <div className="w-full lg:w-3/4">
                                <SelectedFiltersBar
                                    selectedFilters={selectedFilters}
                                    onRemove={removeFilter}
                                />

                                {/* Top Bar - hidden on mobile since we have MobileFilterHeader */}
                                <div className="hidden lg:flex mb-6 justify-between items-center">
                                    <p className="text-gray-600">
                                        Showing{" "}
                                        <span className="font-semibold">
                                            {total}
                                        </span>{" "}
                                        printer{total !== 1 ? "s" : ""}
                                    </p>

                                    <div className="relative min-w-[177px]">
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(e.target.value)
                                            }
                                            className="
                                                w-full
                                                h-[38px]
                                                bg-white
                                                border border-[#D1D5DC]
                                                rounded-[10px]
                                                px-4 pr-10
                                                text-sm
                                                text-gray-700
                                                focus:outline-none
                                                appearance-none
                                                cursor-pointer
                                            "
                                        >
                                            <option value="popularity">
                                                Sort by: Popularity
                                            </option>
                                            <option value="new">
                                                New Arrivals
                                            </option>
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

                                        {/* Custom arrow */}
                                        <svg
                                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#6B7280"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Mobile results count */}
                                <div className="lg:hidden mb-4">
                                    <p className="text-sm text-gray-600">
                                        Showing{" "}
                                        <span className="font-semibold">
                                            {total}
                                        </span>{" "}
                                        printer{total !== 1 ? "s" : ""}
                                    </p>
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
            </div>
        </main>
    );
}
