// components/printers/SimilarPrintersCarousel.tsx
"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchSimilarPrinters();
    }, [currentPrinterId, technology]);

    const fetchSimilarPrinters = async () => {
        try {
            const response = await fetch(
                `/api/printers/similar?technology=${technology}&exclude=${currentPrinterId}`
            );
            const data = await response.json();
            setPrinters(data.printers || []);
        } catch (error) {
            console.error("Error fetching similar printers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? Math.max(0, printers.length - 3) : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= printers.length - 3 ? 0 : prev + 1));
    };

    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Similar Printers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                        >
                            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (printers.length === 0) {
        return null;
    }

    // Determine how many cards to show based on screen size
    const visiblePrinters = printers.slice(currentIndex, currentIndex + 3);

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Similar Printers
                </h2>

                {printers.length > 3 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex >= printers.length - 3}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {visiblePrinters.map((printer) => (
                    <SimilarPrinterCard key={printer.id} printer={printer} />
                ))}
            </div>

            {printers.length > 3 && (
                <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: Math.ceil(printers.length / 3) }).map(
                        (_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index * 3)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    Math.floor(currentIndex / 3) === index
                                        ? "bg-blue-600 w-6"
                                        : "bg-gray-300"
                                }`}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}

function SimilarPrinterCard({ printer }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const materials =
        printer.attributes
            ?.filter((attr) => attr.attributeKey === "material")
            .map((attr) => attr.attributeValue) || [];
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

    return (
        <Link href={`/printers/${printer.slug}`} className="block h-full">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                {/* IMAGE */}
                <div className="relative h-[220px] w-full bg-gray-100 overflow-hidden">
                    {(printer.imageUrl || printer.images?.[0]?.url) && (
                        <Image
                            src={printer.imageUrl || printer.images[0].url}
                            alt={printer.name}
                            fill
                            className="object-cover"
                        />
                    )}

                    {/* WISHLIST */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsFavorite(!isFavorite);
                        }}
                        className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center"
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
                <div className="p-4 flex-1">
                    {/* TECHNOLOGY */}
                    <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {printer.technology}
                    </span>

                    {/* NAME */}
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                        {printer.name}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {printer.shortDescription || printer.description}
                    </p>

                    {/* SPECS */}
                    <div className="text-xs text-gray-700 space-y-1">
                        <div>
                            <span className="font-semibold">Build Volume:</span>{" "}
                            {printer.volumeLength} mm × {printer.volumeWidth} mm
                            ×{printer.volumeHeight} mm
                        </div>

                        {materials.length > 0 && (
                            <div className="line-clamp-2">
                                <span className="font-semibold">
                                    Materials:
                                </span>{" "}
                                {materials.join(", ")}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER (LOCKED) */}

                {/* PRICE */}
                <div className="mt-auto px-5 pb-5">
                    <hr className="mb-4" />

                    {/* PRICE ROW */}
                    {/* PRICE ROW */}
                    <div className="flex items-center mt-1">
                        {/* FINAL PRICE */}
                        <span
                            className="
      text-[16px]
      leading-[24px]
      font-semibold
      text-[#101828]
    "
                        >
                            ₹{printer.price.toLocaleString("en-IN")}
                        </span>

                        {/* ORIGINAL PRICE */}
                        {printer.originalPrice && (
                            <span
                                className="
        ml-5

        text-[14px]
        leading-[20px]
        font-normal
        line-through
        text-[#99A1AF]
      "
                            >
                                ₹{printer.originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}

                        {/* DISCOUNT */}
                        {printer.discount && (
                            <span
                                className="
        ml-6
        h-[22px]
        px-2
        inline-flex
        items-center
        rounded-full
        text-[12px]
        leading-[16px]
        font-medium
        text-[#008236]
        bg-[#F0FDF4]
        border
        border-[#B9F8CF]
      "
                            >
                                {printer.discount}% OFF
                            </span>
                        )}
                    </div>

                    <p className="text-[14px] leading-[20px] text-[#667085] mt-1 mb-3">
                        (incl. GST)
                    </p>

                    {/* ADD TO CART */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isCartLoading}
                        className="w-full h-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition flex items-center justify-center"
                    >
                        {isCartLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Add to Cart"
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}
