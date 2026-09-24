import { FilamentProductTile } from "./FilamentProductTile";
import CrawlablePagination from "@/components/shared/CrawlablePagination";

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
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
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

            <CrawlablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} basePath="/filament" className="mt-8 flex justify-center items-center gap-2" />
        </>
    );
}
