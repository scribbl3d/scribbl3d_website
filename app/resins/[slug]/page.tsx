"use client";

import { ArrowLeft, Check, Download, Heart } from "lucide-react";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import SimilarResinsCarousel from "@/components/resins/SimilarResinsCarousel";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function ResinDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { addToCart } = useCart();
    const [activeTab, setActiveTab] = useState("description");
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);

    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const [resin, setResin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [selectedColourIndex, setSelectedColourIndex] = useState(0);
    const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isCartLoading, setIsCartLoading] = useState(false);
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

    useEffect(() => {
        if (!slug) return;
        fetchResin();
    }, [slug]);

    async function fetchResin() {
        setLoading(true);
        try {
            const res = await fetch(`/api/resins/${slug}`);
            if (!res.ok) throw new Error("Resin not found");
            const data = await res.json();
            setResin(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const colour = resin?.colours[selectedColourIndex];
    const images = colour?.images;
    const weight = resin?.weights[selectedWeightIndex];
    const groupedSpecs = resin?.specifications.reduce((acc, spec) => {
        if (!acc[spec.category]) acc[spec.category] = [];
        acc[spec.category].push(spec);
        return acc;
    }, {});
    const maxResolution = resin?.resolution
        ?.map((r: string) => parseInt(r)) // ["4K","8K"] → [4,8]
        ?.sort((a, b) => b - a)[0]; // → 8
    const temperature = resin?.attributes?.find(
        (attr: any) => attr.label === "Temperature",
    )?.value;

    const pressure = resin?.attributes?.find(
        (attr: any) => attr.label === "Pressure",
    )?.value;
    const selectedColourId = resin?.colours?.[selectedColourIndex]?.id ?? null;
    const selectedWeightId = resin?.weights?.[selectedWeightIndex]?.id ?? null;

    const handleAddToCart = async () => {
        if (!resin || isCartLoading) return;

        /* ---------- AUTH CHECK ---------- */
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

        /* ---------- VARIANT VALIDATION ---------- */
        if (!selectedColourId || !selectedWeightId) {
            toast({
                title: "Selection Required",
                description:
                    "Please select both a colour and pack size before adding to cart.",
                variant: "destructive",
            });
            return;
        }

        setIsCartLoading(true);

        try {
            await addToCart({
                resinId: resin.id,
                resinColourId: selectedColourId,
                resinWeightId: selectedWeightId,
                quantity,
            });

            toast({
                title: "Added to Cart",
                description: `${resin.name} has been added to your cart.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to add resin to cart.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };
    useEffect(() => {
        if (!session || !resin?.id) return;

        async function checkWishlist() {
            try {
                const res = await fetch(
                    `/api/wishlist/check?resinId=${resin.id}`,
                );
                const data = await res.json();
                setIsFavorite(data.isInWishlist);
            } catch (err) {
                console.error("Wishlist check failed", err);
            }
        }

        checkWishlist();
    }, [session, resin?.id]);

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

        // ✅ Optimistic update
        setIsFavorite(!wasInWishlist);

        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resinId: resin.id,
                }),
            });

            toast({
                title: wasInWishlist
                    ? "Removed from wishlist"
                    : "Added to wishlist",
                description: `${resin.name} has been ${
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

    const [current, setCurrent] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const total = images?.length || 0;

    /* =====================
       AUTO SLIDE (3s)
    ===================== */
    useEffect(() => {
        if (!total || isHovering) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % total);
        }, 3000);

        return () => clearInterval(interval);
    }, [total, isHovering]);

    /* =====================
       NAVIGATION
    ===================== */
    const next = () => setCurrent((c) => (c + 1) % total);
    const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));

    /* =====================
       TOUCH (SWIPE)
    ===================== */
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (diff > 50)
            next(); // swipe left
        else if (diff < -50) prev(); // swipe right

        touchStartX.current = null;
    };
    if (loading) return <ResinDetailSkeleton />;
    if (!resin) return null;
    return (
        <div className="min-h-screen bg-gray-50 pt-24">
            {/* Header */}

            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link
                        href="/resins"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to all resins
                    </Link>
                </div>
            </div>
            {/* Main */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Images - Sticky on desktop */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        {/* MAIN CAROUSEL */}
                        <div
                            className="bg-white border rounded-lg p-4 mb-4"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        >
                            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {/* SLIDER */}
                                <div
                                    className="flex h-full transition-transform duration-500 ease-in-out"
                                    style={{
                                        transform: `translateX(-${current * 100}%)`,
                                    }}
                                >
                                    {images?.map((img) => (
                                        <div
                                            key={img.id}
                                            className="relative min-w-full h-full"
                                        >
                                            <Image
                                                src={img.url}
                                                alt={
                                                    img.altText ||
                                                    resin?.name ||
                                                    "Resin image"
                                                }
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* LEFT ARROW */}
                                {isHovering && total > 1 && (
                                    <button
                                        onClick={prev}
                                        aria-label="Previous image"
                                        className="
                        absolute left-4 top-1/2 -translate-y-1/2
                        w-12 h-12
                        bg-white
                        rounded-full
                        flex items-center justify-center
                        shadow-[0_4px_20px_rgba(0,0,0,0.12)]
                        transition-transform duration-300
                        hover:scale-110
                        group
                    "
                                    >
                                        <span className="text-black transition-transform duration-300 group-hover:scale-125">
                                            <ArrowLefti size={22} />
                                        </span>
                                    </button>
                                )}

                                {/* RIGHT ARROW */}
                                {isHovering && total > 1 && (
                                    <button
                                        onClick={next}
                                        aria-label="Next image"
                                        className="
                        absolute right-4 top-1/2 -translate-y-1/2
                        w-12 h-12
                        bg-white
                        rounded-full
                        flex items-center justify-center
                        shadow-[0_4px_20px_rgba(0,0,0,0.12)]
                        transition-transform duration-300
                        hover:scale-110
                        group
                    "
                                    >
                                        <span className="text-black transition-transform duration-300 group-hover:scale-125">
                                            <ArrowRight size={22} />
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* THUMBNAILS - Centered */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                            {images?.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-20 h-20 rounded-lg border-2 transition flex-shrink-0 overflow-hidden ${
                                        current === idx
                                            ? "border-blue-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.altText || ""}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info - Scrolls normally */}
                    <div className="bg-white border rounded-lg p-6 relative">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-gray-600">
                                {resin.brand}
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
                        </div>

                        <h1 className="text-3xl font-bold mb-2">
                            {resin.name}
                        </h1>
                        <p className="text-gray-700 mb-4">
                            {resin.shortDescription}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {/* Technology tag */}
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {resin.technology}
                            </span>

                            {/* Max resolution tag */}
                            {maxResolution && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {maxResolution}K Resolution Ready
                                </span>
                            )}
                        </div>

                        {/* Colour */}
                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">
                                Color:{" "}
                                {resin.colours[selectedColourIndex]?.name}{" "}
                                <span className="text-gray-500">
                                    (
                                    {
                                        resin.colours[selectedColourIndex]
                                            ?.hexCode
                                    }
                                    )
                                </span>
                            </p>

                            <div className="flex gap-2">
                                {resin.colours.map((c, idx) => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setSelectedColourIndex(idx);
                                            setSelectedImageIndex(0);
                                            setCurrent(0);
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 ${
                                            idx === selectedColourIndex
                                                ? "border-blue-600"
                                                : "border-gray-300"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                c.hexCode || "#ccc",
                                        }}
                                        title={c.hexCode} // optional: shows on hover
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">
                                Pack Size
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {resin.weights.map((w, idx) => (
                                    <button
                                        key={w.id}
                                        onClick={() =>
                                            setSelectedWeightIndex(idx)
                                        }
                                        className={`px-4 py-2 rounded-lg border text-sm ${
                                            idx === selectedWeightIndex
                                                ? "border-blue-600 text-blue-600"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {w.weightInGrams / 1000} kg
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3">
                                {weight.originalPrice && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">
                                            ₹
                                            {weight.originalPrice.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                            {weight.discount}% off
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-4xl font-bold text-gray-900 mt-1">
                                ₹{weight.price.toLocaleString("en-IN")}
                            </p>
                            {weight.originalPrice && (
                                <p className="text-sm text-green-600 font-medium mt-1">
                                    Save ₹
                                    {(
                                        weight.originalPrice - weight.price
                                    ).toLocaleString("en-IN")}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                                MRP inclusive of all taxes. Shipping calculated
                                at checkout.
                            </p>
                        </div>
                        <hr className="mb-4" />
                        {/* STOCK + COMPATIBILITY LINE */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            {/* Green dot */}

                            {/* Separator dot */}
                            <span className="text-gray-400">•</span>

                            {/* Compatibility text (dynamic) */}
                            <span className="text-gray-600">
                                Compatible with most{" "}
                                <span className="font-medium text-gray-600">
                                    {resin.technology}
                                </span>{" "}
                                printers
                            </span>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-3 mb-6">
                            <button
                                className="w-10 h-10 border rounded"
                                disabled={quantity === 1}
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                            >
                                −
                            </button>
                            <input
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        Math.max(
                                            1,
                                            Number(e.target.value || 1),
                                        ),
                                    )
                                }
                                className="w-16 h-10 border rounded text-center"
                            />
                            <button
                                className="w-10 h-10 border rounded"
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                +
                            </button>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                className="relative w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={handleAddToCart}
                                disabled={
                                    !selectedColourId ||
                                    !selectedWeightId ||
                                    isCartLoading
                                }
                            >
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
                            </button>

                            <button
                                className="w-full py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                    const message = `Hi, I'd like to request a custom quote for ${resin.name} based on my requirements.`;

                                    const url = `https://wa.me/919599523434?text=${encodeURIComponent(message)}`;
                                    window.open(url, "_blank");
                                }}
                            >
                                Contact Sales
                            </button>
                        </div>

                        {/* Quick Specifications */}
                        <div className="border-t border-[#E5E7EB] pt-[25px]">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Specifications
                            </h3>

                            <div className="space-y-3">
                                <div className="grid grid-cols-[1fr_auto] gap-x-6 text-sm">
                                    <span className="text-gray-600">
                                        Technology
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {resin.technology}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-x-6 text-sm">
                                    <span className="text-gray-600">
                                        UV Wavelength
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        405 nm
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-x-6 text-sm">
                                    <span className="text-gray-600">
                                        Resolution Optimization
                                    </span>
                                    <span className="font-medium text-gray-900 text-right max-w-[260px]">
                                        {resin.resolution?.join(", ")}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-x-6 text-sm">
                                    <span className="text-gray-600">
                                        Shore Hardness
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {
                                            resin.attributes?.find(
                                                (attr: any) =>
                                                    attr.label ===
                                                    "Shore Hardness",
                                            )?.value
                                        }
                                    </span>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-x-6 text-sm">
                                    <span className="text-gray-600">
                                        Heat Deflection Temp
                                    </span>

                                    <span className="font-medium text-gray-900 whitespace-nowrap">
                                        {temperature && `${temperature}°C`}
                                        {temperature && pressure && " @ "}
                                        {pressure && `${pressure} MPa`}
                                    </span>
                                </div>
                                {resin.attributes?.map((attr: any) => {
                                    if (
                                        attr.label === "Temperature" ||
                                        attr.label === "Pressure" ||
                                        attr.label === "Heat Deflection Temp"
                                    ) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={attr.label}
                                            className="grid grid-cols-[1fr_auto] gap-x-6 text-sm"
                                        >
                                            <span className="text-gray-600">
                                                {attr.label}
                                            </span>
                                            <span className="font-medium text-gray-900 text-right max-w-[260px]">
                                                {attr.value}
                                            </span>
                                        </div>
                                    );
                                })}
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
                            "description",
                            "specifications",
                            "compatibility",

                            "safety & Handling",
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
                    {activeTab === "description" && (
                        <DescriptionTab
                            features={resin.features}
                            applications={resin.applications}
                            description={resin.description}
                        />
                    )}
                    {activeTab === "specifications" && (
                        <SpecificationsTab specifications={groupedSpecs} />
                    )}
                    {activeTab === "compatibility" && (
                        <CompatibilityTab
                            compatibility={resin.compatibilities}
                            technology={resin.technology}
                        />
                    )}

                    {activeTab === "safety & Handling" && (
                        <SafetyTab downloads={resin.downloads} />
                    )}
                </div>
            </div>
            <div className="mt-12">
                <SimilarResinsCarousel
                    currentResinId={resin.id}
                    technology={resin.technology}
                />
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

function DescriptionTab({ description, features, applications }) {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Description
                </h3>
                <span className="text-sm text-gray-700">{description}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-2">
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

function CompatibilityTab({ compatibility, technology }) {
    console.log("compatibility:", compatibility);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Compatible Printers
                </h3>
                <span className="text-sm text-gray-700">
                    This resin is compatible with most{" "}
                    <span className="font-medium text-gray-900">
                        {technology}
                    </span>{" "}
                    3D printers using{" "}
                    <span className="font-medium text-gray-900">405 nm</span> UV
                    wavelength.
                </span>

                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-2">
                    Key Features
                </h3>
                {/* Compatibility list box */}
                <div className="border border-[#E5E7EB] rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                        {compatibility?.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-2 text-sm text-gray-700"
                            >
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span>{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Info note */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">Note:</span> Always verify
                        compatibility with your specific printer model and check
                        manufacturer recommendations for optimal print settings.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SafetyTab({ downloads }) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-[#FFF085] bg-[#FEFCE8] p-4">
                <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.8A2 2 0 004.6 20h14.8a2 2 0 001.71-3.34l-7.4-12.8a2 2 0 00-3.42 0z"
                            stroke="#A65F00"
                            strokeWidth={1.6667}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    <h4 className="text-sm font-medium text-[#733E0A]">
                        Safety Warnings
                    </h4>
                </div>

                <ul className="list-disc pl-5 space-y-1 text-sm text-[#894B00]">
                    <li>May cause skin irritation and allergic reactions</li>
                    <li>Harmful if swallowed or inhaled</li>
                    <li>Keep out of reach of children and pets</li>
                    <li>Do not expose to direct sunlight before use</li>
                    <li>Use only in well-ventilated areas</li>
                </ul>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Storage Instructions
                </h3>
                <p className="text-gray-700">
                    Store in a cool, dry place away from direct sunlight. Keep
                    bottle tightly sealed when not in use. Ideal storage
                    temperature: 15–35°C.
                </p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Handling Guidelines
                </h3>
                <p className="text-gray-700">
                    Always wear nitrile gloves and safety glasses when handling
                    uncured resin. Work in a well-ventilated area. Avoid skin
                    contact and inhalation.
                </p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Disposal Instructions
                </h3>
                <p className="text-gray-700">
                    Do not pour uncured resin down the drain. Cure all waste
                    resin under UV light before disposal. Follow local
                    regulations for chemical waste disposal.
                </p>
            </div>
            {downloads && downloads.length > 0 ? (
                <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Safety Downloads
                    </h3>

                    {downloads.map((download) => (
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
                    ))}
                </>
            ) : (
                <div className="text-center py-8">
                    <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">
                        No downloads available for this resin.
                    </p>
                </div>
            )}
        </div>
    );
}

function ResinDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 animate-pulse">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column - Images */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div className="bg-white border rounded-lg p-4 mb-4">
                            <div className="w-full aspect-square bg-gray-200 rounded-lg"></div>
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="bg-white border rounded-lg p-6">
                        {/* Brand */}
                        <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>

                        {/* Title */}
                        <div className="h-8 w-3/4 bg-gray-200 rounded mb-3"></div>

                        {/* Description */}
                        <div className="space-y-2 mb-6">
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2 mb-6">
                            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                            <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
                        </div>

                        {/* Color selector */}
                        <div className="mb-6">
                            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 bg-gray-200 rounded-full"
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Pack Size selector */}
                        <div className="mb-6">
                            <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-10 w-20 bg-gray-200 rounded-lg"
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3 mb-1">
                                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                <div className="h-5 w-16 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-10 w-36 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>

                        <hr className="mb-4" />

                        {/* Compatibility line */}
                        <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>

                        {/* Quantity */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gray-200 rounded"></div>
                            <div className="w-16 h-10 bg-gray-200 rounded"></div>
                            <div className="w-10 h-10 bg-gray-200 rounded"></div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="space-y-3 mb-6">
                            <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                            <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                        </div>

                        {/* Quick Specifications */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between"
                                    >
                                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 mt-8">
                <div className="border-b border-gray-200">
                    <div className="flex gap-4 px-4 py-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-5 w-24 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="h-5 w-40 bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Similar Resins Skeleton */}
            <div className="mt-12 px-6">
                <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-64 flex-shrink-0">
                            <div className="bg-white border rounded-lg p-4">
                                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
