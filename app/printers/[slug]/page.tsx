// app/printers/[slug]/page.tsx
"use client";

import SimilarPrintersCarousel from "@/components/printers/SimilarPrintersCarousel";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";
import { StockBadge } from "@/components/ui/stock-badge";
import { toast } from "@/components/ui/use-toast";
import { getPdpImageUrl, getThumbnailUrl } from "@/lib/cloudinary-url";
import { useCart } from "@/providers/CartProvider";
import { useImageCarousel } from "@/hooks/use-image-carousel";
import { ArrowLeft, Bell, Check, Download, Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrinterDetailPage() {
    const { slug } = useParams<{ slug: string }>() ?? {};
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [printer, setPrinter] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("specifications");
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { data: session } = useSession();
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const ArrowRight = ({ size = 22 }: { size?: number }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path
                d="M13 6L19 12L13 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    const ArrowLefti = ({ size = 22 }: { size?: number }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path
                d="M19 12H5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path
                d="M11 6L5 12L11 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    const carousel = useImageCarousel(printer?.images?.map(img => img.url) || [], {
        autoPlayInterval: 3000,
        pauseOnHover: true,
    });

    useEffect(() => {
        if (!slug) return;
        fetchPrinterDetails();
    }, [slug]);

    const isOutOfStock = printer?.inStock === false;

    const handleAddToCart = async () => {
        if (!printer || isCartLoading || isOutOfStock) return;

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
            await addToCart({ printerId: printer.id, quantity });
            toast({
                title: "Added to Cart",
                description: `${printer.name} has been added to your cart.`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to add printer to cart.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    useEffect(() => {
        if (!session || !printer?.id) return;
        async function checkWishlist() {
            try {
                const res = await fetch(
                    `/api/wishlist/check?printerId=${printer.id}`,
                );
                const data = await res.json();
                setIsFavorite(data.isInWishlist);
            } catch (err) {
                console.error("Wishlist check failed", err);
            }
        }
        checkWishlist();
    }, [session, printer?.id]);


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
                description: "Failed to update wishlist. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const fetchPrinterDetails = async () => {
        setLoading(true);
        try {
            if (!slug) return;
            const response = await fetch(`/api/printers/${slug}`);
            if (!response.ok) {
                setPrinter(null);
                return;
            }
            const data = await response.json();
            setPrinter(data);
        } catch (error) {
            console.error("Error fetching printer:", error);
            setPrinter(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PrinterDetailSkeleton />;

    if (!printer && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Printer not found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The printer you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    if (!printer) return null;

    const groupedSpecs = printer.specifications.reduce((acc, spec) => {
        if (!acc[spec.category]) acc[spec.category] = [];
        acc[spec.category].push(spec);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Header */}
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40 sm:static">
                <div className="container mx-auto px-4 py-3.5 sm:py-5">
                    <Link
                        href="/printers"
                        className="inline-flex items-center text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Back to all printers
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
                    {/* Left Column - Images */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div
                            className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 mb-2 sm:mb-4"
                            onMouseEnter={() => carousel.setIsHovering(true)}
                            onMouseLeave={() => carousel.setIsHovering(false)}
                            {...carousel.touchHandlers}
                        >
                            {/* Square on all screens — consistent with card */}
                            <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden">
                                {printer.images && printer.images.length > 0 ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={getPdpImageUrl(printer.images[carousel.current]?.url)}
                                            alt={printer.name}
                                            className="w-full h-full object-contain"
                                        />

                                        {/* Nav arrows on hover/touch — only if we have > 1 image */}
                                        {carousel.totalImages > 1 && (
                                            <>
                                                <button
                                                    onClick={carousel.prev}
                                                    aria-label="Previous image"
                                                    className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/80 sm:bg-white rounded-full flex items-center justify-center shadow transition-all ${carousel.isHovering ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
                                                >
                                                    <span className="text-black text-sm sm:text-base">
                                                        <ArrowLefti />
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={carousel.next}
                                                    aria-label="Next image"
                                                    className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/80 sm:bg-white rounded-full flex items-center justify-center shadow transition-all ${carousel.isHovering ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
                                                >
                                                    <span className="text-black text-sm sm:text-base">
                                                        <ArrowRight />
                                                    </span>
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* Out of Stock badge */}
                                        <StockBadge inStock={!isOutOfStock} size="md" className="top-2 right-2 sm:top-4 sm:right-4 z-10" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400">
                                            No image available
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                            {printer.images?.map((image, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => carousel.goTo(index)}
                                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition flex-shrink-0 ${
                                        carousel.current === index
                                            ? "border-blue-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getThumbnailUrl(image.url)}
                                        alt={
                                            image.altText || `View ${index + 1}`
                                        }
                                        className="w-full h-full object-contain"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 relative">
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                                {printer.brand}
                            </p>

                            <button
                                onClick={handleToggleWishlist}
                                disabled={isWishlistLoading}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center"
                            >
                                {isWishlistLoading ? (
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                                ) : (
                                    <Heart
                                        className={`w-4 h-4 sm:w-5 sm:h-5 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                    />
                                )}
                            </button>

                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 pr-10">
                                {printer.name}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 break-words">
                                {printer.shortDescription}
                            </p>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-semibold rounded-full">
                                    {printer.technology}
                                </span>
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-800 text-[10px] sm:text-xs font-semibold rounded-full">
                                    High-Speed Printing
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-4 sm:mb-6">
                                <div className="flex items-baseline gap-2 sm:gap-3">
                                    {printer.originalPrice && (
                                        <>
                                            <span className="text-sm sm:text-lg text-gray-400 line-through">
                                                ₹
                                                {printer.originalPrice.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </span>
                                            <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded">
                                                {printer.discount}% off
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-2xl sm:text-4xl font-bold text-gray-900 mt-1">
                                    ₹{printer.price.toLocaleString("en-IN")}
                                </p>
                                {printer.originalPrice && (
                                    <p className="text-sm text-green-600 font-medium mt-1">
                                        Save ₹
                                        {(
                                            printer.originalPrice -
                                            printer.price
                                        ).toLocaleString("en-IN")}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    MRP inclusive of all taxes. Shipping
                                    calculated at checkout.
                                </p>
                            </div>

                            {/* Quantity — only shown when in stock */}
                            {!isOutOfStock && (
                                <div className="mb-4 sm:mb-6">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                        Quantity
                                    </p>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <button
                                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-[10px] border-2 border-[#D1D5DC] text-lg sm:text-xl text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.max(1, q - 1),
                                                )
                                            }
                                            disabled={quantity === 1}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={quantity}
                                            onChange={(e) => {
                                                const val =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    );
                                                setQuantity(
                                                    Math.max(
                                                        1,
                                                        Number(val || 1),
                                                    ),
                                                );
                                            }}
                                            className="w-[60px] h-[32px] sm:w-[80px] sm:h-[40px] border-2 border-[#D1D5DC] rounded-lg sm:rounded-[10px] text-center text-sm sm:text-base font-medium text-gray-900 focus:outline-none"
                                        />
                                        <button
                                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-[10px] border-2 border-[#D1D5DC] text-lg sm:text-xl text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setQuantity((q) => q + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                {/* Add to Cart / Out of Stock */}
                                <button
                                    className={`relative w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors flex items-center justify-center ${
                                        isOutOfStock
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                    onClick={handleAddToCart}
                                    disabled={isCartLoading || isOutOfStock}
                                >
                                    {isOutOfStock ? (
                                        "Out of Stock"
                                    ) : (
                                        <>
                                            <span
                                                className={
                                                    isCartLoading
                                                        ? "opacity-0"
                                                        : "opacity-100"
                                                }
                                            >
                                                Add to Cart
                                            </span>
                                            {isCartLoading && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>

                                {/* Notify Me — only when out of stock */}
                                {isOutOfStock && (
                                    <button
                                        onClick={() => setShowNotifyModal(true)}
                                        className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2 border-blue-200 text-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Bell size={16} />
                                        Notify Me When Back in Stock
                                    </button>
                                )}

                                {/* Contact Sales — hidden when out of stock */}
                                {!isOutOfStock && (
                                    <button
                                        className="w-full py-2.5 sm:py-3 bg-white text-sm sm:text-base text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            const message = `Hi, I'd like to request a custom quote for ${printer.name} based on my requirements.`;
                                            window.open(
                                                `https://wa.me/919599523434?text=${encodeURIComponent(message)}`,
                                                "_blank",
                                            );
                                        }}
                                    >
                                        Contact Sales
                                    </button>
                                )}
                            </div>

                            {/* Benefits — only when in stock */}
                            {!isOutOfStock && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>Free installation support</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span>
                                            {printer.warrantyYears}-year
                                            warranty included
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Quick Specifications */}
                            <div className="border-t border-gray-200 pt-4 sm:pt-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                                    Quick Specifications
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        {
                                            label: "Technology",
                                            value: printer.technology,
                                        },
                                        {
                                            label: "Build Volume",
                                            value: `${printer.volumeLength} × ${printer.volumeWidth} × ${printer.volumeHeight} mm`,
                                        },
                                        {
                                            label: "Materials",
                                            value: printer.specifications.find(
                                                (s) =>
                                                    s.label ===
                                                    "Supported Materials",
                                            )?.value,
                                        },
                                        {
                                            label: "Print Speed",
                                            value: printer.specifications.find(
                                                (s) =>
                                                    s.label === "Print Speed",
                                            )?.value,
                                        },
                                        {
                                            label: "Extruder Type",
                                            value: printer.specifications.find(
                                                (s) =>
                                                    s.label === "Extruder Type",
                                            )?.value,
                                        },
                                        {
                                            label: "Connectivity",
                                            value: printer.specifications.find(
                                                (s) =>
                                                    s.label === "Connectivity",
                                            )?.value,
                                        },
                                    ]
                                        .filter((item) => item.value)
                                        .map(({ label, value }) => (
                                            <div
                                                key={label}
                                                className="flex justify-between items-start gap-2 sm:gap-4 py-1.5 sm:py-2 border-b border-gray-100 last:border-0"
                                            >
                                                <span className="text-xs sm:text-sm text-gray-500 shrink-0 w-[35%] sm:max-w-[40%]">
                                                    {label}
                                                </span>
                                                <span className="text-xs sm:text-sm font-medium text-gray-900 text-left sm:text-right flex-1 break-words">
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex overflow-x-auto border-b px-2 sm:px-4 scrollbar-hide">
                            {[
                                "specifications",
                                "features",
                                "description",
                                "downloads",
                                "support",
                            ].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-3 sm:p-6">
                        {activeTab === "specifications" && (
                            <SpecificationsTab specifications={groupedSpecs} />
                        )}
                        {activeTab === "features" && (
                            <FeaturesTab
                                features={printer.features}
                                applications={printer.applications}
                            />
                        )}
                        {activeTab === "description" && (
                            <div>
                                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                                    About {printer.name}
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                                    <div className="lg:col-span-2 bg-gray-50 rounded-xl p-3 sm:p-4 lg:p-6 border border-gray-100">
                                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                                            {printer.description}
                                        </p>
                                    </div>
                                    <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-visible scrollbar-hide">
                                        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 bg-blue-50 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-blue-100 flex-shrink-0 min-w-[150px] sm:min-w-[160px] lg:min-w-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-semibold text-blue-500 uppercase tracking-wide">
                                                    Technology
                                                </p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                                    {printer.technology}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 bg-green-50 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-green-100 flex-shrink-0 min-w-[150px] sm:min-w-[160px] lg:min-w-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-semibold text-green-500 uppercase tracking-wide">
                                                    Build Volume
                                                </p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                                    {printer.volumeLength} ×{" "}
                                                    {printer.volumeWidth} ×{" "}
                                                    {printer.volumeHeight} mm
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 bg-purple-50 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 border border-purple-100 flex-shrink-0 min-w-[150px] sm:min-w-[160px] lg:min-w-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                                                <svg
                                                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] sm:text-xs font-semibold text-purple-500 uppercase tracking-wide">
                                                    Warranty
                                                </p>
                                                <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                                    {printer.warrantyYears}-Year
                                                    Included
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "downloads" && (
                            <DownloadsTab downloads={printer.downloads} />
                        )}
                        {activeTab === "support" && (
                            <SupportTab
                                warrantyYears={printer.warrantyYears}
                                price={printer.price}
                            />
                        )}
                    </div>
                </div>

                {/* Similar Printers */}
                <div className="mt-6 sm:mt-12">
                    <SimilarPrintersCarousel
                        currentPrinterId={printer.id}
                        technology={printer.technology}
                    />
                </div>
            </div>

            {/* Notify Me Modal */}
            {showNotifyModal && printer && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={printer.id}
                    productName={printer.name}
                    productType="printer"
                />
            )}
        </div>
    );
}

/* ── Tab Components ── */

type Specification = { id: string; label: string; value: string };
type GroupedSpecs = Record<string, Specification[]>;

function SpecificationsTab({
    specifications,
}: {
    specifications: GroupedSpecs;
}) {
    return (
        <div className="space-y-6 sm:space-y-8">
            {Object.entries(specifications).map(([category, specs]) => (
                <div key={category}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        {category}
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        {specs.map((spec) => (
                            <div
                                key={spec.id}
                                className="flex justify-between gap-3 sm:gap-4 py-2 border-b border-gray-100"
                            >
                                <span className="text-xs sm:text-sm text-gray-600 shrink-0 w-[40%] sm:max-w-[45%]">
                                    {spec.label}
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 text-left sm:text-right flex-1 break-words">
                                    {spec.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function FeaturesTab({ features, applications }) {
    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="flex items-start gap-2 sm:gap-3"
                        >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">
                                {feature.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Ideal Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                    {applications.map((app) => (
                        <span
                            key={app.id}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full"
                        >
                            {app.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DownloadsTab({ downloads }) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {downloads && downloads.length > 0 ? (
                downloads.map((download) => (
                    <a
                        key={download.id}
                        href={download.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                    {download.title}
                                </h4>
                                {download.description && (
                                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                        {download.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 font-medium text-xs sm:text-sm flex-shrink-0 ml-2">
                            <span className="hidden sm:inline">Download</span>
                            <svg
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </div>
                    </a>
                ))
            ) : (
                <div className="text-center py-6 sm:py-8">
                    <Download className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-gray-600">
                        No downloads available for this printer.
                    </p>
                </div>
            )}
        </div>
    );
}

function SupportTab({ warrantyYears, price }) {
    return (
        <div className="space-y-5 sm:space-y-6">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                    Warranty Information
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {warrantyYears}-year manufacturer warranty with optional
                    extended coverage available.
                </p>
            </div>
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                    After-Sales Support
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    24/7 technical support via email and phone. Live chat
                    through Whatsapp available during business hours.
                </p>
            </div>
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                    Installation & Training
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {price < 50000
                        ? "Guided video setup support with complete manuals and documentation for a seamless self-installation experience."
                        : "On-site professional installation and 2-hour operator training for select pincodes; structured video assistance and documentation for all other locations."}
                </p>
            </div>
        </div>
    );
}

function PrinterDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="h-4 sm:h-5 w-32 sm:w-40 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 mb-2 sm:mb-4">
                            <div className="w-full aspect-square bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2 justify-center">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex-shrink-0"
                                ></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 sm:h-8 w-3/4 bg-gray-200 rounded mb-3"></div>
                            <div className="space-y-2 mb-4">
                                <div className="h-3 sm:h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-3 sm:h-4 w-5/6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex gap-2 mb-4 sm:mb-6">
                                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                                <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <div className="h-3 sm:h-4 w-12 bg-gray-200 rounded mb-1"></div>
                                <div className="h-8 sm:h-10 w-32 sm:w-40 bg-gray-200 rounded mb-2"></div>
                            </div>
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <div className="h-10 sm:h-12 w-full bg-gray-200 rounded-lg"></div>
                                <div className="h-10 sm:h-12 w-full bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
