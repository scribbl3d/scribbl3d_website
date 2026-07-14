"use client";

import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";
import Loader from "@/components/Loader";
import FilamentHero from "@/components/filaments/FilamentHero";
import MaterialHeader from "@/components/filaments/MaterialHeader";
import FilamentFilters, { FilamentFiltersState } from "@/components/filaments/FilamentFilters";
import MobileFilamentFilters from "@/components/filaments/MobileFilamentFilters";
import MobileFilamentFilterBar from "@/components/filaments/MobileFilamentFilterBar";
import FilamentGrid from "@/components/filaments/FilamentGrid";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function FilamentsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [filaments, setFilaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(9);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<"new" | "price_asc" | "price_desc">("new");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const initialCategory = searchParams.get("category") || "";

    const [filters, setFilters] = useState<FilamentFiltersState>({
        materialTypes: initialCategory ? [initialCategory] : [],
        finishTypes: [],
        brands: [],
        price: null,
        printerCompatibility: [],
        diameters: [],
        spoolWeights: [],
    });

    // Update active material filter based on horizontal scroller
    const handleMaterialSelect = (material: string) => {
        setFilters((prev) => ({
            ...prev,
            materialTypes: [material], // Single select for hero nav
        }));
    };

    // If only one material is selected, show its header
    const activeMaterialHeader = filters.materialTypes.length === 1 ? filters.materialTypes[0] : null;

    useEffect(() => {
        const update = () => setLimit(window.innerWidth < 1024 ? 10 : 9);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const selectedFiltersForBar = {
        material: filters.materialTypes,
        finish: filters.finishTypes,
        brand: filters.brands,
        printer: filters.printerCompatibility,
        diameter: filters.diameters,
        weight: filters.spoolWeights,
        minPrice: filters.price?.[0] ?? null,
        maxPrice: filters.price?.[1] ?? null,
    };

    const activeFilterCount =
        filters.materialTypes.length +
        filters.finishTypes.length +
        filters.brands.length +
        filters.printerCompatibility.length +
        filters.diameters.length +
        filters.spoolWeights.length +
        (filters.price !== null ? 1 : 0);

    useEffect(() => {
        fetchFilaments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortBy, page, limit]);

    useEffect(() => {
        setPage(1);
    }, [filters, sortBy, limit]);

    const fetchFilaments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            // Material filters - send all selected materials
            if (filters.materialTypes.length > 0) {
                params.append("material", filters.materialTypes.join(","));
            }

            // Finish type filters
            if (filters.finishTypes.length > 0) {
                params.append("finishType", filters.finishTypes[0]);
            }

            // Brand filters
            if (filters.brands.length > 0) {
                params.append("brand", filters.brands[0]);
            }

            // Diameter filters
            if (filters.diameters.length > 0) {
                params.append("diameter", filters.diameters[0]);
            }

            // Spool weight filters
            if (filters.spoolWeights.length > 0) {
                params.append("spoolWeight", filters.spoolWeights[0]);
            }

            // Printer compatibility (search in compatibility array)
            if (filters.printerCompatibility.length > 0) {
                params.append("search", filters.printerCompatibility.join(" "));
            }

            // Price filter (handled in search for now)
            if (filters.price) {
                // Note: Backend doesn't support price range yet, would need to add
            }

            // Sorting
            if (sortBy === "new") {
                params.append("sortBy", "updatedAt");
                params.append("order", "desc");
            } else if (sortBy === "price_asc") {
                params.append("sortBy", "price");
                params.append("order", "asc");
            } else if (sortBy === "price_desc") {
                params.append("sortBy", "price");
                params.append("order", "desc");
            }
            
            // Pagination
            params.append("page", String(page));
            params.append("limit", String(limit));

            const res = await fetch(`/api/filaments?${params.toString()}`);
            const data = await res.json();

            setFilaments(data.filaments || []);
            setTotal(data.totalItems || 0);
        } catch (err) {
            console.error("Error fetching filaments:", err);
        } finally {
            setLoading(false);
        }
    };

    const removeFilter = (key: string, value?: string) => {
        setFilters((prev) => {
            const next = { ...prev };
            switch (key) {
                case "material": next.materialTypes = prev.materialTypes.filter((v) => v !== value); break;
                case "finish": next.finishTypes = prev.finishTypes.filter((v) => v !== value); break;
                case "brand": next.brands = prev.brands.filter((v) => v !== value); break;
                case "printer": next.printerCompatibility = prev.printerCompatibility.filter((v) => v !== value); break;
                case "diameter": next.diameters = prev.diameters.filter((v) => v !== value); break;
                case "weight": next.spoolWeights = prev.spoolWeights.filter((v) => v !== value); break;
                case "minPrice":
                case "maxPrice":
                    next.price = null;
                    break;
            }
            return next;
        });
    };

    const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
    const endItem = Math.min(page * limit, total);

    return (
        <main className="w-full bg-[#fafafa]">
            <div className="min-h-screen">
                <FilamentHero 
                    animate={true} 
                    activeMaterial={activeMaterialHeader || undefined} 
                    onMaterialSelect={handleMaterialSelect} 
                />

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar (Desktop) */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <div className="sticky top-24">
                                <FilamentFilters filters={filters} setFilters={setFilters} />
                            </div>
                        </div>

                        {/* Main Grid Area */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Material Metadata Header (Only if exactly 1 material is selected) */}
                            {activeMaterialHeader && (
                                <MaterialHeader material={activeMaterialHeader} />
                            )}

                            <SelectedFiltersBar
                                selectedFilters={selectedFiltersForBar}
                                onRemove={removeFilter}
                            />

                            {/* Top Bar */}
                            <div className="mb-6 flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-500">
                                    Showing <span className="text-gray-900">{startItem}–{endItem}</span> of <span className="text-gray-900">{total}</span> filaments
                                </p>

                                {/* Desktop Sort */}
                                <div className="hidden lg:block relative min-w-[200px]">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="w-full h-[40px] bg-white border border-gray-200 rounded-xl px-4 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="new">Sort by: New Arrivals</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>

                            {/* Content Grid */}
                            {loading ? (
                                <div className="text-center py-32">
                                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-blue-600" />
                                    <p className="mt-4 text-sm font-medium text-gray-500">Loading filaments...</p>
                                </div>
                            ) : (
                                <div className="pb-16 lg:pb-0">
                                    <FilamentGrid
                                        filaments={filaments}
                                        page={page}
                                        total={total}
                                        limit={limit}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <MobileFilamentFilters
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    filters={filters}
                    setFilters={setFilters}
                    onApply={() => {}}
                />
            </div>

            <div className="lg:hidden">
                <MobileFilamentFilterBar
                    onOpenFilters={() => setIsFilterOpen(true)}
                    activeFilterCount={activeFilterCount}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />
            </div>
        </main>
    );
}
