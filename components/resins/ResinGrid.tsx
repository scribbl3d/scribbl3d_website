"use client";

import WishlistModal from "@/app/profile/_components/wishlist-modal";
import { WishlistGridItem } from "@/app/profile/_components/wishlist.types";
import { useState } from "react";
import ResinCard from "./ResinCard";

type Props = {
    resins: any[];
    page: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
    priceRange: [number, number] | null;
};

export default function ResinGrid({
    resins,
    page,
    total,
    limit,
    onPageChange,
    priceRange,
}: Props) {
    const totalPages = Math.ceil(total / limit);
    const [activeItem, setActiveItem] = useState<WishlistGridItem | null>(null);

    if (resins.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No resins found
                </h3>
                <p className="text-gray-600">
                    Try adjusting your filters to see more results
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8">
                {/* GRID — 2 cols on mobile, 2 on md, 3 on xl */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                    {resins.map((resin) => (
                        <ResinCard
                            key={resin.id}
                            resin={resin}
                            priceRange={priceRange}
                            onSelect={() => {
                                setActiveItem({
                                    id: resin.id,
                                    itemType: "resin",
                                    title: resin.name,
                                    image: resin.cardImageUrl,
                                    badge: resin.technology,
                                    price: resin.weights?.[0]?.price ?? 0,
                                    originalPrice:
                                        resin.weights?.[0]?.originalPrice ??
                                        null,
                                    requiresOptions: true,
                                    slug: resin.slug,
                                    inStock: resin.inStock ?? true,
                                    priceRange,

                                    cartPayload: { resinId: resin.id },

                                    resinColours:
                                        resin.colours?.map((c: any) => ({
                                            id: c.id,
                                            name: c.name,
                                            hex: c.hexCode ?? null,
                                            image:
                                                c.images?.find(
                                                    (i: any) => i.isMain,
                                                )?.url ?? null,
                                            inStock: c.inStock ?? true,
                                        })) ?? [],

                                    resinWeights:
                                        resin.weights?.map((w: any) => ({
                                            id: w.id,
                                            label:
                                                w.weightInGrams >= 1000
                                                    ? `${w.weightInGrams / 1000} kg`
                                                    : `${w.weightInGrams} g`,
                                            price: w.price,
                                            originalPrice: w.originalPrice,
                                            inStock: w.inStock ?? true,
                                        })) ?? [],
                                });
                            }}
                        />
                    ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 text-sm"
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const p = i + 1;
                            return (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p)}
                                    className={`px-3 py-1 border rounded text-sm ${p === page ? "bg-black text-white" : ""}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            disabled={page === totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 text-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {activeItem && (
                <WishlistModal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                />
            )}
        </>
    );
}