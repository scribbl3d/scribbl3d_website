"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ExpandableSearch() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setIsSearchExpanded((prev) => !prev);
    if (!isSearchExpanded) {
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  };

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
          );
          const data = await response.json();

          if (data.error) {
            setError(data.message || "An error occurred while searching");
            setSearchResults([]);
          } else {
            setSearchResults(data.results || []);
            setError(null);
          }
        } catch {
          setError("Failed to fetch search results");
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="relative flex-1 max-w-[300px] min-w-[40px]">
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ml-auto ${
          isSearchExpanded ? "w-full" : "w-10"
        }`}
      >
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pr-10 transition-all duration-300 ease-in-out bg-white text-gray-900 border-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] origin-right ${
            isSearchExpanded
              ? "w-full opacity-100 scale-x-100"
              : "w-0 opacity-0 scale-x-0"
          }`}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 w-10 h-full transition-all duration-300 ease-in-out hover:bg-transparent"
          onClick={toggleSearch}
        >
          <Search
            className={`h-5 w-5 ${
              isSearchExpanded ? "text-gray-500" : "text-white"
            }`}
          />
        </Button>
      </div>
      {isSearchExpanded && (isLoading || error || searchResults.length > 0) && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}
          {error && (
            <div className="p-4 text-center text-sm text-red-500">{error}</div>
          )}
          {!isLoading &&
            !error &&
            searchResults.length === 0 &&
            searchQuery && (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found
              </div>
            )}
          {searchResults.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              href={result.href}
              className="block px-4 py-2 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 relative">
                  <Image
                    src={result.image || "/placeholder.svg"}
                    alt={result.name}
                    fill
                    className="object-cover rounded-md"
                    unoptimized={true}
                  />
                </div>
                <div className="flex-grow">
                  <span className="text-sm font-medium text-gray-900">
                    {result.name}
                  </span>
                  {result.subtitle && (
                    <span className="block text-xs text-gray-500">
                      {result.subtitle}
                    </span>
                  )}
                </div>
                {result.price != null && (
                  <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                    ₹{result.price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
