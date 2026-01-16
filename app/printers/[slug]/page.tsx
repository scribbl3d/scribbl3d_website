// app/printers/[slug]/page.tsx
"use client";

import SimilarPrintersCarousel from "@/components/printers/SimilarPrintersCarousel";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { ArrowLeft, Check, Download, Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrinterDetailPage() {
    const { slug } = useParams<{ slug: string }>() ?? {};
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishLoading, setIsWishLoading] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [printer, setPrinter] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState("specifications");
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { data: session } = useSession();
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!slug) return;
        fetchPrinterDetails();
    }, [slug]);
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
                quantity: quantity,
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
    useEffect(() => {
        if (!session || !printer?.id) return;

        async function checkWishlist() {
            try {
                const res = await fetch(
                    `/api/wishlist/check?printerId=${printer.id}`
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
                    printerId: printer.id,
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

    if (loading) {
        return <PrinterDetailSkeleton />;
    }
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

    if (!printer) {
        return null; // Safety check
    }

    const groupedSpecs = printer.specifications.reduce((acc, spec) => {
        if (!acc[spec.category]) acc[spec.category] = [];
        acc[spec.category].push(spec);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/printers"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to all printers
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left Column - Images */}
                    <div>
                        {/* Main Image */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                            <div className="relative w-full aspect-square sm:aspect-[4/3] lg:h-[400px] bg-gray-50 rounded-lg overflow-hidden">
                                {printer.images && printer.images.length > 0 ? (
                                    <Image
                                        src={
                                            printer.images[selectedImage]
                                                ?.url || "/placeholder.png"
                                        }
                                        alt={
                                            printer.images[selectedImage]
                                                ?.altText || printer.name
                                        }
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400">
                                            No image available
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {printer.images &&
                                printer.images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImage(index)}
                                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                                            selectedImage === index
                                                ? "border-blue-600"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <Image
                                            src={image.url}
                                            alt={
                                                image.altText ||
                                                `View ${index + 1}`
                                            }
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div>
                        <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
                            {/* Brand */}
                            <p className="text-sm text-gray-600 mb-2">
                                {printer.brand}
                            </p>

                            <button
                                onClick={handleToggleWishlist}
                                disabled={isWishlistLoading}
                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center"
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

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                {printer.name}
                            </h1>

                            {/* Description */}
                            <p className="text-gray-700 mb-4 break-words">
                                {printer.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    {printer.technology}
                                </span>

                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    High-Speed Printing
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    {printer.originalPrice && (
                                        <>
                                            <span className="text-lg text-gray-400 line-through">
                                                ₹
                                                {printer.originalPrice.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </span>
                                            <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                                {printer.discount}% off
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-4xl font-bold text-gray-900 mt-1">
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
                            {/* Quantity */}
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </p>

                                <div className="flex items-center gap-3">
                                    {/* Minus */}
                                    <button
                                        className="
        w-10 h-10
        flex items-center justify-center
        rounded-[10px]
        border-2 border-[#D1D5DC]
        text-xl text-gray-700
        hover:bg-gray-100
        disabled:opacity-50
      "
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1)
                                            )
                                        }
                                        disabled={quantity === 1}
                                    >
                                        −
                                    </button>

                                    {/* Number input */}
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(
                                                /\D/g,
                                                ""
                                            );
                                            setQuantity(
                                                Math.max(1, Number(val || 1))
                                            );
                                        }}
                                        className="
    w-[80px] h-[40px]
    border-2 border-[#D1D5DC]
    rounded-[10px]
    flex items-center justify-center
    text-center
    text-base font-medium text-gray-900
    focus:outline-none
  "
                                    />

                                    {/* Plus */}
                                    <button
                                        className="
        w-10 h-10
        flex items-center justify-center
        rounded-[10px]
        border-2 border-[#D1D5DC]
        text-xl text-gray-700
        hover:bg-gray-100
      "
                                        onClick={() =>
                                            setQuantity((q) => q + 1)
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    className="relative w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={handleAddToCart}
                                    disabled={isCartLoading}
                                >
                                    {/* Button text (kept for width) */}
                                    <span
                                        className={
                                            isCartLoading
                                                ? "opacity-0"
                                                : "opacity-100"
                                        }
                                    >
                                        Add to Cart
                                    </span>

                                    {/* Centered spinner */}
                                    {isCartLoading && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        </span>
                                    )}
                                </button>

                                <button
                                    className="w-full py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                        const message = `Hi, I’d like to request a custom quote for ${printer.name} based on my requirements.`;

                                        const url = `https://wa.me/919599523434?text=${encodeURIComponent(message)}`;
                                        window.open(url, "_blank");
                                    }}
                                >
                                    Contact Sales
                                </button>
                            </div>

                            {/* Benefits */}
                            <div className="flex items-center gap-4 text-sm text-gray-700 mb-6">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>Free installation support</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>
                                        {printer.warrantyYears}-year warranty
                                        included
                                    </span>
                                </div>
                            </div>

                            {/* Quick Specifications */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Quick Specifications
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm">
                                        <span className="text-gray-600">
                                            Technology
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {printer.technology}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm">
                                        <span className="text-gray-600">
                                            Build Volume
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {printer.volumeLength} mm{" × "}
                                            {printer.volumeWidth} mm{" × "}
                                            {printer.volumeHeight} mm
                                        </span>
                                    </div>
                                    {printer.specifications.find(
                                        (s) => s.label === "Supported Materials"
                                    ) && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm">
                                            <span className="text-gray-600">
                                                Materials
                                            </span>
                                            <span className="font-medium text-gray-900 text-right">
                                                {
                                                    printer.specifications.find(
                                                        (s) =>
                                                            s.label ===
                                                            "Supported Materials"
                                                    ).value
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {printer.specifications.find(
                                        (s) => s.label === "Print Speed"
                                    ) && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm">
                                            <span className="text-gray-600">
                                                Print Speed
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {
                                                    printer.specifications.find(
                                                        (s) =>
                                                            s.label ===
                                                            "Print Speed"
                                                    ).value
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {printer.specifications.find(
                                        (s) => s.label === "Extruder Type"
                                    ) && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm">
                                            <span className="text-gray-600">
                                                Extruder Type
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {
                                                    printer.specifications.find(
                                                        (s) =>
                                                            s.label ===
                                                            "Extruder Type"
                                                    ).value
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {printer.specifications.find(
                                        (s) => s.label === "Connectivity"
                                    ) && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm">
                                            <span className="text-gray-600">
                                                Connectivity
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {
                                                    printer.specifications.find(
                                                        (s) =>
                                                            s.label ===
                                                            "Connectivity"
                                                    ).value
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex overflow-x-auto border-b px-4">
                            {[
                                "specifications",
                                "features",
                                "downloads",
                                "support",
                            ].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab
                                            ? "border-blue-600 text-blue-600"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "specifications" && (
                            <SpecificationsTab specifications={groupedSpecs} />
                        )}
                        {activeTab === "features" && (
                            <FeaturesTab
                                features={printer.features}
                                applications={printer.applications}
                            />
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
                <div className="mt-12">
                    <SimilarPrintersCarousel
                        currentPrinterId={printer.id}
                        technology={printer.technology}
                    />
                </div>
            </div>
        </div>
    );
}
type Specification = {
    id: string;
    label: string;
    value: string;
};

type GroupedSpecs = Record<string, Specification[]>;

function SpecificationsTab({
    specifications,
}: {
    specifications: GroupedSpecs;
}) {
    return (
        <div className="space-y-8">
            {Object.entries(specifications).map(([category, specs]) => (
                <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {category}
                    </h3>

                    <div className="space-y-3">
                        {specs.map((spec) => (
                            <div
                                key={spec.id}
                                className="flex justify-between py-2 border-b border-gray-100"
                            >
                                <span className="text-sm text-gray-600">
                                    {spec.label}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
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
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="flex items-start gap-3"
                        >
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                                {feature.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ideal Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                    {applications.map((app) => (
                        <span
                            key={app.id}
                            className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
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
        <div className="space-y-4">
            {downloads && downloads.length > 0 ? (
                downloads.map((download) => (
                    <a
                        key={download.id}
                        href={download.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Download className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {download.title}
                                </h4>
                                {download.description && (
                                    <p className="text-sm text-gray-600">
                                        {download.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                            <span>Download</span>
                            <svg
                                className="w-4 h-4"
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
                <div className="text-center py-8">
                    <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                        No downloads available for this printer.
                    </p>
                </div>
            )}
        </div>
    );
}

function SupportTab({ warrantyYears, price }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Warranty Information
                </h3>
                <p className="text-gray-700">
                    {warrantyYears}-year manufacturer warranty with optional
                    extended coverage available.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    After-Sales Support
                </h3>
                <p className="text-gray-700">
                    24/7 technical support via email and phone. Live chat
                    through Whatsapp available during business hours.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Installation & Training
                </h3>
                <p className="text-gray-700">
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
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left Column - Images */}
                    <div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                            <div className="w-full h-[400px] bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-20 h-20 bg-gray-200 rounded-lg"
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-8 w-3/4 bg-gray-200 rounded mb-3"></div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex gap-2 mb-6">
                                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                                <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="mb-6">
                                <div className="h-4 w-12 bg-gray-200 rounded mb-1"></div>
                                <div className="h-10 w-40 bg-gray-200 rounded mb-2"></div>
                            </div>
                            <div className="space-y-3 mb-6">
                                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                                <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
