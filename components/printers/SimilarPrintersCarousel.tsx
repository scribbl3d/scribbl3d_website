"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface SimilarPrintersCarouselProps {
    currentPrinterId: string;
    technology: string;
}

type Printer = {
    id: string;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    technology: string;
    description?: string;
    shortDescription?: string;
    volumeLength?: number;
    volumeWidth?: number;
    volumeHeight?: number;
    imageUrl?: string;
    images?: { url: string }[];
    attributes?: {
        attributeKey: string;
        attributeValue: string;
    }[];
};

export default function SimilarPrintersCarousel({
    currentPrinterId,
    technology,
}: SimilarPrintersCarouselProps) {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!scrollRef.current || printers.length <= 1) return;

        const container = scrollRef.current;
        const cardWidth = container.firstElementChild?.clientWidth || 0;

        // Start from first set
        container.scrollLeft = 0;

        const interval = setInterval(() => {
            container.scrollBy({
                left: cardWidth,
                behavior: "smooth",
            });

            // When we reach the middle (end of first list)
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollTo({
                    left: 0,
                    behavior: "auto", // invisible reset
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [printers]);

    useEffect(() => {
        fetchSimilarPrinters();
    }, [currentPrinterId, technology]);

    const fetchSimilarPrinters = async () => {
        try {
            const res = await fetch(
                `/api/printers/similar?technology=${technology}&exclude=${currentPrinterId}`
            );
            const data = await res.json();
            setPrinters(data.printers || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ⬅️➡️ MANUAL SCROLL */
    const scrollLeft = () => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({ left: -cardWidth, behavior: "smooth" });
    };

    const scrollRight = () => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
    };

    if (loading || printers.length === 0) return null;

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Similar Printers
            </h2>

            {/* WRAPPER FOR ARROWS */}
            <div className="relative">
                {/* LEFT ARROW */}
                <button
                    onClick={scrollLeft}
                    className="
                        absolute left-[-18px] top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-white shadow
                        flex items-center justify-center
                        hover:bg-gray-100
                    "
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* RIGHT ARROW */}
                <button
                    onClick={scrollRight}
                    className="
                        absolute right-[-18px] top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-white shadow
                        flex items-center justify-center
                        hover:bg-gray-100
                    "
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* CAROUSEL */}
                <div
                    ref={scrollRef}
                    className="
                        flex gap-5 overflow-x-auto scroll-smooth
                        snap-x snap-mandatory
                        scrollbar-hide pb-4
                    "
                >
                    {[...printers, ...printers].map((printer, index) => (
                        <div
                            key={`${printer.id}-${index}`}
                            className="
            snap-start flex-shrink-0
            w-[85%]
            sm:w-[48%]
            lg:w-[32%]
            xl:w-[24%]
        "
                        >
                            <SimilarPrinterCard printer={printer} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------------- CARD ---------------- */

function SimilarPrinterCard({ printer }: { printer: Printer }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);

    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const materials =
        printer.attributes
            ?.filter((a) => a.attributeKey === "material")
            .map((a) => a.attributeValue) || [];

    const handleAddToCart = async () => {
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

        try {
            setIsCartLoading(true);
            await addToCart({ printerId: printer.id, quantity: 1 });
            toast({
                title: "Added to Cart",
                description: `${printer.name} added to cart.`,
            });
        } finally {
            setIsCartLoading(false);
        }
    };
    const handleToggleWishlist = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            toast({
                title: "Authentication required",
                description: "Please log in to add items to wishlist",
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

        if (isWishlistLoading) return;

        setIsWishlistLoading(true);

        const wasInWishlist = isFavorite;

        // ✅ Optimistic update
        setIsFavorite(!wasInWishlist);

        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resinId: printer.id,
                }),
            });

            toast({
                title: wasInWishlist
                    ? "Removed from wishlist"
                    : "Added to wishlist",
                description: `${printer.name} has been ${
                    wasInWishlist ? "removed from" : "added to"
                } your wishlist.`,
            });
        } catch (err) {
            // 🔁 rollback on failure
            setIsFavorite(wasInWishlist);

            toast({
                title: "Error",
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <Link href={`/printers/${printer.slug}`} className="block h-full">
            <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                {/* IMAGE */}
                <div className="relative h-[220px] bg-gray-100 overflow-hidden overflow-x-hidden">
                    {(printer.imageUrl || printer.images?.[0]?.url) && (
                        <Image
                            src={printer.imageUrl || printer.images![0].url}
                            alt={printer.name}
                            fill
                            className="object-contain "
                        />
                    )}

                    <button
                        onClick={handleToggleWishlist}
                        className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center"
                    >
                        {isWishlistLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                            <Heart
                                className={`w-5 h-5 transition ${
                                    isFavorite
                                        ? "fill-red-500 text-red-500"
                                        : "text-gray-400"
                                }`}
                            />
                        )}
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-4 flex-1">
                    <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {printer.technology}
                    </span>

                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                        {printer.name}
                    </h3>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {printer.shortDescription || printer.description}
                    </p>

                    <div className="text-xs text-gray-700 space-y-1">
                        <div>
                            <b>Build Volume:</b> {printer.volumeLength} ×{" "}
                            {printer.volumeWidth} × {printer.volumeHeight} mm
                        </div>

                        {materials.length > 0 && (
                            <div className="line-clamp-2">
                                <b>Materials:</b> {materials.join(", ")}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-5 pb-5">
                    <hr className="mb-4" />

                    <div className="flex items-center">
                        <span className="text-[16px] font-semibold text-[#101828]">
                            ₹{printer.price.toLocaleString("en-IN")}
                        </span>

                        {printer.originalPrice && (
                            <span className="ml-5 text-sm line-through text-gray-400">
                                ₹{printer.originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}

                        {printer.discount && (
                            <span className="ml-6 px-2 py-0.5 text-xs rounded-full text-green-700 bg-green-50 border border-green-200">
                                {printer.discount}% OFF
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1 mb-3">
                        (incl. GST)
                    </p>

                    <button
                        onClick={handleAddToCart}
                        disabled={isCartLoading}
                        className="w-full h-12 bg-black text-white font-semibold rounded-lg"
                    >
                        {isCartLoading ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </Link>
    );
}
