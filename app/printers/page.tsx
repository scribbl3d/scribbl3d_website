"use client";

import Loader from "@/components/Loader";
import FilterPanel from "@/components/printers/FilterPanel";
import MobileFilterHeader from "@/components/printers/Mobilefilterheader";
import MobileFilterSheet from "@/components/printers/Mobilefiltersheet ";
import PrinterGrid from "@/components/printers/PrinterGrid";
import PrinterHero from "@/components/printers/PrinterHero";
import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Responsive page limit: 10 on mobile (5 rows × 2 cols), 9 on desktop (3 rows × 3 cols)
function usePageLimit() {
    const [limit, setLimit] = useState(() =>
        typeof window !== "undefined" && window.innerWidth < 1280 ? 10 : 9,
    );
    useEffect(() => {
        const update = () => setLimit(window.innerWidth < 1280 ? 10 : 9);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    return limit;
}

export default function PrintersPage() {
    const isInitialLoading = useAutoImageLoader();
    const searchParams = useSearchParams();
    const brandApplied = useRef(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const PAGE_LIMIT = usePageLimit();

    const [printers, setPrinters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [filters, setFilters] = useState<{
        technology: string[];
        brand: string[];
        volumeCategory: string[];
        material: string[];
        recyclingRatio: string[];
        chamberType: string[];
        priceRange: any;
        application: string[];
        experience: string[];
        connectivity: string[];
    }>({
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

    const [selectedFilters, setSelectedFilters] = useState<{
        technology: string[];
        brand: string[];
        volumeCategory: string[];
        material: string[];
        recyclingRatio: string[];
        chamberType: string[];
        minPrice: string | null;
        maxPrice: string | null;
        application: string[];
        experience: string[];
        connectivity: string[];
    }>({
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

    const [sortBy, setSortBy] = useState<string>("new");
    const [page, setPage] = useState<number>(1);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isInitialLoading) {
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isInitialLoading]);

    const hasActiveFilters = useMemo(() => {
        return (
            selectedFilters.technology.length > 0 ||
            selectedFilters.brand.length > 0 ||
            selectedFilters.volumeCategory.length > 0 ||
            selectedFilters.material.length > 0 ||
            selectedFilters.recyclingRatio.length > 0 ||
            selectedFilters.chamberType.length > 0 ||
            selectedFilters.application.length > 0 ||
            selectedFilters.experience.length > 0 ||
            selectedFilters.connectivity.length > 0 ||
            selectedFilters.minPrice !== null ||
            selectedFilters.maxPrice !== null
        );
    }, [selectedFilters]);

    useEffect(() => {
        if (brandApplied.current) return;
        const brandFromUrl = searchParams.get("brand");
        if (!brandFromUrl) return;
        if (!filters.technology || filters.technology.length === 0) return;

        brandApplied.current = true;
        setSelectedFilters((prev) => ({
            ...prev,
            technology: ["__all__"],
            brand: [brandFromUrl],
        }));
    }, [searchParams, filters.technology]);

    useEffect(() => {
        fetchPrinters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilters, sortBy, page, PAGE_LIMIT]);

    useEffect(() => {
        setPage(1);
    }, [selectedFilters, sortBy]);

    const fetchPrinters = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
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
                const values = selectedFilters[key];
                if (!values?.length) return;
                if (
                    key === "technology" &&
                    values.length === 1 &&
                    values[0] === "__all__"
                )
                    return;
                // @ts-ignore
                values.forEach((val: string) => params.append(key, val));
            });
            if (selectedFilters.minPrice)
                params.append("minPrice", selectedFilters.minPrice);
            if (selectedFilters.maxPrice)
                params.append("maxPrice", selectedFilters.maxPrice);
            params.append("sortBy", sortBy);
            params.append("page", String(page));
            params.append("limit", String(PAGE_LIMIT));

            const res = await fetch(`/api/printers?${params.toString()}`);
            const data = await res.json();
            setPrinters(data.printers || []);
            setTotal(data.total || 0);
            if (data.filters) setFilters(data.filters);
        } catch (err) {
            console.error("Error fetching printers:", err);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to top of grid on page change (skip first load)
    const isFirstLoad = useRef(true);
    // Track if page changed (not first load)
    const prevPage = useRef(page);

    const handlePageChange = useCallback((newPage: number) => {
        if (gridRef.current) {
            const top =
                gridRef.current.getBoundingClientRect().top +
                window.scrollY -
                80;
            window.scrollTo({ top, behavior: "instant" });
        }
        setPage(newPage);
    }, []);
    const handleFilterChange = (filterKey: string, value: any) => {
        setSelectedFilters((prev) => ({ ...prev, [filterKey]: value }));
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
            return { ...prev, [filterKey]: null };
        });
    };

    // "Showing x–y of z"
    const startItem = total > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
    const endItem = Math.min(page * PAGE_LIMIT, total);

    return (
        <main className="w-full">
            {isInitialLoading && <Loader />}
            <div
                className="min-h-screen"
                style={{
                    opacity: isInitialLoading ? 0 : 1,
                    visibility: isInitialLoading ? "hidden" : "visible",
                    transition: "opacity 0.8s ease-in-out",
                }}
            >
                <PrinterHero animate={isReady} />

                <MobileFilterSheet
                    isOpen={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    filters={filters}
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                    onReset={resetFilters}
                />

                <div className="w-full bg-gray-50">
                    <div className="w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar */}
                            <div className="hidden lg:block lg:w-1/4">
                                <FilterPanel
                                    filters={filters}
                                    selectedFilters={selectedFilters}
                                    onFilterChange={handleFilterChange}
                                    onReset={resetFilters}
                                />
                            </div>

                            {/* Grid */}
                            <div className="w-full lg:w-3/4" ref={gridRef}>
                                <SelectedFiltersBar
                                    selectedFilters={selectedFilters}
                                    onRemove={removeFilter}
                                />

                                {/* Desktop top bar */}
                                <div className="hidden lg:flex mb-6 justify-between items-center">
                                    <p className="text-gray-600">
                                        Showing{" "}
                                        <span className="font-semibold">
                                            {startItem}–{endItem}
                                        </span>{" "}
                                        of{" "}
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
                                            className="w-full h-[38px] bg-white border border-[#D1D5DC] rounded-[10px] px-4 pr-10 text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
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
                                            {startItem}–{endItem}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-semibold">
                                            {total}
                                        </span>{" "}
                                        printer{total !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {loading ? (
                                    <div className="text-center py-20">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                                        <p className="mt-4 text-gray-600">
                                            Loading printers...
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pb-16 lg:pb-0">
                                        <PrinterGrid
                                            printers={printers}
                                            page={page}
                                            total={total}
                                            limit={PAGE_LIMIT}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile bottom bar */}
            <div className="lg:hidden">
                <MobileFilterHeader
                    onOpenFilters={() => setIsMobileFilterOpen(true)}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>
        </main>
    );
}
