"use client";

import SelectedFiltersBar from "@/components/printers/SelectedFiltersBar";
import FilamentHero from "@/components/filaments/FilamentHero";
import MaterialHeader from "@/components/filaments/MaterialHeader";
import FilamentFilters, { FilamentFiltersState } from "@/components/filaments/FilamentFilters";
import MobileFilamentFilters from "@/components/filaments/MobileFilamentFilters";
import MobileFilamentFilterBar from "@/components/filaments/MobileFilamentFilterBar";
import FilamentGrid from "@/components/filaments/FilamentGrid";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface FilamentPageClientProps {
    initialFilaments: any[];
    initialTotal: number;
}

export default function FilamentPageClient({ initialFilaments, initialTotal }: FilamentPageClientProps) {
    const searchParams = useSearchParams();

    const [filaments, setFilaments] = useState<any[]>(initialFilaments);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(initialTotal);
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
        const update = () => setLimit(window.innerWidth < 1280 ? 10 : 9);
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
        // Scroll to top when page changes (but not on initial load)
        if (page > 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

            // Finish type filters - send all selected
            if (filters.finishTypes.length > 0) {
                params.append("finishType", filters.finishTypes.join(","));
            }

            // Brand filters - send all selected
            if (filters.brands.length > 0) {
                params.append("brand", filters.brands.join(","));
            }

            // Diameter filters - send all selected
            if (filters.diameters.length > 0) {
                params.append("diameter", filters.diameters.join(","));
            }

            // Spool weight filters - send all selected
            if (filters.spoolWeights.length > 0) {
                params.append("spoolWeight", filters.spoolWeights.join(","));
            }

            // Printer compatibility - send all selected
            if (filters.printerCompatibility.length > 0) {
                params.append("printerCompatibility", filters.printerCompatibility.join(","));
            }

            // Price range filter
            if (filters.price) {
                params.append("minPrice", filters.price[0].toString());
                params.append("maxPrice", filters.price[1].toString());
            }

            // Sorting
            if (sortBy === "price_asc") {
                params.append("sortBy", "price");
                params.append("order", "asc");
            } else if (sortBy === "price_desc") {
                params.append("sortBy", "price");
                params.append("order", "desc");
            } else {
                params.append("sortBy", "createdAt");
                params.append("order", "desc");
            }

            // Pagination
            params.append("page", page.toString());
            params.append("limit", limit.toString());

            const response = await fetch(`/api/filaments?${params.toString()}`);
            const data = await response.json();

            setFilaments(data.filaments || []);
            setTotal(data.totalItems || 0);
        } catch (error) {
            console.error("Error fetching filaments:", error);
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

    return (
        <>
            <div className="min-h-screen overflow-x-hidden">
                <FilamentHero 
                    animate={true} 
                    activeMaterial={activeMaterialHeader || undefined} 
                    onMaterialSelect={handleMaterialSelect} 
                />

                <div className="container mx-auto px-4 py-8">
                    <div className="flex gap-8">
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
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span> of <span className="font-semibold">{total}</span> filaments
                                </p>

                                {/* Desktop Sort */}
                                <div className="hidden sm:block">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="new">Sort by: New Arrivals</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grid */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <FilamentGrid
                                    filaments={filaments}
                                    page={page}
                                    total={total}
                                    limit={limit}
                                    onPageChange={setPage}
                                />
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
        </>
    );
}
