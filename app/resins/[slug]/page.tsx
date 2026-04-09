"use client";

import { ArrowLeft, Bell, Check, Download, Heart, X } from "lucide-react";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import SimilarResinsCarousel from "@/components/resins/SimilarResinsCarousel";
import { toast } from "@/components/ui/use-toast";
import { getPdpImageUrl, getThumbnailUrl } from "@/lib/cloudinary-url";
import { useCart } from "@/providers/CartProvider";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

/* ── Notify Me Modal ── */
function NotifyMeModal({
    resin,
    variantId,
    variantLabel,
    onClose,
}: {
    resin: any;
    variantId?: string;
    variantLabel?: string;
    onClose: () => void;
}) {
    const { data: session } = useSession();
    const [name, setName] = useState("");
    const [email, setEmail] = useState((session?.user?.email as string) ?? "");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !phone.trim()) {
            toast({
                title: "Email and phone are required",
                variant: "destructive",
            });
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/stock-notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: resin.id,
                    productName: resin.name,
                    productType: "resin",
                    variantId: variantId ?? null,
                    variantLabel: variantLabel ?? null,
                    email: email.trim(),
                    phone: phone.trim(),
                    name: name.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast({
                    title: data.error || "Something went wrong",
                    variant: "destructive",
                });
                return;
            }
            setDone(true);
        } catch {
            toast({ title: "Request failed", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                            <Bell size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                Notify Me When Back
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                {resin.name}
                                {variantLabel ? ` — ${variantLabel}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black mt-0.5"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5">
                    {done ? (
                        <div className="flex flex-col items-center py-6 text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                <Check size={22} className="text-green-600" />
                            </div>
                            <p className="text-base font-bold text-gray-900">
                                You're on the list!
                            </p>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We'll notify you on{" "}
                                <span className="font-semibold text-gray-700">
                                    {email}
                                </span>{" "}
                                and{" "}
                                <span className="font-semibold text-gray-700">
                                    {phone}
                                </span>{" "}
                                as soon as this item is back in stock.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition"
                            >
                                Got it
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3.5">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {variantLabel
                                    ? `${variantLabel} is currently out of stock. Leave your details and we'll notify you the moment it's available.`
                                    : "This resin is currently out of stock. Leave your details and we'll let you know the moment it's available."}
                            </p>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Name{" "}
                                    <span className="text-gray-400 normal-case font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Email{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Phone Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    maxLength={15}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Bell size={14} /> Notify Me
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Main PDP ── */
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
    const [quantity, setQuantity] = useState(1);
    const [isCartLoading, setIsCartLoading] = useState(false);
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

    const [current, setCurrent] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isTouching, setIsTouching] = useState(false);
    const touchStartX = useRef<number | null>(null);

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
    const totalImages = images?.length || 0;

    const next = () => setCurrent((c) => (c + 1) % totalImages);
    const prev = () => setCurrent((c) => (c === 0 ? totalImages - 1 : c - 1));

    const onTouchStart = (e: React.TouchEvent) => {
        setIsTouching(true);
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) next();
        else if (diff < -50) prev();
        touchStartX.current = null;
        setIsTouching(false);
    };

    /* ── OOS detection (three levels) ── */
    const isProductOOS = resin?.inStock === false;
    const isColourOOS = !isProductOOS && colour?.inStock === false;
    const isWeightOOS =
        !isProductOOS && !isColourOOS && weight?.inStock === false;
    const isAnyOOS = isProductOOS || isColourOOS || isWeightOOS;

    const notifyVariantId = isProductOOS
        ? undefined
        : isColourOOS
          ? colour?.id
          : weight?.id;
    const notifyVariantLabel = isProductOOS
        ? undefined
        : isColourOOS
          ? colour?.name
          : weight
            ? `${weight.weightInGrams}g`
            : undefined;

    const groupedSpecs = resin?.specifications.reduce((acc, spec) => {
        if (!acc[spec.category]) acc[spec.category] = [];
        acc[spec.category].push(spec);
        return acc;
    }, {});

    const maxResolution = resin?.resolution
        ?.map((r: string) => parseInt(r))
        ?.sort((a, b) => b - a)[0];

    const temperature = resin?.attributes?.find(
        (attr: any) => attr.label === "Temperature",
    )?.value;
    const pressure = resin?.attributes?.find(
        (attr: any) => attr.label === "Pressure",
    )?.value;
    const selectedColourId = resin?.colours?.[selectedColourIndex]?.id ?? null;
    const selectedWeightId = resin?.weights?.[selectedWeightIndex]?.id ?? null;

    const handleAddToCart = async () => {
        if (!resin || isCartLoading || isAnyOOS) return;

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
        setIsFavorite(!wasInWishlist);

        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resinId: resin.id }),
            });
            toast({
                title: wasInWishlist
                    ? "Removed from wishlist"
                    : "Added to wishlist",
                description: `${resin.name} has been ${wasInWishlist ? "removed from" : "added to"} your wishlist.`,
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

    useEffect(() => {
        if (!totalImages || totalImages <= 1) return;
        if (isHovering || isTouching) return;
        const interval = setInterval(
            () => setCurrent((prev) => (prev === totalImages - 1 ? 0 : prev + 1)),
            3000,
        );
        return () => clearInterval(interval);
    }, [totalImages, isHovering, isTouching]);

    if (loading) return <ResinDetailSkeleton />;

    if (!resin && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Resin not found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The resin you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    if (!resin) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Header — sticky on mobile, static on desktop */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40 sm:static">
                <div className="container mx-auto px-4 py-3.5 sm:py-5">
                    <Link
                        href="/resins"
                        className="inline-flex items-center text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Back to all resins
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
                    {/* Left Column - Images */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div
                            className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 mb-2 sm:mb-4"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        >
                            <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden">
                                {images && images.length > 0 ? (
                                    <>
                                        <div
                                            className="flex h-full transition-transform duration-500 ease-in-out"
                                            style={{
                                                transform: `translateX(-${current * 100}%)`,
                                            }}
                                        >
                                            {images.map((img) => (
                                                <div
                                                    key={img.id}
                                                    className="relative min-w-full h-full"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={getPdpImageUrl(
                                                            img.url,
                                                        )}
                                                        alt={
                                                            img.altText ||
                                                            resin.name
                                                        }
                                                        className="w-full h-full object-contain"
                                                        loading="eager"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Nav buttons — always visible on mobile, hover on desktop */}
                                        {totalImages > 1 && (
                                            <>
                                                <button
                                                    onClick={prev}
                                                    aria-label="Previous image"
                                                    className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/80 sm:bg-white rounded-full flex items-center justify-center shadow transition-all ${isHovering ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
                                                >
                                                    <span className="text-black text-sm sm:text-base">
                                                        <ArrowLefti />
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={next}
                                                    aria-label="Next image"
                                                    className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/80 sm:bg-white rounded-full flex items-center justify-center shadow transition-all ${isHovering ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
                                                >
                                                    <span className="text-black text-sm sm:text-base">
                                                        <ArrowRight />
                                                    </span>
                                                </button>
                                            </>
                                        )}

                                        {/* OOS badge on image — only for whole product */}
                                        {isProductOOS && (
                                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full z-10">
                                                Out of Stock
                                            </div>
                                        )}
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
                            {images?.map((img, idx) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition flex-shrink-0 ${
                                        current === idx
                                            ? "border-blue-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={getThumbnailUrl(img.url)}
                                        alt={img.altText || `View ${idx + 1}`}
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
                                {resin.brand}
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
                                {resin.name}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 break-words">
                                {resin.shortDescription}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-semibold rounded-full">
                                    {resin.technology}
                                </span>
                                {maxResolution && (
                                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-800 text-[10px] sm:text-xs font-semibold rounded-full">
                                        {maxResolution}K Resolution Ready
                                    </span>
                                )}
                            </div>

                            {/* Colour selector */}
                            <div className="mb-4 sm:mb-6">
                                <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
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
                                    {isColourOOS && (
                                        <span className="ml-2 text-[10px] sm:text-xs font-semibold text-red-500 bg-red-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                                            Out of Stock
                                        </span>
                                    )}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {resin.colours.map(
                                        (c: any, idx: number) => {
                                            const thisColourOOS =
                                                isProductOOS ||
                                                c.inStock === false;
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSelectedColourIndex(
                                                            idx,
                                                        );
                                                        setSelectedWeightIndex(
                                                            0,
                                                        );
                                                        setCurrent(0);
                                                    }}
                                                    disabled={isProductOOS}
                                                    title={
                                                        thisColourOOS
                                                            ? `${c.name} — Out of Stock`
                                                            : c.name
                                                    }
                                                    className={`relative w-8 h-8 rounded-full border-2 transition-all ring-offset-1 ${
                                                        idx ===
                                                        selectedColourIndex
                                                            ? "border-blue-600 ring-2 ring-blue-400"
                                                            : "border-gray-300 hover:border-gray-500"
                                                    } ${thisColourOOS ? "opacity-40" : ""}`}
                                                    style={{
                                                        backgroundColor:
                                                            c.hexCode || "#ccc",
                                                    }}
                                                >
                                                    {thisColourOOS && (
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <span className="block w-[110%] h-[2px] bg-red-500 rotate-45 rounded" />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                                {isColourOOS && (
                                    <p className="mt-1.5 text-[10px] sm:text-xs text-gray-500">
                                        This colour is out of stock. Select
                                        another colour or get notified below.
                                    </p>
                                )}
                            </div>

                            {/* Weight selector */}
                            <div className="mb-4 sm:mb-6">
                                <p className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                                    Pack Size
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {resin.weights.map(
                                        (w: any, idx: number) => {
                                            const thisWeightDisabled =
                                                isProductOOS ||
                                                isColourOOS ||
                                                w.inStock === false;
                                            const isSelected =
                                                idx === selectedWeightIndex;
                                            return (
                                                <button
                                                    key={w.id}
                                                    onClick={() =>
                                                        !thisWeightDisabled &&
                                                        setSelectedWeightIndex(
                                                            idx,
                                                        )
                                                    }
                                                    disabled={
                                                        thisWeightDisabled
                                                    }
                                                    title={
                                                        w.inStock === false
                                                            ? `${w.weightInGrams / 1000}kg — Out of Stock`
                                                            : undefined
                                                    }
                                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm transition-all relative ${
                                                        thisWeightDisabled
                                                            ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                                                            : isSelected
                                                              ? "border-blue-600 text-blue-600"
                                                              : "border-gray-300 hover:border-gray-500"
                                                    }`}
                                                >
                                                    {w.weightInGrams / 1000} kg
                                                    {w.inStock === false &&
                                                        !isProductOOS &&
                                                        !isColourOOS && (
                                                            <span className="ml-1 text-[10px] text-red-400"></span>
                                                        )}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                                {isWeightOOS && (
                                    <p className="mt-1.5 text-[10px] sm:text-xs text-gray-500">
                                        This pack size is out of stock. Select
                                        another size or get notified below.
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-4 sm:mb-6">
                                <div className="flex items-baseline gap-2 sm:gap-3">
                                    {weight?.originalPrice && (
                                        <>
                                            <span className="text-sm sm:text-lg text-gray-400 line-through">
                                                ₹
                                                {weight.originalPrice.toLocaleString(
                                                    "en-IN",
                                                )}
                                            </span>
                                            <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded">
                                                {weight.discount}% off
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-2xl sm:text-4xl font-bold text-gray-900 mt-1">
                                    ₹
                                    {weight?.price?.toLocaleString("en-IN")}
                                </p>
                                {weight?.originalPrice && (
                                    <p className="text-sm text-green-600 font-medium mt-1">
                                        Save ₹
                                        {(
                                            weight.originalPrice - weight.price
                                        ).toLocaleString("en-IN")}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    MRP inclusive of all taxes. Shipping
                                    calculated at checkout.
                                </p>
                            </div>

                            <hr className="mb-4" />

                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-600">
                                    Compatible with most{" "}
                                    <span className="font-medium text-gray-600">
                                        {resin.technology}
                                    </span>{" "}
                                    printers
                                </span>
                            </div>

                            {/* Quantity — hidden when any OOS */}
                            {!isAnyOOS && (
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
                                {/* Add to Cart — hidden when any OOS */}
                                {!isAnyOOS && (
                                    <button
                                        className="relative w-full py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                                )}

                                {/* Notify Me — shown when any OOS */}
                                {isAnyOOS && (
                                    <button
                                        onClick={() => setShowNotifyModal(true)}
                                        className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2 border-blue-200 text-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Bell size={16} />
                                        Notify Me When Back in Stock
                                        {(isColourOOS || isWeightOOS) &&
                                            notifyVariantLabel && (
                                                <span className="text-xs font-normal opacity-75">
                                                    ({notifyVariantLabel})
                                                </span>
                                            )}
                                    </button>
                                )}

                                {/* Contact Sales — hidden when any OOS */}
                                {!isAnyOOS && (
                                    <button
                                        className="w-full py-2.5 sm:py-3 bg-white text-sm sm:text-base text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            const message = `Hi, I'd like to request a custom quote for ${resin.name} based on my requirements.`;
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

                            {/* Quick Specifications */}
                            <div className="border-t border-gray-200 pt-4 sm:pt-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                                    Quick Specifications
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        {
                                            label: "Technology",
                                            value: resin.technology,
                                        },
                                        {
                                            label: "UV Wavelength",
                                            value: "405 nm",
                                        },
                                        {
                                            label: "Resolution Optimization",
                                            value: resin.resolution?.join(
                                                ", ",
                                            ),
                                        },
                                        {
                                            label: "Shore Hardness",
                                            value: resin.attributes?.find(
                                                (attr: any) =>
                                                    attr.label ===
                                                    "Shore Hardness",
                                            )?.value,
                                        },
                                        {
                                            label: "Heat Deflection Temp",
                                            value:
                                                temperature || pressure
                                                    ? `${temperature ? `${temperature}°C` : ""}${temperature && pressure ? " @ " : ""}${pressure ? `${pressure} MPa` : ""}`
                                                    : undefined,
                                        },
                                        ...(resin.attributes
                                            ?.filter(
                                                (attr: any) =>
                                                    ![
                                                        "Temperature",
                                                        "Pressure",
                                                        "Heat Deflection Temp",
                                                        "Shore Hardness",
                                                    ].includes(attr.label),
                                            )
                                            .map((attr: any) => ({
                                                label: attr.label,
                                                value: attr.value,
                                            })) ?? []),
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
                                "description",
                                "specifications",
                                "compatibility",
                                "safety & Handling",
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

                {/* Similar Resins */}
                <div className="mt-6 sm:mt-12">
                    <SimilarResinsCarousel
                        currentResinId={resin.id}
                        technology={resin.technology}
                    />
                </div>
            </div>

            {/* Notify Me Modal */}
            {showNotifyModal && (
                <NotifyMeModal
                    resin={resin}
                    variantId={notifyVariantId}
                    variantLabel={notifyVariantLabel}
                    onClose={() => setShowNotifyModal(false)}
                />
            )}
        </div>
    );
}

/* ── Tab Components ── */

type Specification = { id: string; label: string; value: string };
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
                                className="flex justify-between gap-4 py-2 border-b border-gray-100"
                            >
                                <span className="text-sm text-gray-600 shrink-0 w-[35%] sm:max-w-[45%]">
                                    {spec.label}
                                </span>
                                <span className="text-sm font-medium text-gray-900 text-left sm:text-right flex-1 break-words">
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
                    <span className="font-medium text-gray-900">405 nm</span>{" "}
                    UV wavelength.
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-2">
                    Key Features
                </h3>
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
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mt-4">
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">Note:</span> Always
                        verify compatibility with your specific printer model
                        and check manufacturer recommendations for optimal
                        print settings.
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
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
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
                                <div className="h-3 sm:h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 bg-gray-200 rounded-full"
                                        ></div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <div className="h-3 sm:h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                <div className="flex gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-8 sm:h-10 w-16 sm:w-20 bg-gray-200 rounded-lg"
                                        ></div>
                                    ))}
                                </div>
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