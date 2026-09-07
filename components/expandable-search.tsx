"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  type: "product" | "prebuilt" | "resin" | "printer" | "filament";
  price: number | null;
  image: string | null;
  subtitle: string | null;
  href: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  prebuilt: { bg: "bg-[#DBEAFE]", text: "text-blue-700", label: "Product" },
  printer: { bg: "bg-[#DBEAFE]", text: "text-blue-700", label: "Printer" },
  resin: { bg: "bg-[#DBEAFE]", text: "text-blue-700", label: "Resin" },
  filament: { bg: "bg-[#DBEAFE]", text: "text-blue-700", label: "Filament" },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "printer", label: "Printers" },
  { key: "resin", label: "Resins" },
  { key: "prebuilt", label: "Products" },
  { key: "filament", label: "Filaments" },
];

interface ExpandableSearchProps {
  onClose: () => void;
  onNavigate?: (href: string) => void;
  isClosing?: boolean;
}

export function ExpandableSearch({ onClose, onNavigate, isClosing = false }: Readonly<ExpandableSearchProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isNavigating, setIsNavigating] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 350);

  // Auto-focus on mount
  useEffect(() => {
    // Small delay to ensure the element is rendered and transition is complete
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch results
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (controller.signal.aborted) return;
        setSearchResults(data.results || []);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setSearchResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  // Reset filter when results change
  useEffect(() => {
    setActiveFilter("all");
  }, [searchResults]);

  // Filter results by active tab
  const filteredResults =
    activeFilter === "all"
      ? searchResults
      : searchResults.filter((r) => r.type === activeFilter);

  // Count per category
  const getCategoryCount = useCallback(
    (key: string) =>
      key === "all"
        ? searchResults.length
        : searchResults.filter((r) => r.type === key).length,
    [searchResults],
  );

  const showDropdown =
    debouncedQuery.trim().length >= 2 &&
    (isLoading || searchResults.length > 0);

  const showNoResults =
    !isLoading &&
    searchResults.length === 0 &&
    debouncedQuery.trim().length >= 2;

  const handleResultClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsNavigating(true);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-[18px] w-[18px] text-gray-300 pointer-events-none z-10" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-10 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder:text-gray-300 text-sm border-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0"
        />
        <button
          onClick={onClose}
          className="absolute right-3 h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4 text-gray-300" />
        </button>
      </div>

      {/* Dropdown */}
      {!isClosing && (showDropdown || showNoResults) && (
        <div className="absolute z-[60] top-full mt-1.5 w-full bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-gray-200 overflow-hidden animate-[dropdownSlide_0.2s_ease-out]">
          {/* Category filter tabs */}
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-2.5 overflow-x-auto scrollbar-hide">
              {FILTER_TABS.map((tab) => {
                const count = getCategoryCount(tab.key);
                if (tab.key !== "all" && count === 0) return null;
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex-shrink-0 h-[32px] px-3.5 rounded-[10px] text-xs font-medium transition-colors border ${
                      isActive
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : "bg-white text-gray-700 border-[#D1D5DC] hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 ${isActive ? "text-blue-200" : "text-gray-400"}`}>
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="px-4 py-6 text-center">
              <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-2 text-sm text-gray-400">Searching...</p>
            </div>
          )}

          {/* No results */}
          {showNoResults && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No results found for &ldquo;{debouncedQuery.trim()}&rdquo;</p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && filteredResults.length > 0 && (
            <div className="max-h-[380px] overflow-y-auto">
              {filteredResults.map((result, idx) => {
                const style = TYPE_STYLES[result.type] || TYPE_STYLES.prebuilt;
                return (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={(e) => handleResultClick(e, result.href)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 transition-colors group ${
                      idx > 0 ? "border-t border-[#D1D5DC]" : ""
                    } ${isNavigating ? "pointer-events-none opacity-60" : ""}`}
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-[56px] h-[56px] relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                      <Image
                        src={result.image || "/placeholder.svg"}
                        alt={result.name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-gray-900 truncate">
                          {result.name}
                        </span>
                        <span
                          className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                          {result.subtitle}
                        </p>
                      )}
                      {result.price != null && (
                        <p className="text-[13px] font-bold text-gray-900 mt-0.5">
                          ₹{result.price.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="flex-shrink-0 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
