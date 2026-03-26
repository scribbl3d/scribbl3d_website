"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Heart, ShoppingCart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedSubtext, SplitText } from "./SplitText";

interface BestSellerProduct {
    id?: string;
    name: string;
    variant?: string | null;
    price: string;
    image: string;
    href: string;
    description?: string | null;
    specs?: { label: string; value: string }[] | null;
    isHero?: boolean;
    printerId?: string | null;
}

interface BestSellersProps {
    items: BestSellerProduct[];
}

function formatPrice(price: string) {
    const cleaned = price.replace(/[₹,$\s]/g, "");
    const num = Number(cleaned);
    if (isNaN(num)) return price.startsWith("₹") ? price : `₹${price}`;
    return `₹${num.toLocaleString("en-IN")}`;
}

/* ── Wishlist hook — supports printers, filaments, resins, prebuilt ── */
function useWishlist(productHref: string) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [productId, setProductId] = useState<string | null>(null);
    const [productType, setProductType] = useState<string | null>(null);
    const { data: session } = useSession();

    // Detect type + slug from href
    const getTypeAndSlug = () => {
        if (productHref.startsWith("/printers/"))
            return {
                type: "printer",
                slug: productHref.split("/printers/")[1],
                apiPath: "printers",
                wishlistKey: "printerId",
                checkKey: "printerId",
            };
        if (
            productHref.startsWith("/filaments/") ||
            productHref.startsWith("/products/")
        ) {
            const slug = productHref.startsWith("/filaments/")
                ? productHref.split("/filaments/")[1]
                : productHref.split("/products/")[1];
            return {
                type: "filament",
                slug,
                apiPath: "products",
                wishlistKey: "productId",
                checkKey: "productId",
            };
        }
        if (productHref.startsWith("/resins/"))
            return {
                type: "resin",
                slug: productHref.split("/resins/")[1],
                apiPath: "resins",
                wishlistKey: "resinId",
                checkKey: "resinId",
            };
        if (
            productHref.startsWith("/prebuilt/") ||
            productHref.startsWith("/prebuilt-products/")
        ) {
            const slug = productHref.split("/").pop();
            return {
                type: "prebuilt",
                slug,
                apiPath: "prebuilt-products",
                wishlistKey: "prebuiltProductId",
                checkKey: "prebuiltProductId",
            };
        }
        return null;
    };

    const info = getTypeAndSlug();

    useEffect(() => {
        if (!info?.slug) return;
        const init = async () => {
            try {
                let id: string | null = null;

                if (info.type === "filament") {
                    // Filaments: href is /products/{productId} or /filaments/{productId}
                    // The slug IS the product ID — use it directly
                    id = info.slug!;
                } else {
                    // Printers, resins, prebuilt: support slug-based lookup
                    const res = await fetch(
                        `/api/${info.apiPath}/${info.slug}`,
                    );
                    if (res.ok) {
                        const data = await res.json();
                        id = data.id;
                    }
                }

                if (!id) return;
                setProductId(id);
                setProductType(info.type);

                if (!session) return;
                const wishRes = await fetch(
                    `/api/wishlist/check?${info.checkKey}=${id}`,
                );
                const wishData = await wishRes.json();
                if (wishData.isAuthenticated)
                    setIsFavorite(wishData.isInWishlist);
            } catch (err) {
                console.error("Wishlist init failed:", err);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [info?.slug, session]);

    const toggle = async (e: React.MouseEvent) => {
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
        if (isLoading || !productId || !info) return;
        setIsLoading(true);
        const was = isFavorite;
        setIsFavorite(!was);
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [info.wishlistKey]: productId }),
            });
            toast({
                title: was ? "Removed from wishlist" : "Added to wishlist",
            });
        } catch {
            setIsFavorite(was);
            toast({
                title: "Error",
                description: "Failed to update wishlist.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { isFavorite, isLoading, toggle, isSupported: !!info };
}

/* ── Desktop small product card with wishlist ── */
function DesktopSmallCard({ product }: { product: BestSellerProduct }) {
    const { isFavorite, isLoading, toggle, isSupported } = useWishlist(
        product.href,
    );

    return (
        <Link
            href={product.href}
            className="relative group overflow-hidden rounded-[24px] bg-[#f8f9fa] border border-black/5 p-4 lg:p-5 flex flex-col shadow-sm hover:shadow-lg transition-all duration-500 h-full"
        >
            <div className="relative flex-1 w-full mb-4 lg:mb-5 overflow-hidden rounded-2xl bg-white flex items-center justify-center border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] min-h-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 lg:p-6 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                />
            </div>

            <div className="flex flex-col shrink-0 px-1">
                <div className="flex flex-col">
                    <h4 className="font-bold text-gray-900 text-[14px] lg:text-[15px] line-clamp-2 leading-tight">
                        {product.name}
                    </h4>
                    {product.variant && (
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-0.5 leading-none">
                            {product.variant}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-start mt-1.5 lg:mt-2">
                    <span className="font-black text-[16px] lg:text-[18px] text-[#4f46e5] leading-none pt-1">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        className="p-2 lg:p-2.5 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors shadow-sm -mt-1"
                        onClick={toggle}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                            <Heart
                                className={`w-4 h-4 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}

/* ── Mobile small product card with wishlist ── */
function SmallCard({ product }: { product: BestSellerProduct }) {
    const { isFavorite, isLoading, toggle, isSupported } = useWishlist(
        product.href,
    );

    return (
        <Link
            href={product.href}
            className="bg-[#f3f4f6] rounded-xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col h-full"
        >
            <div className="p-2 pb-0 flex-1 min-h-0">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-white">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </div>
            <div className="px-2.5 pt-1.5 pb-2 flex-shrink-0">
                <h3 className="text-[11px] font-semibold text-gray-900 truncate">
                    {product.name}
                </h3>
                {product.variant && (
                    <p className="text-[9px] text-gray-400 tracking-wide uppercase mt-0.5">
                        {product.variant}
                    </p>
                )}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-[#4f46e5]">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:border-red-300 transition-colors"
                        onClick={toggle}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                            <Heart
                                className={`w-3 h-3 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}

/* ── Desktop hero card with real add-to-cart ── */
function HeroCard({ product }: { product: BestSellerProduct }) {
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isCartLoading, setIsCartLoading] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
            // Try adding by printerId if href is a printer link
            if (product.href.startsWith("/printers/")) {
                const slug = product.href.split("/printers/")[1];
                const res = await fetch(`/api/printers/${slug}`);
                if (res.ok) {
                    const printer = await res.json();
                    await addToCart({ printerId: printer.id, quantity: 1 });
                    toast({
                        title: "Added to Cart",
                        description: `${product.name} has been added to your cart.`,
                    });
                    return;
                }
            }
            toast({
                title: "Visit product page",
                description:
                    "Please visit the product page to add this item to cart.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to add to cart.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    return (
        <Link
            href={product.href}
            className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[32px] bg-[#0a0a0f] border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 block h-full w-full"
        >
            <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

            <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-10">
                <span className="bg-[#4f46e5] text-white px-3.5 py-1.5 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest shadow-md">
                    #1 Best Seller
                </span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 lg:p-8 xl:p-10 w-full z-10">
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 lg:gap-6">
                    <div className="max-w-[18rem] lg:max-w-md">
                        <h3 className="text-white text-3xl lg:text-4xl font-black mb-2 lg:mb-3 leading-tight">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="text-white/70 text-sm lg:text-[15px] mb-4 xl:mb-6 line-clamp-2">
                                {product.description}
                            </p>
                        )}

                        {product.specs && product.specs.length > 0 && (
                            <div className="flex gap-6 lg:gap-8 mb-2 xl:mb-0">
                                {product.specs.map((spec) => (
                                    <div key={spec.label}>
                                        <p className="text-white/40 text-[9px] lg:text-[10px] uppercase font-bold tracking-widest mb-1">
                                            {spec.label}
                                        </p>
                                        <p className="text-white font-mono text-base lg:text-xl font-bold">
                                            {spec.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-left xl:text-right shrink-0">
                        <p className="text-[#818cf8] text-2xl lg:text-3xl font-black mb-3 lg:mb-4">
                            {formatPrice(product.price)}
                        </p>
                        <button
                            className="bg-white text-gray-900 px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl text-sm lg:text-base font-bold hover:bg-gray-100 transition-all flex items-center gap-2 shadow-xl disabled:opacity-60"
                            onClick={handleAddToCart}
                            disabled={isCartLoading}
                        >
                            {isCartLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Add to Cart <ShoppingCart size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function BestSellers({ items }: BestSellersProps) {
    if (!items?.length) return null;

    const hero = items.find((p) => p.isHero);
    const others = items.filter((p) => !p.isHero);

    return (
        <section className="w-full bg-white py-8 sm:py-16 px-4 sm:px-10 lg:px-16 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-8 sm:mb-10 lg:mb-12">
                    <div>
                        <SplitText className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                            Best Sellers
                        </SplitText>
                        <AnimatedSubtext className="mt-2 text-sm sm:text-base text-gray-500">
                            Most chosen by makers and professionals.
                        </AnimatedSubtext>
                    </div>
                </div>

                {/* ── Desktop: CSS Grid Layout ── */}
                <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-5 lg:gap-6 h-[580px] lg:h-[680px] xl:h-[740px]">
                    {hero && <HeroCard product={hero} />}
                    {others.slice(0, 4).map((product) => (
                        <DesktopSmallCard
                            key={product.name}
                            product={product}
                        />
                    ))}
                </div>

                {/* ── Mobile: hero on top + horizontal scroll ── */}
                <div className="md:hidden space-y-4">
                    {hero && <MobileHeroCard product={hero} />}
                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
                        {others.map((product) => (
                            <div
                                key={product.name}
                                className="flex-shrink-0 w-[45%] snap-start"
                            >
                                <SmallCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Mobile hero card with real add-to-cart ── */
function MobileHeroCard({ product }: { product: BestSellerProduct }) {
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isCartLoading, setIsCartLoading] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in.",
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
            if (product.href.startsWith("/printers/")) {
                const slug = product.href.split("/printers/")[1];
                const res = await fetch(`/api/printers/${slug}`);
                if (res.ok) {
                    const printer = await res.json();
                    await addToCart({ printerId: printer.id, quantity: 1 });
                    toast({
                        title: "Added to Cart",
                        description: `${product.name} added.`,
                    });
                    return;
                }
            }
            toast({
                title: "Visit product page",
                description: "Please visit the product page to add to cart.",
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to add to cart.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    return (
        <Link
            href={product.href}
            className="relative block rounded-2xl overflow-hidden bg-[#0a0a0f] h-[300px]"
        >
            <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white bg-[#4f46e5] rounded-md z-10">
                #1 BEST SELLER
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                {product.description && (
                    <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                        {product.description}
                    </p>
                )}
                <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-[#c4b5fd]">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        disabled={isCartLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm disabled:opacity-60"
                    >
                        {isCartLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Add to Cart{" "}
                                <ShoppingCart className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}
