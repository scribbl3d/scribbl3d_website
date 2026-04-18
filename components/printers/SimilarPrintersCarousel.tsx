"use client";

import { NotifyMeModal } from "@/components/shared/NotifyMeModal";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Bell, ChevronLeft, ChevronRight, Heart } from "lucide-react";
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
    inStock?: boolean;
    images?: { url: string }[];
    attributes?: { attributeKey: string; attributeValue: string }[];
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
        container.scrollLeft = 0;
        const interval = setInterval(() => {
            const cardWidth = container.firstElementChild?.clientWidth || 0;
            container.scrollBy({ left: cardWidth, behavior: "smooth" });
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollTo({ left: 0, behavior: "auto" });
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
                `/api/printers/similar?technology=${technology}&exclude=${currentPrinterId}`,
            );
            const data = await res.json();
            setPrinters(data.printers || []);
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const scroll = (dir: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({
            left: dir === "left" ? -cardWidth : cardWidth,
            behavior: "smooth",
        });
    };

    if (loading || printers.length === 0) return null;

    return (
        <div className="py-4 sm:py-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">
                Similar Printers
            </h2>

            <div className="relative">
                {/* Arrow buttons — hidden on mobile (swipe), visible on sm+ */}
                <button
                    onClick={() => scroll("left")}
                    className="hidden sm:flex absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow items-center justify-center hover:bg-gray-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="hidden sm:flex absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow items-center justify-center hover:bg-gray-100"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2 sm:pb-4"
                >
                    {[...printers, ...printers].map((printer, index) => (
                        <div
                            key={`${printer.id}-${index}`}
                            className="snap-start flex-shrink-0 w-[48%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
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
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const isOutOfStock = printer.inStock === false;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOutOfStock) return;
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
        e: React.MouseEvent<HTMLButtonElement>,
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
        setIsFavorite(!wasInWishlist);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ printerId: printer.id }),
            });
            toast({
                title: wasInWishlist
                    ? "Removed from wishlist"
                    : "Added to wishlist",
            });
        } catch {
            setIsFavorite(wasInWishlist);
            toast({
                title: "Error",
                description: "Failed to update wishlist.",
                variant: "destructive",
            });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <>
            <Link href={`/printers/${printer.slug}`} className="block h-full">
                <div className="bg-white rounded-lg sm:rounded-xl border overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                    {/* IMAGE */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {(printer.imageUrl || printer.images?.[0]?.url) && (
                            <Image
                                src={printer.imageUrl || printer.images![0].url}
                                alt={printer.name}
                                fill
                                className="object-contain"
                            />
                        )}
                        {isOutOfStock && (
                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full z-10">
                                Out of Stock
                            </div>
                        )}
                        <button
                            onClick={handleToggleWishlist}
                            className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-9 sm:h-9 bg-white rounded-full shadow flex items-center justify-center z-10"
                        >
                            {isWishlistLoading ? (
                                <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-3 h-3 sm:w-5 sm:h-5 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                            )}
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="px-2.5 pt-2 sm:p-4 flex-1">
                        <span className="inline-block mb-1 sm:mb-2 px-1.5 py-px sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {printer.technology}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                            {printer.name}
                        </h3>
                        {/* Description — hidden on mobile */}
                        <p className="hidden sm:block text-xs text-gray-600 mt-1 mb-2 line-clamp-2">
                            {printer.shortDescription || printer.description}
                        </p>
                        {/* Specs — hidden on mobile */}
                        <div className="hidden sm:block text-xs text-gray-700 space-y-1">
                            <div>
                                <b>Build Volume:</b> {printer.volumeLength} ×{" "}
                                {printer.volumeWidth} × {printer.volumeHeight}{" "}
                                mm
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-auto px-2.5 pb-2.5 sm:px-4 sm:pb-4">
                        <hr className="hidden sm:block mb-3" />

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 flex-wrap mt-1 sm:mt-0">
                            <span className="text-[13px] sm:text-[16px] font-bold text-[#101828]">
                                ₹{printer.price.toLocaleString("en-IN")}
                            </span>
                            {printer.originalPrice && (
                                <span className="text-[10px] sm:text-sm line-through text-gray-400">
                                    ₹
                                    {printer.originalPrice.toLocaleString(
                                        "en-IN",
                                    )}
                                </span>
                            )}
                            {printer.discount && (
                                <span className="h-[14px] sm:h-auto px-1 sm:px-2 sm:py-0.5 inline-flex items-center rounded-full text-[8px] sm:text-xs text-green-700 bg-green-50 border border-green-200">
                                    {printer.discount}% OFF
                                </span>
                            )}
                        </div>

                        <p className="text-[9px] sm:text-sm text-gray-500 mb-1.5 sm:mt-1 sm:mb-3">
                            (incl. GST)
                        </p>

                        {/* Add to Cart */}
                        {!isOutOfStock && (
                            <button
                                onClick={handleAddToCart}
                                disabled={isCartLoading}
                                className="w-full h-8 sm:h-12 text-[11px] sm:text-base bg-black text-white font-semibold rounded-md sm:rounded-lg hover:bg-gray-900 transition"
                            >
                                {isCartLoading ? (
                                    <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : (
                                    "Add to Cart"
                                )}
                            </button>
                        )}

                        {/* Notify Me */}
                        {isOutOfStock && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowNotifyModal(true);
                                }}
                                className="w-full h-8 sm:py-2.5 rounded-md sm:rounded-[10px] text-[10px] sm:text-sm font-semibold border-2 border-blue-200 text-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-1"
                            >
                                <Bell
                                    size={10}
                                    className="sm:w-[14px] sm:h-[14px]"
                                />
                                Notify Me
                            </button>
                        )}
                    </div>
                </div>
            </Link>

            {showNotifyModal && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={printer.id}
                    productName={printer.name}
                    productType="printer"
                />
            )}
        </>
    );
}
