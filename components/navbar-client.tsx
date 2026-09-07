"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, ShoppingCart, Heart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface NavItem {
  name: string;
  href: string;
}

interface NavbarClientProps {
  navItems: NavItem[];
  onSearchNavigate?: (href: string) => void;
}

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
  prebuilt: { bg: "bg-[#DBEAFE]", text: "text-blue-700", label: "Prebuilt" },
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

export function NavbarClient({ navItems, onSearchNavigate }: Readonly<NavbarClientProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isNavigating, setIsNavigating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setIsOpen(false);
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (focusSearch) {
        // Small delay to let the drawer render before focusing
        setTimeout(() => searchInputRef.current?.focus(), 100);
        setFocusSearch(false);
      }
    } else {
      document.body.style.overflow = "unset";
      setSearchQuery("");
      setSearchResults([]);
      setActiveFilter("all");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, focusSearch]);

  // Search effect
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted) {
          setSearchResults(data.results || []);
          setIsSearching(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setIsSearching(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const getCategoryCount = useCallback(
    (key: string) => {
      if (key === "all") return searchResults.length;
      return searchResults.filter((r) => r.type === key).length;
    },
    [searchResults],
  );

  const filteredResults =
    activeFilter === "all"
      ? searchResults
      : searchResults.filter((r) => r.type === activeFilter);

  const showResults = !isSearching && filteredResults.length > 0;
  const showNoResults =
    !isSearching && debouncedQuery.trim().length >= 2 && searchResults.length === 0;

  const handleResultClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsNavigating(true);
    setIsOpen(false);
    if (onSearchNavigate) {
      onSearchNavigate(href);
    } else {
      router.push(href);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Separate nav links from bottom actions
  const mainNavItems = navItems.filter(
    (item) => item.name !== "Wishlist"
  );

  const openWithSearch = () => {
    setFocusSearch(true);
    setIsOpen(true);
  };

  return (
    <>
      {/* Search icon */}
      {!isOpen && (
        <button
          onClick={openWithSearch}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Open search"
        >
          <Search className="h-5 w-5 text-white" aria-hidden="true" />
        </button>
      )}
      {/* Hamburger icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 active:scale-95 transition-all"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6 text-white" aria-hidden="true" />
        )}
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{ height: '100dvh' }}
          className="fixed top-0 left-0 right-0 bottom-0 w-screen bg-gradient-to-r from-black to-[#3D5EFF] z-[60] flex flex-col animate-[fadeIn_0.2s_ease-out]"
        >
          {/* Header: Logo + Close */}
          <div className="flex items-center justify-between px-4 h-[80px] flex-shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image
                src="/logo.webp"
                alt="scribb13d Logo"
                width={170}
                height={85}
                className="w-auto h-[130px]"
                unoptimized
              />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pt-2 pb-3 flex-shrink-0 border-b border-white/15">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-[18px] w-[18px] text-gray-400 pointer-events-none z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/15 backdrop-blur-sm text-white placeholder:text-gray-400 text-sm border-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                  className="absolute right-3 h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* Content area */}
          {debouncedQuery.trim().length >= 2 ? (
            /* Search mode: filter tabs + results fill remaining space */
            <div className="flex-1 flex flex-col min-h-0 px-4">
              {/* Filter tabs */}
              {searchResults.length > 0 && (
                <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide flex-shrink-0">
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
                            : "bg-white text-gray-700 border-[#D1D5DC]"
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
              {isSearching && (
                <div className="py-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="mt-2 text-sm text-white/50">Searching...</p>
                </div>
              )}

              {/* Results in a white card that fills remaining space */}
              {showResults && (
                <div className="flex-1 min-h-0 bg-white rounded-t-xl overflow-y-auto shadow-lg">
                  {filteredResults.map((result, idx) => {
                    const style = TYPE_STYLES[result.type] || TYPE_STYLES.prebuilt;
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={result.href}
                        onClick={(e) => handleResultClick(e, result.href)}
                        className={`flex items-center gap-3 px-3.5 py-3 hover:bg-gray-50 transition-colors ${
                          idx > 0 ? "border-t border-[#D1D5DC]" : ""
                        } ${isNavigating ? "pointer-events-none opacity-60" : ""}`}
                      >
                        <div className="flex-shrink-0 w-[50px] h-[50px] relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                          <Image
                            src={result.image || "/placeholder.svg"}
                            alt={result.name}
                            fill
                            className="object-cover"
                            sizes="50px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-gray-900 truncate">
                              {result.name}
                            </span>
                            <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                          </div>
                          {result.subtitle && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{result.subtitle}</p>
                          )}
                          {result.price && (
                            <p className="text-[13px] font-bold text-gray-900 mt-0.5">{formatPrice(result.price)}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-gray-300">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {showNoResults && (
                <div className="py-8 text-center">
                  <p className="text-sm text-white/60">No results found for &ldquo;{debouncedQuery}&rdquo;</p>
                </div>
              )}
            </div>
          ) : (
            /* Nav links mode */
            <div className="flex-1 overflow-y-auto px-4 space-y-0.5">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 text-[16px] rounded-lg transition-colors duration-200 font-manrope ${
                    pathname === item.href
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex-shrink-0 px-4 pt-3 space-y-2 border-t border-white/10" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white text-[15px] font-medium hover:bg-white/15 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
            </Link>
            <Link
              href="/profile?tab=wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white text-[15px] font-medium hover:bg-white/15 transition-colors"
            >
              <Heart className="h-5 w-5" />
              Wishlist
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white text-[15px] font-medium hover:bg-white/15 transition-colors"
            >
              <User className="h-5 w-5" />
              My Account
            </Link>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
