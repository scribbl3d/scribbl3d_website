"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function PrinterGrid({ printers }: { printers: any[] }) {
    if (printers.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No printers found
                </h3>
                <p className="text-gray-600">
                    Try adjusting your filters to see more results
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {printers.map((printer) => (
                <PrinterCard key={printer.id} printer={printer} />
            ))}
        </div>
    );
}

function PrinterCard({ printer }: { printer: any }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishLoading, setIsWishLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isCartLoading, setIsCartLoading] = useState(false);
    const router = useRouter();
    const materials = printer.attributes
        .filter((attr: any) => attr.attributeKey === "material")
        .map((attr: any) => attr.attributeValue);

    /* =========================
     ADD TO CART HANDLER
  ========================= */
    const handleAddToCart = async () => {
        if (!printer || isCartLoading) return;

        // Same auth logic as other product pages
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

        setIsCartLoading(true);

        try {
            await addToCart({
                printerId: printer.id,
                quantity: 1,
            });

            toast({
                title: "Added to Cart",
                description: `${printer.name} has been added to your cart.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add printer to cart.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };
    const handleBuyNow = async () => {
        // Implement buy now functionality
        // need to call /checkout api with printerId and quantity
        router.push(
            `/checkout?mode=buynow&type=printer&productId=${printer.id}`
        );
    };
    useEffect(() => {
        const checkWishlist = async () => {
            try {
                const res = await fetch(
                    `/api/wishlist/check?printerId=${printer.id}`
                );
                const data = await res.json();
                if (data.isAuthenticated) {
                    setIsFavorite(data.isInWishlist);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkWishlist();
    }, [printer.id]);

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
            {/* CARD LINK */}
            <Link href={`/printers/${printer.slug}`} className="block">
                {/* IMAGE */}
                <div className="relative w-full h-[200px] bg-gray-100">
                    {printer.imageUrl && (
                        <Image
                            src={printer.imageUrl}
                            alt={printer.name}
                            fill
                            className="object-cover"
                        />
                    )}

                    {/* WISHLIST */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (isWishLoading) return;

                            try {
                                setIsWishLoading(true);

                                const res = await fetch("/api/wishlist", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        printerId: printer.id,
                                    }),
                                });

                                if (res.status === 401) {
                                    toast({
                                        title: "Login required",
                                        description:
                                            "Please login to use wishlist",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                if (!res.ok) {
                                    const data = await res.json();
                                    throw new Error(data.error || "Failed");
                                }

                                const data = await res.json();
                                setIsFavorite(data.added);

                                toast({
                                    title: data.added
                                        ? "Added to Wishlist"
                                        : "Removed from Wishlist",
                                    description: printer.name,
                                });
                            } catch (err: any) {
                                toast({
                                    title: "Error",
                                    description: err.message,
                                    variant: "destructive",
                                });
                            } finally {
                                setIsWishLoading(false);
                            }
                        }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center border"
                    >
                        <Heart
                            className={`w-4 h-4 ${
                                isFavorite
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400"
                            }`}
                        />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3">
                        {printer.technology}
                    </span>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {printer.name}
                    </h3>

                    <p className="text-xs text-gray-600 mb-4">
                        {printer.shortDescription || printer.description}
                    </p>

                    <div className="text-xs mb-4 space-y-1">
                        <div>
                            <strong>Build Volume:</strong>{" "}
                            {printer.volumeDisplay} mm
                        </div>
                        <div>
                            <strong>Materials:</strong>{" "}
                            {materials?.length ? materials.join(", ") : "N/A"}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Item Price: ₹{printer.price}
                        </h3>
                    </div>
                </div>
            </Link>

            {/* ADD TO CART */}
            <div className="px-5 pb-5">
                <button
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={handleAddToCart}
                    disabled={isCartLoading}
                >
                    {isCartLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                        "Add to Cart"
                    )}
                </button>
            </div>
        </div>
    );
}
