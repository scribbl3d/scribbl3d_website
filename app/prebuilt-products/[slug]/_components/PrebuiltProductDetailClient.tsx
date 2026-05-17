"use client";

import WishlistModal from "@/app/profile/_components/wishlist-modal";
import { WishlistGridItem } from "@/app/profile/_components/wishlist.types";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import {
    Bell,
    Check,
    ChevronLeft,
    ChevronRight,
    Heart,
    Minus,
    Plus,
    ShoppingCart,
    Star,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function Shimmer({ className = "" }: { className?: string }) {
    return (
        <div
            className={`relative overflow-hidden rounded-lg ${className}`}
            style={{
                background:
                    "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
            }}
        />
    );
}

function PDPSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                <div className="flex flex-col gap-4">
                    <Shimmer className="w-full aspect-square rounded-2xl" />
                    <div className="flex gap-2.5 justify-center">
                        {[...Array(4)].map((_, i) => (
                            <Shimmer
                                key={i}
                                className="w-[72px] h-[72px] rounded-xl"
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-5">
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="h-10 w-3/4" />
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-2/3" />
                    <div className="pt-4 flex flex-col gap-3">
                        <Shimmer className="h-4 w-16" />
                        <Shimmer className="h-6 w-48" />
                        <Shimmer className="h-12 w-40" />
                        <Shimmer className="h-4 w-32" />
                    </div>
                    <Shimmer className="h-44 w-full rounded-2xl" />
                    <Shimmer className="h-14 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

function ShieldCheckIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2L3 6.5V12c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6.5L12 2z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}
function TruckIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    );
}


/* ── buildWishlistItem helper ── */
function buildWishlistItem(product: any): WishlistGridItem {
    const variants = product.variants?.filter((v: any) => v.isActive) ?? [];
    const cheapest = variants.reduce(
        (min: any, v: any) => (!min || v.price < min.price ? v : min),
        null,
    );
    return {
        id: product.id,
        itemType: "prebuilt",
        title: product.name,
        image:
            product.images?.find((i: any) => i.isMain)?.url ??
            product.images?.[0]?.url ??
            null,
        badge: product.category ?? null,
        price: cheapest?.price ?? 0,
        originalPrice: cheapest?.originalPrice ?? null,
        requiresOptions: variants.length > 0,
        slug: product.slug ?? null,
        inStock: product.inStock !== false,
        availableVariants: variants.map((v: any) => ({
            id: v.id,
            colorName: v.colorName ?? null,
            colorHex: v.colorHex ?? null,
            sizeName: v.sizeName ?? null,
            price: v.price,
            originalPrice: v.originalPrice ?? 0,
            isActive: v.isActive,
            inStock: v.inStock ?? true,
        })),
        cartPayload: { prebuiltProductId: product.id },
    };
}

/* ── Similar Product Card ── */
function SimilarProductCard({ product }: { product: any }) {
    const { data: session } = useSession();
    const router = useRouter();
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [activeItem, setActiveItem] = useState<WishlistGridItem | null>(null);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    useEffect(() => {
        if (!session || !product?.id) return;
        fetch(`/api/wishlist/check?prebuiltProductId=${product.id}`)
            .then((r) => r.json())
            .then((d) => setIsFavorite(d.isInWishlist))
            .catch(() => {});
    }, [session, product?.id]);

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
        const was = isFavorite;
        setIsFavorite(!was);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prebuiltProductId: product.id }),
            });
        } catch {
            setIsFavorite(was);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const discount = variant?.originalPrice
        ? Math.round(
              ((variant.originalPrice - variant.price) /
                  variant.originalPrice) *
                  100,
          )
        : 0;
    const sizes = Array.from(
        new Set(product.variants?.map((v: any) => v.sizeName).filter(Boolean)),
    );
    const uniqueColors: { name: string; hex: string }[] = Array.from(
        new Map(
            product.variants
                ?.filter((v: any) => v.colorHex)
                .map((v: any) => [
                    v.colorHex,
                    { name: v.colorName, hex: v.colorHex },
                ]),
        ).values() as IterableIterator<{ name: string; hex: string }>,
    );
    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    const isOutOfStock = product.inStock === false;

    return (
        <>
            <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                <div
                    onClick={() =>
                        product.slug &&
                        router.push(`/prebuilt-products/${product.slug}`)
                    }
                    className="flex flex-col h-full cursor-pointer"
                >
                    {/* IMAGE — square on all sizes */}
                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                        {mainImage ? (
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                                No image
                            </div>
                        )}
                        {/* Trending Now badge on image */}
                        {product.highlighted && (
                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
                                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg">
                                    <svg
                                        className="w-2 h-2 sm:w-2.5 sm:h-2.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Trending Now
                                </div>
                            </div>
                        )}
                        {isOutOfStock && (
                            <div className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full z-10">
                                Out of Stock
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(e);
                            }}
                            disabled={isWishlistLoading}
                            className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center"
                        >
                            {isWishlistLoading ? (
                                <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-3 h-3 sm:w-5 sm:h-5 transition ${
                                        isFavorite
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-400"
                                    }`}
                                />
                            )}
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="px-2.5 pt-2 pb-0 sm:px-5 sm:pt-4 sm:pb-0">
                        {/* Name */}
                        <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                            {product.name}
                        </h3>

                        {/* Colour swatches */}
                        {uniqueColors.length > 0 && (
                            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
                                {uniqueColors.map((c, i) => (
                                    <span
                                        key={i}
                                        title={c.name}
                                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: c.hex }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Description — hidden on mobile */}
                        {product.shortDescription && (
                            <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                                {product.shortDescription}
                            </p>
                        )}

                        {/* Sizes — hidden on mobile */}
                        <div className="hidden sm:block text-[13px] text-gray-700 mt-1.5">
                            <div>
                                <strong>Sizes:</strong> {sizeString}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                    <hr className="hidden sm:block my-3" />

                    <div className="flex items-center gap-2 mt-1 mb-2 sm:mb-3 flex-wrap">
                        <span className="text-sm sm:text-base font-semibold text-[#1a1a1a]">
                            ₹{variant?.price?.toLocaleString()}
                        </span>
                        {discount > 0 && (
                            <>
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                    ₹{variant?.originalPrice?.toLocaleString()}
                                </span>
                                <span className="rounded-full bg-[#e8f5e9] px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-[#2e7d32]">
                                    {discount}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {!isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveItem(buildWishlistItem(product));
                            }}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                        >
                            Select Variants
                        </button>
                    )}

                    {isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowNotifyModal(true);
                            }}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center gap-1.5 border-2 border-blue-200 text-blue-500 hover:text-blue-700"
                        >
                            <Bell size={12} className="sm:w-[14px] sm:h-[14px]" />
                            Notify Me
                        </button>
                    )}
                </div>
            </div>

            {activeItem && (
                <WishlistModal
                    item={activeItem}
                    onClose={() => setActiveItem(null)}
                />
            )}
            {showNotifyModal && product && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={product.id}
                    productName={product.name}
                    productType="prebuilt"
                />
            )}
        </>
    );
}

/* ── Similar Products Carousel ── */
function SimilarProductsCarousel({
    products,
    category,
}: {
    products: any[];
    category: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isHoveringRef = useRef(false);
    const doubled = [...products, ...products];

    const startAutoScroll = useCallback(() => {
        if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        if (products.length <= 1) return;
        autoScrollRef.current = setInterval(() => {
            if (isHoveringRef.current) return;
            const container = scrollRef.current;
            if (!container) return;
            const cardWidth =
                (container.firstElementChild as HTMLElement)?.offsetWidth +
                    20 || 300;
            container.scrollBy({ left: cardWidth, behavior: "smooth" });
            setTimeout(() => {
                if (!container) return;
                if (container.scrollLeft >= container.scrollWidth / 2)
                    container.scrollTo({ left: 0, behavior: "auto" });
            }, 600);
        }, 3000);
    }, [products.length]);

    useEffect(() => {
        startAutoScroll();
        return () => {
            if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        };
    }, [startAutoScroll]);

    const scrollBy = (dir: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth =
            (container.firstElementChild as HTMLElement)?.offsetWidth + 20 ||
            300;
        container.scrollBy({
            left: dir === "right" ? cardWidth : -cardWidth,
            behavior: "smooth",
        });
    };

    if (products.length === 0) return null;

    return (
        <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Similar Products
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        More from {category}
                    </p>
                </div>
            </div>
            <div className="relative">
                <button
                    onClick={() => scrollBy("left")}
                    className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                >
                    <ChevronLeft size={18} />
                </button>
                <button
                    onClick={() => scrollBy("right")}
                    className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                >
                    <ChevronRight size={18} />
                </button>
                <div
                    ref={scrollRef}
                    onMouseEnter={() => {
                        isHoveringRef.current = true;
                    }}
                    onMouseLeave={() => {
                        isHoveringRef.current = false;
                    }}
                    className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <style>{`div::-webkit-scrollbar{display:none}`}</style>
                    {doubled.map((p: any, index: number) => (
                        <div
                            key={`${p.id}-${index}`}
                            className="snap-start flex-shrink-0 w-[45%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
                        >
                            <SimilarProductCard product={p} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Main PDP ── */
export default function PrebuiltProductDetailClient({ product }: { product: any }) {
    const router = useRouter();
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const slug = product.slug as string;

    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"specifications" | "features" | "support" | "care">("specifications");

    // ── Customization state ──
    const [customizationChoice, setCustomizationChoice] = useState<"yes" | "no" | null>(null);
    const [customizationText, setCustomizationText] = useState("");

    useEffect(() => {
        if (product.variants?.length > 0) {
            const first =
                product.variants.find((v: any) => v.isActive) ||
                product.variants[0];
            setSelectedColor(first.colorName || "");
            setSelectedSize(first.sizeName || "");
        }
    }, [product]);

    useEffect(() => {
        if (!product?.category) return;
        async function fetchSimilar() {
            try {
                const res = await fetch(
                    `/api/prebuilt-products?category=${encodeURIComponent(product.category)}&limit=8`,
                );
                if (!res.ok) return;
                const data = await res.json();
                const all = data.products || data;
                setSimilarProducts(
                    all
                        .filter(
                            (p: any) => p.id !== product.id && p.slug !== slug,
                        )
                        .slice(0, 8),
                );
            } catch {
                /* silently fail */
            }
        }
        fetchSimilar();
    }, [product?.category, product?.id, slug]);

    useEffect(() => {
        if (!session || !product?.id) return;
        fetch(`/api/wishlist/check?prebuiltProductId=${product.id}`)
            .then((r) => r.json())
            .then((d) => setIsFavorite(d.isInWishlist))
            .catch(() => {});
    }, [session, product?.id]);

    const images: any[] = (() => {
        if (!product) return [];
        const byColor =
            product.images?.filter(
                (img: any) => !img.colorName || img.colorName === selectedColor,
            ) || [];
        return byColor.length > 0 ? byColor : product.images || [];
    })();
    const totalSlides = images.length;

    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (totalSlides > 1)
            autoPlayRef.current = setInterval(
                () => setCurrentSlide((c) => (c + 1) % totalSlides),
                3000,
            );
    }, [totalSlides]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [startAutoPlay]);

    const prev = () =>
        setCurrentSlide((c) => (c - 1 + totalSlides) % totalSlides);
    const next = () => setCurrentSlide((c) => (c + 1) % totalSlides);
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const d = touchStartX.current - touchEndX.current;
        if (Math.abs(d) > 50) d > 0 ? next() : prev();
    };
    useEffect(() => {
        setCurrentSlide(0);
    }, [selectedColor]);

    const uniqueColors: string[] = Array.from(
        new Set(
            product?.variants
                ?.filter((v: any) => v.isActive && v.colorName)
                .map((v: any) => v.colorName),
        ),
    );
    const uniqueSizes: string[] = Array.from(
        new Set(
            product?.variants
                ?.filter((v: any) => v.isActive && v.sizeName)
                .map((v: any) => v.sizeName),
        ),
    );

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const sizeValid = product?.variants?.some(
            (v: any) =>
                v.colorName === color &&
                v.sizeName === selectedSize &&
                v.isActive,
        );
        if (!sizeValid)
            setSelectedSize(
                product?.variants?.find(
                    (v: any) => v.colorName === color && v.isActive,
                )?.sizeName || "",
            );
    };
    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
        const colorValid = product?.variants?.some(
            (v: any) =>
                v.sizeName === size &&
                v.colorName === selectedColor &&
                v.isActive,
        );
        if (!colorValid)
            setSelectedColor(
                product?.variants?.find(
                    (v: any) => v.sizeName === size && v.isActive,
                )?.colorName || "",
            );
    };

    const selectedVariant =
        product?.variants?.find(
            (v: any) =>
                v.colorName === selectedColor &&
                v.sizeName === selectedSize &&
                v.isActive,
        ) ||
        product?.variants?.find(
            (v: any) => v.colorName === selectedColor && v.isActive,
        ) ||
        product?.variants?.find((v: any) => v.isActive);

    const displayPrice = selectedVariant?.price || 0;
    const originalPrice = selectedVariant?.originalPrice || 0;
    const discount =
        originalPrice > displayPrice && originalPrice > 0
            ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
            : 0;
    const avgRating =
        product?.reviews?.length > 0
            ? (
                  product.reviews.reduce(
                      (s: number, r: any) => s + r.rating,
                      0,
                  ) / product.reviews.length
              ).toFixed(1)
            : "0";

    const handleToggleWishlist = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        if (!session) {
            toast({
                title: "Authentication required",
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
        const was = isFavorite;
        setIsFavorite(!was);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prebuiltProductId: product.id }),
            });
            toast({
                title: was ? "Removed from wishlist" : "Added to wishlist",
            });
        } catch {
            setIsFavorite(was);
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!session) {
            toast({
                title: "Authentication required",
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
        if (!selectedVariant) {
            toast({
                title: "Please select a variant",
                description: "Choose a colour and size before adding to cart.",
                variant: "destructive",
            });
            return;
        }
        if (!selectedVariant.isActive) {
            toast({
                title: "Variant unavailable",
                description:
                    "This colour/size combination is currently out of stock.",
                variant: "destructive",
            });
            return;
        }
        setIsAddingToCart(true);
        try {
            await addToCart({
                prebuiltProductId: product.id,
                prebuiltVariantId: selectedVariant.id,
                quantity,
            });
            const lbl = [selectedColor, selectedSize]
                .filter(Boolean)
                .join(", ");
            toast({
                title: "Added to cart",
                description: `${product.name}${lbl ? ` (${lbl})` : ""} × ${quantity} added.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to add to cart",
                variant: "destructive",
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    // ── Get Quote via WhatsApp ──
    const handleGetQuote = () => {
        if (!customizationText.trim()) {
            toast({
                title: "Please describe your customization",
                variant: "destructive",
            });
            return;
        }
        const productUrl =
            typeof window !== "undefined"
                ? window.location.href
                : `https://scribbl3d.com/prebuilt-products/${slug}`;
        const colorLine = selectedColor
            ? `Preferred Color: ${selectedColor}`
            : "";
        const sizeLine = selectedSize ? `Preferred Size : ${selectedSize}` : "";

        const message = [
            `Hi! I'm interested in customizing one of your products and would like to request a quote.`,
            ``,
            `Here are my details:`,
            `Product: ${product.name}`,
            `Product Link: ${productUrl}`,
            `Customization Required:`,
            customizationText.trim(),
            sizeLine,
            colorLine,
            ``,
            `Please let me know:`,
            `• Whether this customization is possible`,
            `• The estimated price`,
            `• The expected production time`,
            ``,
            `Looking forward to hear from you. Thank you!`,
        ]
            .filter((line) => line !== undefined && !(line === "" && false))
            .filter((_, i, arr) => !(arr[i] === "" && arr[i - 1] === ""))
            .join("\n");

        const phone = "919599523434";
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
    };

    const tabs = [
        { key: "specifications", label: "Specifications" },
        { key: "features", label: "Features" },
        { key: "support", label: "Support & Warranty" },
        { key: "care", label: "Care & Precautions" },
    ] as const;

    const isOutOfStock = product.inStock === false;
    const isVariantOutOfStock =
        !isOutOfStock && selectedVariant?.inStock === false;
    const isAnyOutOfStock = isOutOfStock || isVariantOutOfStock;
    const variantLabel = [selectedColor, selectedSize]
        .filter(Boolean)
        .join(", ");

    // CTA is "Get Quote" when customization is chosen as "yes"
    const isGetQuoteMode =
        product.isCustomizable && customizationChoice === "yes";

    return (
        <div className="min-h-screen bg-white pt-20">
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

            {/* Header — sticky on mobile, static on desktop */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40 sm:static">
                <div className="container mx-auto px-4 py-3.5 sm:py-5">
                    <button
                        onClick={() => router.push("/prebuilt-products")}
                        className="inline-flex items-center text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Back to all pre-built products
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
                    {/* LEFT — Images */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div
                            className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 mb-2 sm:mb-4"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                                {images.length > 0 ? (
                                    <>
                                        <div
                                            className="flex h-full transition-transform duration-500 ease-in-out"
                                            style={{
                                                transform: `translateX(-${currentSlide * 100}%)`,
                                            }}
                                        >
                                            {images.map((img: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="relative min-w-full h-full"
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={
                                                            img.altText ||
                                                            product.name
                                                        }
                                                        fill
                                                        className="object-contain"
                                                        priority={idx === 0}
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Nav buttons — always visible on mobile, hover on desktop */}
                                        {totalSlides > 1 && (
                                            <>
                                                <button
                                                    onClick={prev}
                                                    aria-label="Previous image"
                                                    className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/80 sm:bg-white rounded-full flex items-center justify-center shadow transition-all ${isHovering ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>
                                                <button
                                                    onClick={next}
                                                    aria-label="Next image"
                                                    className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/80 sm:bg-white rounded-full flex items-center justify-center shadow transition-all ${isHovering ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </>
                                        )}

                                        {/* Trending Now badge on image */}
                                        {product.highlighted && (
                                            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                                                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    Trending Now
                                                </div>
                                            </div>
                                        )}

                                        {/* OOS badge on image */}
                                        {isOutOfStock && (
                                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full z-10">
                                                Out of Stock
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <p className="text-gray-400">No image available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                            {images?.map((img: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition flex-shrink-0 ${
                                        currentSlide === idx
                                            ? "border-blue-600"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.altText || `View ${idx + 1}`}
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Product Info */}
                    <div className="flex flex-col gap-4 relative">
                        <button
                            onClick={handleToggleWishlist}
                            disabled={isWishlistLoading}
                            className="absolute top-0 right-0 w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-60 z-10"
                        >
                            {isWishlistLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    size={16}
                                    className={
                                        isFavorite
                                            ? "fill-red-500 text-red-500"
                                            : "text-gray-400"
                                    }
                                />
                            )}
                        </button>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                                {product.category}
                            </p>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight pr-10">
                                {product.name}
                            </h1>
                            <p className="mt-1.5 text-gray-500 text-sm leading-relaxed">
                                {product.shortDescription}
                            </p>

                            {product.reviews?.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                className={
                                                    i < 
                                                    Math.round(
                                                        Number(avgRating),
                                                    )
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-200"
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {avgRating}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        ({product.reviews.length} review
                                        {product.reviews.length !== 1
                                            ? "s"
                                            : ""}
                                        )
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-b border-gray-100 py-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price</p>
                            
                            <div className="flex items-end gap-3 mb-2">
                                <div className="flex-1">
                                    <p className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
                                        ₹{displayPrice.toLocaleString("en-IN")}
                                    </p>
                                    {originalPrice > displayPrice && (
                                        <p className="text-sm text-gray-400 line-through mt-1">
                                            ₹{originalPrice.toLocaleString("en-IN")}
                                        </p>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <div className="flex-shrink-0">
                                        <span className="inline-block text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded-lg shadow-sm">
                                            {discount}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>

                            {originalPrice > displayPrice && (
                                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-2">
                                    <p className="text-sm text-green-700 font-semibold">
                                        You save ₹{(originalPrice - displayPrice).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            )}
                            
                            <p className="text-xs text-gray-500 leading-relaxed">
                                MRP inclusive of all taxes. Shipping calculated at checkout.
                            </p>
                        </div>

                        {(uniqueColors.length > 0 ||
                            uniqueSizes.length > 0 ||
                            product.isCustomizable) && (
                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
                                {uniqueColors.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Color:{" "}
                                            <span className="font-normal text-gray-500">
                                                {selectedColor || "Select"}
                                            </span>
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {uniqueColors.map((color) => {
                                                const cv =
                                                    product.variants?.find(
                                                        (v: any) =>
                                                            v.colorName ===
                                                                color &&
                                                            v.colorHex,
                                                    );
                                                const hex =
                                                    cv?.colorHex || "#cccccc";
                                                const isSelected =
                                                    selectedColor === color;
                                                return (
                                                    <button
                                                        key={color}
                                                        onClick={() =>
                                                            handleColorChange(
                                                                color,
                                                            )
                                                        }
                                                        title={color}
                                                        className={`relative w-8 h-8 rounded-full transition-all ring-offset-2 ${isSelected ? "ring-2 ring-gray-900 scale-110" : "ring-1 ring-gray-200 hover:ring-gray-400 hover:scale-105"}`}
                                                        style={{
                                                            backgroundColor:
                                                                hex,
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <Check
                                                                size={12}
                                                                className="absolute inset-0 m-auto text-white drop-shadow"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {uniqueColors.length > 0 &&
                                    uniqueSizes.length > 0 && (
                                        <div className="border-t border-gray-100" />
                                    )}
                                {uniqueSizes.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                            Size
                                        </p>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {uniqueSizes.map((size) => {
                                                const isSelected =
                                                    selectedSize === size;
                                                const available =
                                                    product.variants?.some(
                                                        (v: any) =>
                                                            v.sizeName ===
                                                                size &&
                                                            (!selectedColor ||
                                                                v.colorName ===
                                                                    selectedColor) &&
                                                            v.isActive,
                                                    );
                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() =>
                                                            available &&
                                                            handleSizeChange(
                                                                size,
                                                            )
                                                        }
                                                        disabled={!available}
                                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isSelected ? "border-gray-900 bg-gray-900 text-white" : available ? "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50" : "border-gray-100 text-gray-300 cursor-not-allowed line-through"}`}
                                                    >
                                                        {size}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── Customization section — only shown when product.isCustomizable is true ── */}
                                {product.isCustomizable && (
                                    <>
                                        <div className="border-t border-gray-100" />
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-700">
                                                    Customization
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    Want to add your own
                                                    personal touch?
                                                </p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {(["yes", "no"] as const).map(
                                                    (opt) => {
                                                        const isSelected =
                                                            customizationChoice ===
                                                            opt;
                                                        return (
                                                            <button
                                                                key={opt}
                                                                onClick={() => {
                                                                    setCustomizationChoice(
                                                                        opt,
                                                                    );
                                                                    if (
                                                                        opt ===
                                                                        "no"
                                                                    )
                                                                        setCustomizationText(
                                                                            "",
                                                                        );
                                                                }}
                                                                className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all capitalize ${isSelected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"}`}
                                                            >
                                                                {opt === "yes"
                                                                    ? "Yes"
                                                                    : "No"}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {customizationChoice === "yes" && (
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                        Describe your
                                                        customization
                                                    </label>
                                                    <textarea
                                                        value={
                                                            customizationText
                                                        }
                                                        onChange={(e) =>
                                                            setCustomizationText(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. Engrave 'Happy Birthday' on the top surface, use matte black finish..."
                                                        rows={3}
                                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none transition"
                                                    />
                                                    <p className="text-[11px] text-gray-400 leading-snug">
                                                        Clicking{" "}
                                                        <span className="font-semibold text-gray-600">
                                                            Get Quote
                                                        </span>{" "}
                                                        will open WhatsApp with
                                                        your request pre-filled.
                                                        Our team will reply with
                                                        pricing & timelines.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {!isAnyOutOfStock && !isGetQuoteMode && (
                            <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                    Quantity
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-900 transition bg-white"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <div className="w-12 h-9 rounded-lg border border-gray-200 flex items-center justify-center bg-white">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {quantity}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-900 transition bg-white"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── CTA: Get Quote (customization) OR Add to Cart ── */}
                        {isGetQuoteMode ? (
                            <button
                                onClick={handleGetQuote}
                                disabled={!customizationText.trim()}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {/* WhatsApp icon */}
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Get Quote on WhatsApp
                            </button>
                        ) : (
                            <button
                                onClick={
                                    isAnyOutOfStock
                                        ? undefined
                                        : handleAddToCart
                                }
                                disabled={
                                    isAnyOutOfStock ||
                                    isAddingToCart ||
                                    !selectedVariant
                                }
                                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${isAnyOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black text-white disabled:opacity-50"}`}
                            >
                                {isAnyOutOfStock ? (
                                    "Out of Stock"
                                ) : isAddingToCart ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart size={16} />
                                        {!selectedVariant
                                            ? "Select a Variant"
                                            : "Add to Cart"}
                                    </>
                                )}
                            </button>
                        )}

                        {isAnyOutOfStock && (
                            <button
                                onClick={() => setShowNotifyModal(true)}
                                className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2  border-blue-200 text-blue-500 hover:text-blue-700  transition-all flex items-center justify-center gap-2"
                            >
                                <Bell size={15} />
                                Notify Me When Back in Stock
                                {isVariantOutOfStock && variantLabel && (
                                    <span className="text-xs font-normal opacity-75">
                                        ({variantLabel})
                                    </span>
                                )}
                            </button>
                        )}

                        {!isAnyOutOfStock && !isGetQuoteMode && (
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <ShieldCheckIcon /> Quality Inspected
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <TruckIcon /> Express Shipping
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABS */}
                <div className="mt-14 border border-gray-200 rounded-2xl bg-white overflow-hidden">
                    <div className="flex overflow-x-auto border-b border-gray-200">
                        {tabs.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition -mb-px ${activeTab === key ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">
                        {activeTab === "specifications" && (
                            <div className="flex flex-col gap-6">
                                {(product.longDescription ||
                                    product.shortDescription) && (
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 mb-2">
                                            Description
                                        </h2>
                                        <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
                                            {product.longDescription ||
                                                product.shortDescription}
                                        </p>
                                    </div>
                                )}
                                {(product.attributes?.length > 0 ||
                                    product.weight) && (
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 mb-3">
                                            Physical Properties
                                        </h2>
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            {product.attributes?.map(
                                                (attr: any, i: number) => (
                                                    <div
                                                        key={attr.id}
                                                        className={`flex items-center px-5 py-3 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"} border-b border-gray-100`}
                                                    >
                                                        <span className="text-sm text-gray-500 w-1/3 min-w-[100px] flex-shrink-0">
                                                            {attr.label}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {attr.value}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                            {product.weight && (
                                                <div
                                                    className={`flex items-center px-5 py-3 ${product.attributes?.length % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                                                >
                                                    <span className="text-sm text-gray-500 w-1/3 min-w-[100px] flex-shrink-0">
                                                        Weight
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {product.weight}g
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === "features" && (
                            <div>
                                {product.features?.length > 0 ? (
                                    <>
                                        <h2 className="text-base font-semibold text-gray-900 mb-4">
                                            Key Features
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                                            {product.features.map(
                                                (
                                                    feature: string,
                                                    idx: number,
                                                ) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-2.5"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Check
                                                                size={11}
                                                                className="text-green-600"
                                                            />
                                                        </div>
                                                        <span className="text-gray-600 text-sm leading-relaxed">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-sm">
                                        No features listed for this product.
                                    </p>
                                )}
                            </div>
                        )}
                        {activeTab === "support" && (
                            <div className="flex flex-col gap-5">
                                {[
                                    {
                                        title: "Warranty",
                                        body: "7-day structural warranty on all 3D printed components covering manufacturing defects only. 30-day warranty on electrical components (if applicable) covering functional defects in internal parts.",
                                    },
                                    {
                                        title: "Installation",
                                        body: "Product is shipped fully assembled and ready to use. For electrical variants, connect to the recommended power source and follow the included quick-start guide.",
                                    },
                                    {
                                        title: "Not Covered",
                                        body: "Warranty does not cover damage from impact, heat exposure, moisture, incorrect power supply, or unauthorised modifications.",
                                    },
                                ].map((item) => (
                                    <div key={item.title}>
                                        <h2 className="text-sm font-bold text-gray-900 mb-1">
                                            {item.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {item.body}
                                        </p>
                                    </div>
                                ))}
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900 mb-1">
                                        Contact Support
                                    </h2>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        To raise a warranty claim, contact our
                                        support team with your{" "}
                                        <span className="font-bold text-gray-800">
                                            Order ID
                                        </span>{" "}
                                        along with photos or a video clearly
                                        showing the defect.
                                    </p>
                                </div>
                            </div>
                        )}
                        {activeTab === "care" && (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full flex-shrink-0" />
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Maintenance Guidelines
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        {
                                            title: "Cleaning & Surface Care",
                                            body: "Use a soft microfiber cloth for cleaning. Avoid harsh chemicals, acetone, or alcohol-based cleaners as they may damage the 3D printed surface. For electrical models, disconnect power before cleaning.",
                                        },
                                        {
                                            title: "Structural Care",
                                            body: "3D printed components can soften under high heat. Avoid placing the product in direct sunlight, near heaters, or inside vehicles. Do not apply excessive force or weight.",
                                        },
                                        {
                                            title: "Electrical Check (If Applicable)",
                                            body: "Periodically inspect wiring, connectors, and switches for looseness. Use only the recommended adapter and voltage rating. Disconnect from power when not in use for extended periods.",
                                        },
                                        {
                                            title: "Handling & Storage",
                                            body: "Handle with care — avoid drops or impact. Store in a cool, dry indoor environment. Keep away from moisture unless specifically rated otherwise.",
                                        },
                                    ].map((card) => (
                                        <div
                                            key={card.title}
                                            className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                                        >
                                            <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                                                {card.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {card.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-6 bg-orange-500 rounded-full flex-shrink-0" />
                                        <h2 className="text-base font-bold text-orange-800">
                                            Safety Precautions
                                        </h2>
                                    </div>
                                    <ul className="flex flex-col gap-2.5">
                                        {[
                                            "Heat Limits: Do not expose to temperatures above 50–60°C (material dependent).",
                                            "Moisture: Not waterproof unless explicitly mentioned.",
                                            "Power Safety: Do not use damaged cables or incompatible adapters.",
                                            "Modification: Do not open internal housing or modify wiring.",
                                            "Small Parts: Keep away from small children if product contains detachable components.",
                                        ].map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                                                <span className="text-sm text-orange-900 leading-relaxed">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews */}
                {product.reviews?.length > 0 && (
                    <div className="mt-10 border border-gray-200 rounded-2xl bg-white p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={
                                            i < Math.round(Number(avgRating))
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-200"
                                        }
                                    />
                                ))}
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                                {avgRating}
                            </span>
                            <span className="text-sm text-gray-400">
                                ({product.reviews.length} review
                                {product.reviews.length !== 1 ? "s" : ""})
                            </span>
                        </div>
                        <div className="flex flex-col gap-5">
                            {product.reviews
                                .slice(0, 5)
                                .map((review: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="pb-5 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900">
                                                    {review.userName}
                                                </p>
                                                <div className="flex gap-0.5 mt-1">
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={11}
                                                                className={
                                                                    i < 
                                                                    review.rating
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-200"
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(
                                                    review.createdAt,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {similarProducts.length > 0 && (
                    <SimilarProductsCarousel
                        products={similarProducts}
                        category={product.category}
                    />
                )}
            </div>

            {showNotifyModal && product && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={product.id}
                    productName={product.name}
                    productType="prebuilt"
                    variantId={
                        isVariantOutOfStock ? selectedVariant?.id : undefined
                    }
                    variantLabel={
                        isVariantOutOfStock ? variantLabel : undefined
                    }
                />
            )}
        </div>
    );
}
