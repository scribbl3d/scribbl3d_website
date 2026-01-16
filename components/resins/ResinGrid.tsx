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
};

export default function ResinGrid({
    resins,
    page,
    total,
    limit,
    onPageChange,
}: Props) {
    const totalPages = Math.ceil(total / limit);

    /* =====================
       MODAL STATE
    ===================== */
    const [activeItem, setActiveItem] = useState<WishlistGridItem | null>(null);

    return (
        <>
            {/* GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resins.map((resin) => (
                    <ResinCard
                        key={resin.id}
                        resin={resin}
                        onSelect={() => {
                            setActiveItem({
                                id: resin.id,
                                itemType: "resin",
                                title: resin.name,
                                image: resin.cardImageUrl,
                                badge: resin.technology,
                                price: resin.weights?.[0]?.price ?? 0,
                                originalPrice:
                                    resin.weights?.[0]?.originalPrice ?? null,
                                requiresOptions: true,
                                slug: resin.slug,

                                cartPayload: {
                                    resinId: resin.id,
                                },

                                resinColours:
                                    resin.colours?.map((c: any) => ({
                                        id: c.id,
                                        name: c.name,
                                        hex: c.hexCode ?? null,
                                        image:
                                            c.images?.find((i: any) => i.isMain)
                                                ?.url ?? null,
                                    })) ?? [],

                                resinWeights:
                                    resin.weights?.map((w: any) => ({
                                        id: w.id,
                                        label: `${w.weightInGrams} g`,
                                        price: w.price,
                                        originalPrice: w.originalPrice,
                                    })) ?? [],
                            });
                        }}
                    />
                ))}
            </div>

            {/* MODAL */}
            {activeItem && (
                <WishlistModal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                />
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`px-3 py-1 rounded ${
                                page === i + 1
                                    ? "bg-black text-white"
                                    : "border"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}
