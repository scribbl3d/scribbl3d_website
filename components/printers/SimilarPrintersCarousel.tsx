// components/printers/SimilarPrintersCarousel.tsx
"use client";

import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
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

    const materials =
        printer.attributes
            ?.filter((attr) => attr.attributeKey === "material")
            .map((attr) => attr.attributeValue) || [];

    return (
        <Link href={`/printers/${printer.slug}`} className="block group">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Image Section */}
                <div className="relative w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {printer.imageUrl ||
                    (printer.images && printer.images[0]) ? (
                        <Image
                            src={printer.imageUrl || printer.images[0].url}
                            alt={printer.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <svg
                                    className="w-16 h-16 text-gray-300 mx-auto mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                    />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Favorite Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsFavorite(!isFavorite);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 z-10"
                    >
                        <Heart
                            className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                        />
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-4">
                    {/* Technology Badge */}
                    <div className="mb-2">
                        <span className="inline-block px-2.5 py-1 bg-[#BFDBFE] text-[#1E40AF] text-xs font-semibold rounded-full">
                            {printer.technology}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600">
                        {printer.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {printer.shortDescription || printer.description}
                    </p>

                    {/* Quick Info */}
                    <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Build Volume:</span>
                            <span className="text-gray-900 font-semibold">
                                {printer.volumeLength} × {printer.volumeWidth} ×{" "}
                                {printer.volumeHeight} mm
                            </span>
                        </div>
                        {materials.length > 0 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">
                                    Materials:
                                </span>
                                <span className="text-gray-900 font-semibold text-right">
                                    {materials.slice(0, 2).join(", ")}
                                    {materials.length > 2 ? "..." : ""}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-baseline gap-2">
                            {printer.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                    ₹
                                    {(
                                        printer.originalPrice / 100
                                    ).toLocaleString("en-IN")}
                                </span>
                            )}
                            <span className="text-lg font-bold text-gray-900">
                                ₹{(printer.price / 100).toLocaleString("en-IN")}
                            </span>
                            {printer.discount && (
                                <span className="text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                    {printer.discount}% off
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
