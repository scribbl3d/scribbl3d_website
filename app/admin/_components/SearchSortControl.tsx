"use client";

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
}: SearchSortControlProps) {
    return (
        <div className="flex items-center gap-4">
            {/* Combined dropdown + search input */}
            <div className="flex items-center border rounded-lg overflow-hidden w-[350px] bg-white">
                <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 w-full outline-none"
                />
            </div>

            {/* Sort dropdown */}
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
