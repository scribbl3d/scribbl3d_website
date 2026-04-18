"use client";

import { toast } from "@/components/ui/use-toast";
import { getCardImageUrl } from "@/lib/cloudinary-url";
import { useCart } from "@/providers/CartProvider";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWishlist } from "@/hooks/use-wishlist";
import { PriceDisplay } from "@/components/ui/price-display";
import { Bell, Check, Heart, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
    products: any[];
}

/* ─────────────────────────────────────────────────────────
   Inline Variant Modal
───────────────────────────────────────────────────────── */
function VariantModal({
    product,
    onClose,
}: {
    product: any;
    onClose: () => void;
}) {
    const { addToCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

    const [fullProduct, setFullProduct] = useState<any>(product);
    const [fetching, setFetching] = useState(false);
    const [showVariantNotify, setShowVariantNotify] = useState(false);

    useEffect(() => {
        const hasVariants = product.variants?.some(
            (v: any) => v.isActive && v.price > 0,
        );
        if (hasVariants) return;
        if (!product.slug) return;
        setFetching(true);
        fetch(`/api/prebuilt-products/${product.slug}`)
            .then((r) => r.json())
            .then((data) => setFullProduct(data))
            .catch(() => {})
            .finally(() => setFetching(false));
    }, [product.slug, product.variants]);

    const variants: any[] =
        fullProduct.variants?.filter((v: any) => v.isActive) ?? [];

    const uniqueColors: { name: string; hex: string | null; isOOS: boolean }[] =
        Array.from(
            new Map(
                variants
                    .filter((v) => v.colorName)
                    .map((v) => [
                        v.colorName,
                        { name: v.colorName, hex: v.colorHex },
                    ]),
            ).values(),
        ).map((c) => {
            const allForColour = variants.filter((v) => v.colorName === c.name);
            const isOOS =
                allForColour.length > 0 &&
                allForColour.every((v) => v.inStock === false);
            return { ...c, isOOS };
        });

    const [selectedColor, setSelectedColor] = useState<string | null>(
        uniqueColors.find((c) => !c.isOOS)?.name ??
            uniqueColors[0]?.name ??
            null,
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const colors = Array.from(
            new Map(
                (
                    fullProduct.variants?.filter(
                        (v: any) => v.isActive && v.colorName,
                    ) ?? []
                ).map((v: any) => [v.colorName, v.colorName]),
            ).keys(),
        );
        if (colors.length > 0 && !selectedColor)
            setSelectedColor(colors[0] as string);
    }, [fullProduct]);

    const validSizes: { name: string; isOOS: boolean }[] = Array.from(
        new Set(
            variants
                .filter(
                    (v) =>
                        v.sizeName &&
                        (!selectedColor || v.colorName === selectedColor),
                )
                .map((v) => v.sizeName),
        ),
    ).map((size) => {
        const v = variants.find(
            (v) => v.colorName === selectedColor && v.sizeName === size,
        );
        return { name: size as string, isOOS: v?.inStock === false };
    });

    const selectedVariant =
        variants.find(
            (v) => v.colorName === selectedColor && v.sizeName === selectedSize,
        ) ??
        variants.find((v) => v.colorName === selectedColor) ??
        null;

    const isColourOOS =
        uniqueColors.find((c) => c.name === selectedColor)?.isOOS ?? false;
    const isVariantOOS = !isColourOOS && selectedVariant?.inStock === false;
    const isAnyOOS =
        fullProduct.inStock === false || isColourOOS || isVariantOOS;

    const notifyVariantId = isColourOOS
        ? selectedVariant?.id
        : isVariantOOS
          ? selectedVariant?.id
          : undefined;
    const notifyVariantLabel = isColourOOS
        ? (selectedColor ?? undefined)
        : isVariantOOS
          ? [selectedColor, selectedSize].filter(Boolean).join(", ")
          : undefined;

    const displayPrice = selectedVariant?.price ?? variants[0]?.price ?? 0;
    const originalPrice = selectedVariant?.originalPrice ?? 0;
    const discount =
        originalPrice > displayPrice && originalPrice > 0
            ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
            : 0;

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        setSelectedSize(null);
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
        if (!selectedVariant) return;
        setIsAdding(true);
        try {
            await addToCart({
                prebuiltProductId: fullProduct.id,
                prebuiltVariantId: selectedVariant.id,
                quantity,
            });
            const label = [selectedColor, selectedSize]
                .filter(Boolean)
                .join(", ");
            toast({
                title: "Added to cart",
                description: `${fullProduct.name}${label ? ` (${label})` : ""} × ${quantity} added.`,
            });
            onClose();
        } catch {
            toast({
                title: "Error",
                description: "Failed to add to cart",
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
                    <div className="flex gap-4 p-5 relative">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {(fullProduct.images?.find((i: any) => i.isMain)
                                ?.url ??
                                fullProduct.images?.[0]?.url) && (
                                <Image
                                    src={
                                        fullProduct.images?.find(
                                            (i: any) => i.isMain,
                                        )?.url ?? fullProduct.images?.[0]?.url
                                    }
                                    alt={fullProduct.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-semibold pr-6 leading-snug">
                                {fullProduct.name}
                            </h2>
                            {fullProduct.category && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
                                    {fullProduct.category}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="p-5 pb-8">
                        {fetching ? (
                            <div className="flex items-center justify-center py-10">
                                <LoadingSpinner size="lg" color="gray" />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-baseline gap-3 mb-1">
                                    <span className="text-xl font-bold text-gray-900">
                                        ₹{displayPrice.toLocaleString("en-IN")}
                                    </span>
                                    {originalPrice > displayPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                            ₹
                                            {originalPrice.toLocaleString(
                                                "en-IN",
                                            )}
                                        </span>
                                    )}
                                    {discount > 0 && (
                                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                            {discount}% off
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    (incl. GST)
                                </p>

                                {uniqueColors.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2">
                                            Color:{" "}
                                            <span className="font-normal text-gray-500">
                                                {selectedColor ?? "Select"}
                                            </span>
                                            {isColourOOS && (
                                                <span className="ml-2 text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {uniqueColors.map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() =>
                                                        handleColorChange(
                                                            c.name,
                                                        )
                                                    }
                                                    title={
                                                        c.isOOS
                                                            ? `${c.name} — Out of Stock`
                                                            : c.name
                                                    }
                                                    className={`relative w-9 h-9 rounded-full border-2 transition-all ring-offset-1 ${selectedColor === c.name ? "ring-2 ring-gray-900 scale-110" : "border-transparent hover:ring-1 hover:ring-gray-400"} ${c.isOOS ? "opacity-40" : ""}`}
                                                    style={{
                                                        backgroundColor:
                                                            c.hex ?? "#E5E7EB",
                                                    }}
                                                >
                                                    {selectedColor === c.name &&
                                                        !c.isOOS && (
                                                            <Check
                                                                size={12}
                                                                className="absolute inset-0 m-auto text-white drop-shadow"
                                                            />
                                                        )}
                                                    {c.isOOS && (
                                                        <span className="absolute inset-0 flex items-center justify-center">
                                                            <span className="block w-[110%] h-[2px] bg-red-500 rotate-45 rounded" />
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {validSizes.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2">
                                            Size
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {validSizes.map(
                                                ({
                                                    name: size,
                                                    isOOS: sizeOOS,
                                                }) => (
                                                    <button
                                                        key={size}
                                                        onClick={() =>
                                                            !sizeOOS &&
                                                            !isColourOOS &&
                                                            setSelectedSize(
                                                                size,
                                                            )
                                                        }
                                                        disabled={
                                                            sizeOOS ||
                                                            isColourOOS
                                                        }
                                                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${selectedSize === size ? "border-gray-900 bg-gray-900 text-white" : sizeOOS || isColourOOS ? "border-gray-100 text-gray-300 cursor-not-allowed line-through" : "border-gray-200 text-gray-700 hover:border-gray-700 hover:bg-gray-50"}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {isVariantOOS && (
                                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">
                                        This colour + size combination is out of
                                        stock.
                                    </p>
                                )}

                                {!isAnyOOS && (
                                    <div className="mb-6">
                                        <p className="text-sm font-medium mb-2">
                                            Quantity
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    setQuantity((q) =>
                                                        Math.max(1, q - 1),
                                                    )
                                                }
                                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                                            >
                                                −
                                            </button>
                                            <div className="flex-1 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-900 font-semibold">
                                                {quantity}
                                            </div>
                                            <button
                                                onClick={() =>
                                                    setQuantity((q) => q + 1)
                                                }
                                                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {!isAnyOOS && (
                                    <button
                                        disabled={!selectedVariant || isAdding}
                                        onClick={handleAddToCart}
                                        className="w-full h-12 font-semibold rounded-xl transition flex items-center justify-center gap-2 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isAdding ? (
                                            <LoadingSpinner size="sm" color="white" />
                                        ) : (
                                            "Add to Cart"
                                        )}
                                    </button>
                                )}

                                {isAnyOOS && (
                                    <button
                                        onClick={() =>
                                            setShowVariantNotify(true)
                                        }
                                        className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2 border-blue-200 text-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Bell size={15} />
                                        Notify Me When Back in Stock
                                        {notifyVariantLabel && (
                                            <span className="text-xs font-normal opacity-75">
                                                ({notifyVariantLabel})
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (fullProduct.slug)
                                            router.push(
                                                `/prebuilt-products/${fullProduct.slug}`,
                                            );
                                        onClose();
                                    }}
                                    className="w-full text-sm mt-3 text-gray-500 hover:text-black"
                                >
                                    View full details →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showVariantNotify && (
                <NotifyMeModal
                    isOpen={showVariantNotify}
                    onClose={() => setShowVariantNotify(false)}
                    productId={fullProduct.id}
                    productName={fullProduct.name}
                    productType="prebuilt"
                    variantId={notifyVariantId}
                    variantLabel={notifyVariantLabel}
                />
            )}
        </>
    );
}

/* ─────────────────────────────────────────────────────────
   Product Card  (matches PrinterCard layout + image zoom)
───────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: any }) {
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];

    const [showModal, setShowModal] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const isOutOfStock = product.inStock === false;

    const { isFavorite, isLoading: isWishLoading, toggleWishlist } = useWishlist({
        productId: product.id,
        productName: product.name,
        productType: "prebuilt",
    });

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
    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    const uniqueColors: { hex: string; name: string }[] = Array.from<{
        hex: string;
        name: string;
    }>(
        new Map<string, { hex: string; name: string }>(
            product.variants
                ?.filter((v: any) => v.colorHex)
                .map((v: any) => [
                    v.colorHex,
                    { hex: v.colorHex, name: v.colorName },
                ]),
        ).values(),
    );

    return (
        <>
            <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                <Link
                    href={`/prebuilt-products/${product.slug}`}
                    className="flex flex-col h-full"
                >
                    {/* IMAGE — square on all sizes */}
                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                        {mainImage && (
                            <img
                                src={getCardImageUrl(mainImage)}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                loading="eager"
                            />
                        )}
                        {/* Trending Now badge on image */}
                        {product.highlighted && (
                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
                                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg">
                                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" fill="currentColor" viewBox="0 0 20 20">
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
                            onClick={toggleWishlist}
                            disabled={isWishLoading}
                            className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center"
                        >
                            {isWishLoading ? (
                                <LoadingSpinner size="sm" color="gray" className="w-3 h-3 sm:w-5 sm:h-5" />
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
                </Link>

                {/* FOOTER */}
                <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                    <hr className="hidden sm:block my-3" />

                    <PriceDisplay
                        price={variant?.price ?? 0}
                        originalPrice={variant?.originalPrice}
                        discount={discount}
                        size="sm"
                        className="mt-1"
                    />

                    {!isOutOfStock && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                        >
                            Select Variants
                        </button>
                    )}

                    {isOutOfStock && (
                        <button
                            onClick={() => setShowNotifyModal(true)}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center gap-1.5 border-2 border-blue-200 text-blue-500 hover:text-blue-700"
                        >
                            <Bell
                                size={12}
                                className="sm:w-[14px] sm:h-[14px]"
                            />
                            Notify Me
                        </button>
                    )}
                </div>
            </div>

            {showModal && (
                <VariantModal
                    product={product}
                    onClose={() => setShowModal(false)}
                />
            )}
            {showNotifyModal && (
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

/* ─────────────────────────────────────────────────────────
   Grid  (2 cols mobile → 3 tablet → 4 desktop)
───────────────────────────────────────────────────────── */
export default function PrebuiltProductGrid({ products = [] }: Props) {
    const router = useRouter();
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        const checkBodyLock = () => {
            const bodyOverflow = window.getComputedStyle(
                document.body,
            ).overflow;
            const htmlOverflow = window.getComputedStyle(
                document.documentElement,
            ).overflow;
            setNavOpen(bodyOverflow === "hidden" || htmlOverflow === "hidden");
        };
        const observer = new MutationObserver(checkBodyLock);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["style", "class"],
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["style", "class"],
        });
        return () => observer.disconnect();
    }, []);

    if (!Array.isArray(products)) return null;
    const categories = Array.from(new Set(products.map((p) => p.category)));

    return (
        <div className="space-y-20">
            {categories.map((category) => {
                const categoryProducts = products.filter(
                    (p) => p.category === category,
                );
                const previewProducts = categoryProducts.slice(0, 8);
                const Header = () => (
                    <div className="flex items-end justify-between border-b border-gray-100 pb-5">
                        <div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                                {category}
                            </h2>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
                                {categoryProducts.length} PRODUCTS IN THIS
                                COLLECTION
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                router.push(
                                    `/prebuilt-products/category/${category.toLowerCase().replace(/\s+/g, "-")}`,
                                )
                            }
                            className="group flex items-center gap-1 text-sm font-bold text-blue-600 transition-all hover:gap-2"
                        >
                            View All <span className="text-lg">›</span>
                        </button>
                    </div>
                );
                return (
                    <section key={category} className="space-y-8">
                        <div
                            className="lg:hidden sticky top-0 bg-white -mx-4 px-4 py-4"
                            style={{ zIndex: navOpen ? 1 : 50 }}
                        >
                            <Header />
                        </div>
                        <div className="hidden lg:block">
                            <Header />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                            {previewProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
