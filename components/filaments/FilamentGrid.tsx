import { FilamentProductTile } from "./FilamentProductTile";

interface FilamentGridProps {
    filaments: any[];
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export default function FilamentGrid({ filaments, page, total, limit, onPageChange }: FilamentGridProps) {
    const totalPages = Math.ceil(total / limit);

    if (filaments.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No filaments found matching your criteria.</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filaments.map((filament) => (
                    <FilamentProductTile 
                        key={filament.id}
                        id={filament.id}
                        slug={filament.slug}
                        name={filament.name}
                        shortDescription={filament.shortDescription || ''}
                        price={filament.price}
                        originalPrice={filament.originalPrice || filament.price}
                        discount={filament.discount || 0}
                        images={filament.images || []}
                        color={filament.color}
                        colors={filament.colors}
                        finishType={filament.finishType}
                        weight={filament.weight}
                        diameter={filament.diameter}
                        isInWishlist={filament.isInWishlist || false}
                        inStock={filament.inStock !== false}
                        onWishlistToggle={async () => {
                            // Handle wishlist toggle
                            console.log("Wishlist toggle for", filament.id);
                        }}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                        page === pageNum
                                            ? "bg-blue-600 text-white"
                                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}
