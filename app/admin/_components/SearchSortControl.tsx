"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useRef, useState } from "react";

type Option = { label: string; value: string };

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
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [priceError, setPriceError] = useState("");

    const [isSelecting, setIsSelecting] = useState(false);
    const [justSelected, setJustSelected] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 120);

    const cache = useRef<Map<string, any[]>>(new Map());
    const abortRef = useRef<AbortController | null>(null);
    const lastSelected = useRef<string>("");

    const dropRef = useRef<HTMLDivElement | null>(null);

    /* -------------------- CLICK OUTSIDE TO CLOSE -------------------- */
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

    /* -------------------- HANDLE SELECT -------------------- */
    const handleSelect = (name: string) => {
        setIsSelecting(true);
        setJustSelected(true);
        lastSelected.current = name;

        setSearchTerm(name);
        setSuggestions([]);
        setShowSuggestions(false);

        setTimeout(() => setIsSelecting(false), 150);
        setTimeout(() => setJustSelected(false), 300);
    };

    /* -------------------- MAIN SEARCH EFFECT -------------------- */
    useEffect(() => {
        if (isSelecting) return;

        /* ---------- PRICE VALIDATION ---------- */
        if (searchField === "price") {
            if (debouncedSearch.trim() === "") {
                setPriceError("");
                return;
            }

            if (!/^\d+$/.test(debouncedSearch)) {
                setPriceError("Please enter a valid number");
                return; // ❌ STOP HERE — NO API CALL
            }

            setPriceError("");
        }

        /* ---------- NO SUGGESTIONS FOR NON-NAME ---------- */
        if (searchField !== "name") {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        /* ---------- EMPTY INPUT ---------- */
        if (!debouncedSearch.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        /* ---------- SAME AS LAST SELECTED ---------- */
        if (debouncedSearch === lastSelected.current) {
            return;
        }

        /* ---------- CACHE HIT ---------- */
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

        /* ---------- ABORT OLD REQUEST ---------- */
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        /* ---------- API CALL ---------- */
        const load = async () => {
            try {
                const res = await fetch(
                    `${suggestionApi}?q=${debouncedSearch}`,
                    { signal: controller.signal }
                );

                if (!res.ok) return;

                const data = await res.json();

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
                setSuggestions(data);

                if (!justSelected) setShowSuggestions(true);
            } catch (err: any) {
                if (err.name === "AbortError") return;
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

    /* -------------------- RENDER -------------------- */
    return (
        <div className="relative flex items-start gap-4 w-full">
            {/* LEFT COLUMN — SEARCH INPUT */}
            <div className="flex flex-col w-[350px] relative">
                {/* INPUT BOX */}
                <div
                    className={`flex items-center rounded-lg overflow-hidden bg-white border h-[45px]
                        ${
                            priceError && searchField === "price"
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                >
                    <select
                        value={searchField}
                        onChange={(e) => {
                            setSearchField(e.target.value);
                            setShowSuggestions(false);
                        }}
                        className="bg-gray-100 px-3 py-2 border-r outline-none text-sm h-full"
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

                            /* PRICE VALIDATION LIVE */
                            if (searchField === "price") {
                                if (value.trim() === "") {
                                    setSearchTerm("");
                                    setPriceError("");
                                    return;
                                }

                                if (!/^\d+$/.test(value)) {
                                    setPriceError(
                                        "Please enter a valid number"
                                    );
                                    return;
                                }

                                setPriceError("");
                                setSearchTerm(value);
                                return;
                            }

                            /* NORMAL INPUT */
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

                {/* PRICE ERROR */}
                {priceError && searchField === "price" && (
                    <div className="text-red-500 text-sm mt-1">
                        {priceError}
                    </div>
                )}

                {/* SUGGESTIONS DROPDOWN */}
                {showSuggestions &&
                    searchField === "name" &&
                    suggestions.length > 0 && (
                        <div
                            ref={dropRef}
                            className="absolute top-[48px] left-0 w-full bg-white border shadow-md rounded-md z-50 max-h-60 overflow-y-auto"
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
            </div>

            {/* RIGHT SIDE — SORT */}
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border rounded-md px-3 py-2 h-[45px]"
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
