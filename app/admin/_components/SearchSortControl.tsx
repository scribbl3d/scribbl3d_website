"use client";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useRef, useState } from "react";

type Option = {
    label: string;
    value: string;
};

interface SearchSortControlProps {
    searchField: string;
    setSearchField: (value: string) => void;

    searchTerm: string;
    setSearchTerm: (value: string) => void;

    sortOption: string;
    setSortOption: (value: string) => void;

    searchOptions: Option[];
    sortOptions: Option[];

    suggestionApi: string;
}

export default function SearchSortControl({
    searchField,
    setSearchField,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    searchOptions,
    sortOptions,
    suggestionApi,
}: SearchSortControlProps) {
    /* ---------------------------------------------------------------------- */
    /* STATE */
    /* ---------------------------------------------------------------------- */
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [priceError, setPriceError] = useState("");

    const [isSelecting, setIsSelecting] = useState(false);
    const [justSelected, setJustSelected] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 120);

    /* ---------------------------------------------------------------------- */
    /* MEMOIZATION CACHE */
    /* ---------------------------------------------------------------------- */
    const cache = useRef<Map<string, any[]>>(new Map());

    /* ---------------------------------------------------------------------- */
    /* API CANCEL TOKEN */
    /* ---------------------------------------------------------------------- */
    const abortRef = useRef<AbortController | null>(null);

    /* ---------------------------------------------------------------------- */
    /* LAST SELECTED VALUE — prevents re-fetching after clicking suggestion */
    /* ---------------------------------------------------------------------- */
    const lastSelected = useRef<string>("");

    /* ---------------------------------------------------------------------- */
    /* SUGGESTION DROPDOWN REF */
    /* ---------------------------------------------------------------------- */
    const dropRef = useRef<HTMLDivElement | null>(null);

    /* ---------------------------------------------------------------------- */
    /* CLICK OUTSIDE TO CLOSE */
    /* ---------------------------------------------------------------------- */
    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (
                dropRef.current &&
                !dropRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", listener);
        return () => document.removeEventListener("mousedown", listener);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* HANDLE SUGGESTION CLICK */
    /* ---------------------------------------------------------------------- */
    const handleSelect = (name: string) => {
        setIsSelecting(true);
        setJustSelected(true);
        lastSelected.current = name;

        setSearchTerm(name);
        setSuggestions([]);
        setShowSuggestions(false);

        setTimeout(() => setIsSelecting(false), 150);
        setTimeout(() => setJustSelected(false), 400);
    };

    /* ---------------------------------------------------------------------- */
    /* SUGGESTION FETCH LOGIC */
    /* ---------------------------------------------------------------------- */
    useEffect(() => {
        console.log("========== 🔎 SEARCH EFFECT RUN ==========");
        console.log("searchField:", searchField);
        console.log("debouncedSearch:", debouncedSearch);
        console.log("lastSelected:", lastSelected.current);
        console.log("cache keys:", Array.from(cache.current.keys()));

        if (isSelecting) {
            return;
        }
        // PRICE VALIDATION
        if (searchField === "price") {
            // If empty → clear error and let API run normally (means reset)
            if (debouncedSearch.trim() === "") {
                setPriceError("");
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            // If invalid number → show error, stop everything
            if (isNaN(Number(debouncedSearch))) {
                setPriceError("Please enter a valid number");
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            // If valid number → clear error
            setPriceError("");
        }

        if (searchField !== "name") {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (!debouncedSearch.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debouncedSearch === lastSelected.current) {
            return;
        }

        /* ----------------------- CHECK CACHE ----------------------- */
        if (cache.current.has(debouncedSearch)) {
            const cached = cache.current.get(debouncedSearch)!;

            const exact =
                cached.length === 1 &&
                cached[0].name.toLowerCase() === debouncedSearch.toLowerCase();

            if (exact) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setSuggestions(cached);
            if (!justSelected) setShowSuggestions(true);
            return;
        }

        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

        /* ----------------------- API CALL ----------------------- */
        const load = async () => {
            try {
                console.log(
                    "🌐 API →",
                    `${suggestionApi}?q=${debouncedSearch}`
                );

                const res = await fetch(
                    `${suggestionApi}?q=${debouncedSearch}`,
                    { signal: controller.signal }
                );
                if (!res.ok) {
                    return;
                }

                const data = await res.json();
                console.log("🌐 API RESULT:", data);

                const exact =
                    data.length === 1 &&
                    data[0].name.toLowerCase() ===
                        debouncedSearch.toLowerCase();

                if (exact) {
                    cache.current.set(debouncedSearch, []);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    return;
                }

                cache.current.set(debouncedSearch, data);
                console.log("💾 CACHED:", debouncedSearch, data);

                setSuggestions(data);
                if (!justSelected) setShowSuggestions(true);
            } catch (err: any) {
                if (err.name === "AbortError") {
                    return;
                }
            }
        };

        load();
    }, [
        debouncedSearch,
        searchField,
        justSelected,
        isSelecting,
        suggestionApi,
    ]);

    /* ---------------------------------------------------------------------- */
    /* RENDER UI */
    /* ---------------------------------------------------------------------- */
    return (
        <div className="relative flex flex-col w-[350px]">
            {/* Input container with dynamic red border */}
            <div
                className={`flex items-center rounded-lg overflow-hidden bg-white border 
            ${priceError && searchField === "price" ? "border-red-500" : "border-gray-300"}
        `}
            >
                <select
                    value={searchField}
                    onChange={(e) => {
                        setSearchField(e.target.value);
                        setShowSuggestions(false);
                    }}
                    className="bg-gray-100 px-3 py-2 border-r outline-none text-sm"
                >
                    {searchOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder={`Search by ${searchField}...`}
                    value={searchTerm}
                    onChange={(e) => {
                        const value = e.target.value;

                        if (searchField === "price") {
                            // Allow empty
                            if (value.trim() === "") {
                                setSearchTerm("");
                                setPriceError("");
                                return;
                            }

                            // Allow ONLY digits
                            if (!/^\d+$/.test(value)) {
                                setPriceError("Please enter a valid number");
                                return; // ❌ stop here — DO NOT TRIGGER SEARCH
                            }

                            // Valid number
                            setPriceError("");
                            setSearchTerm(value);
                            return;
                        }

                        // Normal case (name, category, etc.)
                        setSearchTerm(value);
                        if (!value) setShowSuggestions(false);
                    }}
                    onFocus={() => {
                        if (
                            suggestions.length > 0 &&
                            !justSelected &&
                            searchField === "name"
                        ) {
                            setShowSuggestions(true);
                        }
                    }}
                    className="px-3 py-2 w-full outline-none"
                />
            </div>

            {/* Price error below */}
            {priceError && searchField === "price" && (
                <div className="text-red-500 text-sm mt-1 pl-40">
                    {priceError}
                </div>
            )}
        </div>
    );
}
