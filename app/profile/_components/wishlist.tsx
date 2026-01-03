"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type WishlistItem = {
    id: string;
    product?: any;
    prebuiltProduct?: any;
    printer?: any;
};

type Props = {
    initialWishlist: WishlistItem[];
};

export function Wishlist({ initialWishlist }: Props) {
    const [items, setItems] = useState(initialWishlist || []);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const { addToCart } = useCart();
    const { data: session } = useSession();

    // 🔄 refresh wishlist once mounted
    useEffect(() => {
        async function refresh() {
            const res = await fetch("/api/wishlist");
            const data = await res.json();
            setItems(data.items || []);
        }
        refresh();
    }, []);

    if (!items.length) {
        return <p className="text-muted-foreground">Your wishlist is empty</p>;
    }

    const handleAddToCart = async (item: WishlistItem) => {
        const entity = item.product || item.prebuiltProduct || item.printer;
        if (!entity || loadingId === item.id) return;

        // 🔐 Auth check (same as printer page)
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
                action: (
                    <button
                        onClick={() => signIn()}
                        className="px-3 py-1 bg-white text-black rounded"
                    >
                        Log in
                    </button>
                ),
            });
            return;
        }

        setLoadingId(item.id);

        try {
            await addToCart({
                quantity: 1,

                // IDs
                productId: item.product?.id || "",
                printerId: item.printer?.id,

                // common fields
                name: entity.name,
                price: entity.price,
                images: entity.images?.map((img: any) => img.url || img) ?? [],

                // flags
                isPrebuilt: Boolean(item.prebuiltProduct),
            });

            toast({
                title: "Added to Cart",
                description: `${entity.name} has been added to your cart.`,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to add item to cart.",
                variant: "destructive",
            });
        } finally {
            setLoadingId(null);
        }
    };

    const handleRemove = async (item: WishlistItem) => {
        await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: item.product?.id || item.prebuiltProduct?.id,
                printerId: item.printer?.id,
                isPrebuilt: Boolean(item.prebuiltProduct),
            }),
        });

        setItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item) => {
                const entity =
                    item.product || item.prebuiltProduct || item.printer;
                if (!entity) return null;

                const image =
                    entity.images?.[0]?.url ||
                    entity.images?.[0] ||
                    "/placeholder.png";

                return (
                    <div
                        key={item.id}
                        className="border rounded-lg p-4 flex flex-col gap-3"
                    >
                        <Image
                            src={image}
                            alt={entity.name}
                            width={300}
                            height={300}
                            className="rounded-md"
                        />

                        <h3 className="font-semibold">{entity.name}</h3>
                        <p className="font-bold">₹{entity.price}</p>

                        <div className="flex justify-between ">
                            <Button
                                onClick={() => handleAddToCart(item)}
                                disabled={loadingId === item.id}
                            >
                                {loadingId === item.id
                                    ? "Adding..."
                                    : "Add to Cart"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => handleRemove(item)}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
