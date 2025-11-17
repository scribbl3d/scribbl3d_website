"use client";
console.log("🔥 SearchSortControl file LOADED");
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
        console.log("🟢 SELECTED:", name);

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
            console.log("⛔ SKIP: isSelecting true");
            return;
        }

        if (searchField !== "name") {
            console.log("⛔ SKIP: searchField != name");
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (!debouncedSearch.trim()) {
            console.log("⛔ SKIP: empty search");
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debouncedSearch === lastSelected.current) {
            console.log("⛔ SKIP: debouncedSearch == lastSelected");
            return;
        }

        /* ----------------------- CHECK CACHE ----------------------- */
        if (cache.current.has(debouncedSearch)) {
            console.log("🟡 CACHE HIT FOR:", debouncedSearch);

            const cached = cache.current.get(debouncedSearch)!;

            const exact =
                cached.length === 1 &&
                cached[0].name.toLowerCase() === debouncedSearch.toLowerCase();

            if (exact) {
                console.log("⛔ EXACT MATCH → hide suggestions");
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            console.log("🟡 USING CACHED RESULTS");
            setSuggestions(cached);
            if (!justSelected) setShowSuggestions(true);
            return;
        }

        console.log("🔴 CACHE MISS → MUST CALL API");

        /* ----------------------- ABORT PREVIOUS ----------------------- */
        if (abortRef.current) {
            console.log("⚠️ ABORTING OLD REQUEST");
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
                    console.log("❌ API RESPONSE NOT OK");
                    return;
                }

                const data = await res.json();
                console.log("🌐 API RESULT:", data);

                const exact =
                    data.length === 1 &&
                    data[0].name.toLowerCase() ===
                        debouncedSearch.toLowerCase();

                if (exact) {
                    console.log("⛔ EXACT MATCH AFTER API → hide");
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
                    console.log("⚠️ REQUEST ABORTED");
                    return;
                }
                console.error("❌ FETCH ERROR:", err);
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
        <div className="relative flex items-center gap-4">
            {/* Search + filter */}
            <div className="relative flex items-center border rounded-lg overflow-hidden w-[350px] bg-white">
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
                        setSearchTerm(e.target.value);
                        if (!e.target.value) {
                            setShowSuggestions(false);
                        }
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

            {/* Suggestions */}
            {showSuggestions &&
                searchField === "name" &&
                suggestions.length > 0 && (
                    <div
                        ref={dropRef}
                        className="absolute top-12 left-0 w-[350px] bg-white border shadow-md rounded-md z-50 max-h-60 overflow-y-auto"
                    >
                        {suggestions.map((s: any) => (
                            <div
                                key={s.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelect(s.name)}
                            >
                                {s.name}
                            </div>
                        ))}
                    </div>
                )}

            {/* Sort */}
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded-md px-3 py-2"
            >
                <option value="">Sort By</option>
                {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
