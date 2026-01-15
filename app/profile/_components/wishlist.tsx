"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import WishlistCard from "./wishlist-card";
import WishlistModal from "./wishlist-modal";
import { WishlistGridItem } from "./wishlist.types";

export default function Wishlist() {
    const [items, setItems] = useState<WishlistGridItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeItem, setActiveItem] = useState<WishlistGridItem | null>(null);

    useEffect(() => {
        fetch("/api/wishlist")
            .then((r) => r.json())
            .then((d) => {
                setItems(d.items || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const removeFromWishlist = async (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    };

    return (
        <div className="p-6">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Wishlist</h1>
                    <p className="text-sm text-gray-500">
                        Products you’ve saved for later
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        {items.length} items
                    </span>
                    <Button className="bg-black text-white">
                        Move all to Cart
                    </Button>
                </div>
            </div>

            {loading && <p className="text-sm text-gray-500">Loading…</p>}

            {!loading && items.length === 0 && (
                <p className="text-sm text-gray-500">Wishlist is empty.</p>
            )}

            {!loading && items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <WishlistCard
                            key={item.id}
                            item={item}
                            onRemove={removeFromWishlist}
                            onSelect={setActiveItem}
                        />
                    ))}
                </div>
            )}

            {/* MODAL */}
            {activeItem && (
                <WishlistModal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                />
            )}
        </div>
    );
}
