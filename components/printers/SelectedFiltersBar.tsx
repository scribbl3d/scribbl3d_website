"use client";

type Props = {
    selectedFilters: any;
    onRemove: (key: string, value?: string) => void;
};

export default function SelectedFiltersBar({
    selectedFilters,
    onRemove,
}: Props) {
    const chips: { key: string; label: string; value?: string }[] = [];

    Object.entries(selectedFilters).forEach(([key, value]) => {
        if (!value) return;

        // For array filters (material, connectivity, application)
        if (Array.isArray(value)) {
            value.forEach((v) => {
                chips.push({
                    key,
                    value: v,
                    label: `${formatKey(key)}: ${v}`,
                });
            });
        } else {
            chips.push({
                key,
                label: `${formatKey(key)}: ${value}`,
            });
        }
    });

    if (chips.length === 0) return null;

    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((chip, index) => (
                <span
                    key={index}
                    className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700"
                >
                    {chip.label}
                    <button
                        onClick={() => onRemove(chip.key, chip.value)}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        ✕
                    </button>
                </span>
            ))}
        </div>
    );
}

function formatKey(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
}
