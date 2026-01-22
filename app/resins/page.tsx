"use client";

import PrinterHero from "@/components/printers/PrinterHero"; // reused
import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";

import MobileFilterBar from "@/components/resins/Mobilefilterbar";
import MobileResinFilters from "@/components/resins/Mobileresinfilters";
import MobileSortSheet from "@/components/resins/Mobilesortsheet";

import ResinFilters from "@/components/resins/ResinFilters";
import ResinGrid from "@/components/resins/ResinGrid";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

export type ResinFiltersState = {
    materialTypes: string[];
    technologies: string[];
    resolutions: string[];
    colours: string[];
    brands: string[];
    washable: boolean | null;
    price: [number, number] | null;
};

const PAGE_LIMIT = 3;

/* ================= PAGE ================= */

export default function ResinsPage() {
    /* ================= DATA ================= */

    const [resins, setResins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    /* ================= PAGINATION ================= */

    const [page, setPage] = useState(1);

    /* ================= SORT ================= */

    const [sortBy, setSortBy] = useState<"new" | "price_asc" | "price_desc">(
        "new",
    );

    /* ================= FILTER STATE ================= */

    const [filters, setFilters] = useState<ResinFiltersState>({
        materialTypes: [],
        technologies: [],
        resolutions: [],
        colours: [],
        brands: [],
        washable: null,
        price: null,
    });

    /* ================= MOBILE MODALS ================= */

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    /* ================= SELECTED FILTERS (FOR BAR) ================= */

    const selectedFilters = {
        material: filters.materialTypes,
        technology: filters.technologies,
        resolution: filters.resolutions,
        colour: filters.colours,
        brand: filters.brands,
        washable:
            filters.washable === null
                ? []
                : [filters.washable ? "Water Washable" : "Non-Washable"],
        minPrice: filters.price?.[0] ?? null,
        maxPrice: filters.price?.[1] ?? null,
    };

    /* ================= ACTIVE FILTER COUNT ================= */

    const activeFilterCount =
        filters.materialTypes.length +
        filters.technologies.length +
        filters.resolutions.length +
        filters.colours.length +
        filters.brands.length +
        (filters.washable !== null ? 1 : 0) +
        (filters.price !== null ? 1 : 0);

    /* ================= FETCH ================= */

    useEffect(() => {
        fetchResins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortBy, page]);

    /* Reset page when filters or sort change */
    useEffect(() => {
        setPage(1);
    }, [filters, sortBy]);

    const fetchResins = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            /* ARRAY FILTERS */
            filters.materialTypes.forEach((v) =>
                params.append("materialType", v),
            );
            filters.technologies.forEach((v) => params.append("technology", v));
            filters.resolutions.forEach((v) => params.append("resolution", v));
            filters.colours.forEach((v) => params.append("colour", v));
            filters.brands.forEach((v) => params.append("brand", v));

            /* BOOLEAN */
            if (filters.washable !== null) {
                params.append("washable", String(filters.washable));
            }

            /* PRICE */
            if (filters.price) {
                params.append("minPrice", String(filters.price[0]));
                params.append("maxPrice", String(filters.price[1]));
            }

            /* SORT + PAGINATION */
            params.append("sortBy", sortBy);
            params.append("page", String(page));
            params.append("limit", String(PAGE_LIMIT));

            const res = await fetch(`/api/resins?${params.toString()}`);
            const data = await res.json();

            setResins(data.resins || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Error fetching resins:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FILTER BAR HANDLER ================= */

    const removeFilter = (key: string, value?: string) => {
        setFilters((prev) => {
            const next = { ...prev };

            switch (key) {
                /* ARRAY FILTERS */
                case "material":
                    next.materialTypes = prev.materialTypes.filter(
                        (v) => v !== value,
                    );
                    break;

                case "technology":
                    next.technologies = prev.technologies.filter(
                        (v) => v !== value,
                    );
                    break;

                case "resolution":
                    next.resolutions = prev.resolutions.filter(
                        (v) => v !== value,
                    );
                    break;

                case "colour":
                    next.colours = prev.colours.filter((v) => v !== value);
                    break;

                case "brand":
                    next.brands = prev.brands.filter((v) => v !== value);
                    break;

                /* BOOLEAN */
                case "washable":
                    next.washable = null;
                    break;

                /* PRICE */
                case "minPrice":
                case "maxPrice":
                    next.price = null;
                    break;

                default:
                    break;
            }

            return next;
        });
    };

    /* ================= UI ================= */

    return (
        <div className="min-h-screen bg-gray-50">
            <PrinterHero />

            <div className="container mx-auto px-4 py-8">
                {/* Mobile Filter Bar */}
                <MobileFilterBar
                    onOpenFilters={() => setIsFilterOpen(true)}
                    onOpenSort={() => setIsSortOpen(true)}
                    activeFilterCount={activeFilterCount}
                />

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Hidden on mobile */}
                    <div className="hidden lg:block lg:w-1/4">
                        <ResinFilters
                            filters={filters}
                            setFilters={setFilters}
                        />
                    </div>

                    {/* Grid */}
                    <div className="w-full lg:w-3/4">
                        <SelectedFiltersBar
                            selectedFilters={selectedFilters}
                            onRemove={removeFilter}
                        />

                        {/* Top Bar - Hidden sort on mobile */}
                        <div className="mb-6 flex justify-between items-center">
                            <p className="text-gray-600">
                                Showing{" "}
                                <span className="font-semibold">{total}</span>{" "}
                                resin{total !== 1 ? "s" : ""}
                            </p>

                            {/* Desktop Sort - Hidden on mobile */}
                            <div className="hidden lg:block relative min-w-[180px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value as any)
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
                                    <option value="new">
                                        Sort by: New Arrivals
                                    </option>
                                    <option value="price_asc">
                                        Price: Low to High
                                    </option>
                                    <option value="price_desc">
                                        Price: High to Low
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

                        {/* Content */}
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                                <p className="mt-4 text-gray-600">
                                    Loading resins...
                                </p>
                            </div>
                        ) : (
                            <ResinGrid
                                resins={resins}
                                page={page}
                                total={total}
                                limit={PAGE_LIMIT}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Sheet */}
            <MobileResinFilters
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={() => {}}
            />

            {/* Mobile Sort Sheet */}
            <MobileSortSheet
                isOpen={isSortOpen}
                onClose={() => setIsSortOpen(false)}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />
        </div>
    );
}
