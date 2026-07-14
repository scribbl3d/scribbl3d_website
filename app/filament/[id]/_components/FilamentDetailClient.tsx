"use client";

import { ArrowLeft, Bell, Check, Heart, Share2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { FilamentProductTile } from "@/components/filaments/FilamentProductTile";
import { getSwatchStyle } from "@/lib/utils";
import SimilarFilamentsCarousel from "@/components/filaments/SimilarFilamentsCarousel";
import { PdpImage } from "@/components/shared/PdpImage";
import { getPdpImageUrl, getThumbnailUrl } from "@/lib/cloudinary-url";
import { NotifyMeModal } from "@/components/shared/NotifyMeModal";

const FINISH_BADGE: Record<string, string> = {
    Silk: "bg-purple-100 text-purple-700",
    Matte: "bg-gray-100 text-gray-700",
    Gloss: "bg-blue-100 text-blue-700",
    Transparent: "bg-cyan-100 text-cyan-700",
};

interface FilamentDetailClientProps {
    initialFilament: any;
}

export default function FilamentDetailClient({ initialFilament }: FilamentDetailClientProps) {
    const { data: session } = useSession();
    const { addToCart } = useCart();

    const [filament] = useState<any>(initialFilament);
    const [loading] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [selectedColour, setSelectedColour] = useState(0);
    const [selectedDiameter, setSelectedDiameter] = useState<string>("");
    const [selectedSpoolSize, setSelectedSpoolSize] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [isFav, setIsFav] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [cartState, setCartState] = useState<"idle"|"loading"|"success">("idle");
    const [activeTab, setActiveTab] = useState("description");
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    // Data is passed from server component, no need to fetch

    // Check wishlist status
    useEffect(() => {
        if (!session || !filament?.id) return;
        
        const checkWishlist = async () => {
            try {
                const res = await fetch(`/api/wishlist/check?filamentId=${filament.id}`);
                const data = await res.json();
                if (data.isAuthenticated) {
                    setIsFav(data.isInWishlist);
                }
            } catch (err) {
                console.error("Wishlist check failed", err);
            }
        };
        
        checkWishlist();
    }, [session, filament?.id]);

    // Image carousel effect - must be before early returns
    const totalImgs = filament?.images?.length || 0;
    useEffect(() => {
        if (isHovering || totalImgs <= 1 || !filament) return;
        const t = setInterval(() => {
            setCurrentImg(c => (c + 1) % totalImgs);
        }, 3500);
        return () => clearInterval(t);
    }, [isHovering, totalImgs, filament]);

    // Initialize variant selections - must be before early returns
    const uniqueDiameters = Array.from(new Set(filament?.variants?.map((v: any) => v.diameter) || [])) as string[];
    const uniqueSpoolSizes = Array.from(new Set(filament?.variants?.map((v: any) => v.spoolWeight) || [])) as string[];
    
    useEffect(() => {
        if (filament?.variants && filament.variants.length > 0) {
            // Initialize with first in-stock diameter
            if (!selectedDiameter && uniqueDiameters.length > 0) {
                const firstAvailableDiameter = uniqueDiameters.find(d => 
                    filament.variants.some((v: any) => v.diameter === d && v.inStock)
                );
                if (firstAvailableDiameter) {
                    setSelectedDiameter(firstAvailableDiameter);
                }
            }
            
            // Initialize with first in-stock spool size for selected diameter
            if (!selectedSpoolSize && uniqueSpoolSizes.length > 0 && selectedDiameter) {
                const firstAvailableSpoolSize = uniqueSpoolSizes.find(s => 
                    filament.variants.some((v: any) => 
                        v.diameter === selectedDiameter && v.spoolWeight === s && v.inStock
                    )
                );
                if (firstAvailableSpoolSize) {
                    setSelectedSpoolSize(firstAvailableSpoolSize);
                }
            }
        }
    }, [filament?.variants, selectedDiameter, selectedSpoolSize, uniqueDiameters, uniqueSpoolSizes]);

    // Early returns after all hooks
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-gray-200 border-t-blue-600" />
            </div>
        );
    }

    if (!filament) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Filament Not Found</h1>
                    <Link href="/filament" className="text-blue-600 hover:underline">
                        Back to Filaments
                    </Link>
                </div>
            </div>
        );
    }

    const f = filament;
    const next = () => setCurrentImg(c => (c + 1) % totalImgs);
    const prev = () => setCurrentImg(c => c === 0 ? totalImgs - 1 : c - 1);

    // Find the variant matching selected diameter and spool size
    const selectedVariantData = f.variants?.find((v: any) => 
        v.diameter === selectedDiameter && v.spoolWeight === selectedSpoolSize
    ) || f.variants?.[0];

    const displayPrice = selectedVariantData?.price || 0;
    const originalPrice = selectedVariantData?.originalPrice || null;
    const discount = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
    
    // Check if out of stock
    const isVariantOutOfStock = selectedVariantData ? !selectedVariantData.inStock : false;
    const isFilamentOutOfStock = f?.inStock === false;
    const isOutOfStock = isFilamentOutOfStock || isVariantOutOfStock;

    const handleAddToCart = async () => {
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your cart.",
                variant: "destructive",
                action: <button onClick={() => signIn()} className="px-3 py-1 bg-white text-black rounded text-sm font-semibold">Log in</button>,
            });
            return;
        }
        
        if (!selectedVariantData?.id) {
            toast({
                title: "Variant Required",
                description: "Please select a diameter and spool size.",
                variant: "destructive",
            });
            return;
        }
        
        setCartState("loading");
        try {
            await addToCart({ 
                filamentId: f.id, 
                filamentVariantId: selectedVariantData.id, 
                quantity 
            });
            setCartState("success");
            toast({ title: "Added to Cart", description: `${f.name} has been added to your cart.` });
            setTimeout(() => setCartState("idle"), 2000);
        } catch {
            setCartState("idle");
            toast({ title: "Error", description: "Failed to add to cart.", variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">

            {/* Back bar */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-40 sm:static">
                <div className="container mx-auto px-4 py-3.5 sm:py-5">
                    <Link href="/filament" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to all filaments
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">

                    {/* ── LEFT: image carousel ── */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div
                            className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4 mb-3"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
                                <PdpImage
                                    src={getPdpImageUrl(f.images[currentImg])}
                                    alt={f.name}
                                />
                                {totalImgs > 1 && (
                                    <>
                                        <button onClick={prev} className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow transition-opacity ${isHovering ? "opacity-100" : "opacity-0"}`}>
                                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M19 12H5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M11 6L5 12L11 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        <button onClick={next} className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow transition-opacity ${isHovering ? "opacity-100" : "opacity-0"}`}>
                                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"><path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide pb-1">
                            {f.images.map((img, i) => (
                                <button key={i} onClick={() => setCurrentImg(i)}
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition ${i === currentImg ? "border-blue-600" : "border-gray-200 hover:border-gray-400"}`}>
                                    <PdpImage src={getThumbnailUrl(img)} alt="" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: product info ── */}
                    <div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 relative">
                            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{f.brand || "Scribbl3D"}</p>

                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2">
                                <button onClick={() => {
                                    const url = window.location.href;
                                    navigator.clipboard.writeText(url);
                                    toast({ title: "Link copied!" });
                                }} className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition">
                                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                </button>
                                <button 
                                    onClick={async () => {
                                        if (!session) {
                                            toast({
                                                title: "Authentication Required",
                                                description: "Please log in to add items to your wishlist.",
                                                variant: "destructive",
                                                action: <button onClick={() => signIn()} className="px-3 py-1 bg-white text-black rounded text-sm font-semibold">Log in</button>,
                                            });
                                            return;
                                        }
                                        
                                        setIsWishlistLoading(true);
                                        const wasInWishlist = isFav;
                                        setIsFav(!wasInWishlist);
                                        
                                        try {
                                            await fetch("/api/wishlist", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ filamentId: f.id }),
                                            });
                                            toast({
                                                title: wasInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
                                            });
                                        } catch (error) {
                                            setIsFav(wasInWishlist);
                                            toast({ title: "Error", description: "Failed to update wishlist.", variant: "destructive" });
                                        } finally {
                                            setIsWishlistLoading(false);
                                        }
                                    }}
                                    disabled={isWishlistLoading}
                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition">
                                    {isWishlistLoading ? (
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                                    ) : (
                                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition ${isFav ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                                    )}
                                </button>
                            </div>

                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 pr-20">{f.name}</h1>
                            
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                <span className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${FINISH_BADGE[f.finishType] ?? "bg-green-100 text-green-700"}`}>{f.finishType}</span>
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{f.material}</span>
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 text-green-700">±0.02 mm Tolerance</span>
                            </div>
                            
                            <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed break-words">{f.shortDescription}</p>

                            {/* Price */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-2 sm:gap-3">
                                    {originalPrice && originalPrice > displayPrice && (
                                        <>
                                            <span className="text-sm sm:text-lg text-gray-400 line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                                            <span className="text-xs sm:text-sm font-semibold text-green-600 bg-green-100 px-1.5 sm:px-2 py-0.5 rounded">{discount}% off</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-2xl sm:text-4xl font-bold text-gray-900 mt-1">₹{displayPrice.toLocaleString("en-IN")}</p>
                                {originalPrice && originalPrice > displayPrice && (
                                    <p className="text-sm text-green-600 font-medium mt-1">Save ₹{(originalPrice - displayPrice).toLocaleString("en-IN")}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">MRP inclusive of all taxes. Shipping calculated at checkout.</p>
                            </div>

                            <hr className="mb-4 border-gray-100" />

                            {/* Colour */}
                            {f.colours && f.colours.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-800 mb-2.5">
                                        Colour: <span className="font-normal text-gray-500">{f.colorName}</span>
                                    </p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {f.colours.map((c, i) => {
                                            const isCurrentColor = c.id === f.id;
                                            const targetUrl = `/filament/${c.slug || c.id}`;
                                            
                                            return (
                                                <button 
                                                    key={c.id || c.name} 
                                                    title={c.name} 
                                                    onClick={() => {
                                                        console.log('Color clicked:', c.name, 'URL:', targetUrl);
                                                        window.location.href = targetUrl;
                                                    }}
                                                    className={`relative w-10 h-10 rounded-full border-2 ring-offset-1 transition-all ${isCurrentColor ? "ring-2 ring-gray-900 scale-110 border-transparent" : "border-gray-200 hover:scale-105"}`}
                                                    style={getSwatchStyle(c.hex, c.name)}
                                                >
                                                    {isCurrentColor && <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow" style={{ color: ['Transparent Clear', 'Silk Silver'].includes(c.name) ? '#1f2937' : '#ffffff' }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Diameter Selection */}
                            {uniqueDiameters.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-800 mb-2.5">Diameter</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {uniqueDiameters.map((diameter: string) => {
                                            // Check if any variant with this diameter is in stock
                                            const hasStockForDiameter = f.variants?.some((v: any) => 
                                                v.diameter === diameter && v.inStock
                                            );

                                            return (
                                                <button 
                                                    key={diameter} 
                                                    onClick={() => {
                                                        if (!hasStockForDiameter) return;
                                                        setSelectedDiameter(diameter);
                                                        // Auto-select first available spool size for this diameter
                                                        const firstAvailableSpoolSize = uniqueSpoolSizes.find(s => 
                                                            f.variants?.some((v: any) => 
                                                                v.diameter === diameter && v.spoolWeight === s && v.inStock
                                                            )
                                                        );
                                                        if (firstAvailableSpoolSize) {
                                                            setSelectedSpoolSize(firstAvailableSpoolSize);
                                                        }
                                                    }}
                                                    disabled={!hasStockForDiameter}
                                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                        selectedDiameter === diameter 
                                                            ? "border-gray-900 bg-gray-900 text-white" 
                                                            : hasStockForDiameter
                                                                ? "border-gray-200 text-gray-700 hover:border-gray-700"
                                                                : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                                    }`}>
                                                    {diameter}
                                                    {!hasStockForDiameter && " (Out of Stock)"}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Spool Size Selection */}
                            {selectedDiameter && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-800 mb-2.5">Spool Size</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {(() => {
                                            // Get only spool sizes that exist for selected diameter
                                            const availableSpoolSizes = f.variants
                                                ?.filter((v: any) => v.diameter === selectedDiameter)
                                                .map((v: any) => ({
                                                    spoolWeight: v.spoolWeight,
                                                    inStock: v.inStock
                                                })) || [];

                                            // Remove duplicates
                                            const uniqueSpoolsForDiameter = Array.from(
                                                new Map(availableSpoolSizes.map((item: any) => [item.spoolWeight, item])).values()
                                            );

                                            return uniqueSpoolsForDiameter.map((item: any) => (
                                                <button 
                                                    key={item.spoolWeight} 
                                                    onClick={() => item.inStock && setSelectedSpoolSize(item.spoolWeight)}
                                                    disabled={!item.inStock}
                                                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                                        selectedSpoolSize === item.spoolWeight 
                                                            ? "border-gray-900 bg-gray-900 text-white" 
                                                            : item.inStock
                                                                ? "border-gray-200 text-gray-700 hover:border-gray-700"
                                                                : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                                    }`}>
                                                    {item.spoolWeight}
                                                    {!item.inStock && " (Out of Stock)"}
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-5">
                                <p className="text-sm font-semibold text-gray-800 mb-2.5">Quantity</p>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 text-xl flex items-center justify-center hover:bg-gray-50">−</button>
                                    <div className="flex-1 max-w-[80px] h-10 border border-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-900">{quantity}</div>
                                    <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 text-xl flex items-center justify-center hover:bg-gray-50">+</button>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="space-y-2 sm:space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartState !== "idle" || isOutOfStock}
                                    className={`relative w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-colors flex items-center justify-center ${
                                        isOutOfStock 
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                            : cartState === "success" 
                                                ? "bg-green-600 text-white" 
                                                : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                                    }`}>
                                    {isOutOfStock ? (
                                        "Out of Stock"
                                    ) : cartState === "loading" ? (
                                        <>
                                            <span className="opacity-0">Add to Cart</span>
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </span>
                                        </>
                                    ) : cartState === "success" ? (
                                        <><Check className="w-5 h-5" /> Added to Cart!</>
                                    ) : (
                                        "Add to Cart"
                                    )}
                                </button>
                                
                                {/* Notify Me — only when out of stock */}
                                {isOutOfStock && (
                                    <button
                                        onClick={() => setShowNotifyModal(true)}
                                        className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg border-2 border-blue-200 text-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-2">
                                        <Bell size={16} />
                                        Notify Me When Back in Stock
                                    </button>
                                )}
                                
                                {/* Contact Sales — hidden when out of stock */}
                                {!isOutOfStock && (
                                    <button
                                        onClick={() => {
                                            const variant = selectedVariantData ? `${selectedVariantData.diameter} - ${selectedVariantData.spoolWeight}` : '';
                                            const color = f.colours?.[selectedColour]?.name || f.colorName || '';
                                            const msg = `Hi, I'd like to order ${f.name} (${color}, ${variant}).`;
                                            window.open(`https://wa.me/919599523434?text=${encodeURIComponent(msg)}`, "_blank");
                                        }}
                                        className="w-full py-2.5 sm:py-3 bg-white text-sm sm:text-base text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                                        Contact Sales
                                    </button>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-5 gap-y-2">
                                {["Free shipping over ₹1000", "Moisture-sealed spool", "Easy returns"].map(b => (
                                    <div key={b} className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                        {b}
                                    </div>
                                ))}
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
                                features={f.features}
                                applications={f.applications}
                                description={f.longDescription}
                            />
                        )}
                        {activeTab === "specifications" && (
                            <SpecificationsTab specifications={f.specs} />
                        )}
                        {activeTab === "compatibility" && (
                            <CompatibilityTab
                                compatibility={f.compatibility}
                                material={f.material}
                                notes={f.compatibility?.notes}
                            />
                        )}
                        {activeTab === "safety & Handling" && (
                            <SafetyTab safety={f.safety} downloads={f.downloads} />
                        )}
                    </div>
                </div>

                {/* Similar Filaments - Same Material */}
                <SimilarFilamentsCarousel currentFilamentId={f.id} material={f.material} />
            </div>
            
            {/* Notify Me Modal */}
            {showNotifyModal && f && (
                <NotifyMeModal
                    isOpen={showNotifyModal}
                    onClose={() => setShowNotifyModal(false)}
                    productId={f.id}
                    productName={f.name}
                    productType="filament"
                    variantId={selectedVariantData?.id}
                    variantLabel={selectedVariantData ? `${selectedVariantData.diameter} - ${selectedVariantData.spoolWeight}` : undefined}
                />
            )}
        </div>
    );
}

/* ── Tab Components ── */

function DescriptionTab({ description, features, applications }) {
    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Product Description
                </h3>
                <span className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 mt-4 sm:mt-6">
                    Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 sm:gap-3"
                        >
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">
                                {feature}
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
                    {applications.map((app, i) => (
                        <span
                            key={i}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full"
                        >
                            {app}
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
    specifications: Record<string, {label: string, value: string}[]>;
}) {
    if (!specifications) return null;
    
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
                                key={spec.label}
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

function CompatibilityTab({ compatibility, material, notes }) {
    // Handle both array format (from DB) and object format (from mock)
    const printers = Array.isArray(compatibility) ? compatibility : compatibility?.printers || [];
    const compatibilityNotes = notes || compatibility?.notes || "";

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Compatible Printers
                </h3>
                <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    This filament is compatible with most{" "}
                    <span className="font-medium text-gray-900">
                        {material}
                    </span>{" "}
                    capable 3D printers, including standard FDM/FFF setups.
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 mt-4 sm:mt-6">
                    Tested Printers
                </h3>
                <div className="border border-[#E5E7EB] rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 sm:gap-y-3 gap-x-6 sm:gap-x-8">
                        {printers.length > 0 ? printers.map((c, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-xs sm:text-sm text-gray-700"
                            >
                                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                                <span>{c}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 col-span-2">No tested printers listed yet.</p>
                        )}
                    </div>
                </div>
                {compatibilityNotes && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 sm:px-4 sm:py-3 mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                            <span className="font-medium">Note:</span> {compatibilityNotes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SafetyTab({ safety, downloads }) {
    // Use mock safety data if not provided
    const safetyData = safety || [
        { icon: "🌡️", title: "Storage Temperature", detail: "Store between 15 – 30 °C in a cool, dry place away from direct sunlight." },
        { icon: "💧", title: "Moisture Sensitivity", detail: "PLA+ absorbs moisture over time. Re-seal the bag or use a dry box after opening. Dry at 45 °C for 4 h if stringing or popping occurs." },
        { icon: "🌬️", title: "Ventilation", detail: "Print in a well-ventilated space or with an enclosure filter. PLA+ emits low VOCs but good airflow is still recommended." },
        { icon: "🔥", title: "Fire & Heat", detail: "PLA+ has a glass transition temperature of ~60 °C. Avoid printing parts that will be exposed to sustained heat above 55 °C." },
        { icon: "♻️", title: "Disposal", detail: "PLA+ is plant-derived and industrially compostable. Check local facilities — standard home composting is not sufficient." },
        { icon: "🧤", title: "Handling", detail: "Keep out of reach of children. Avoid prolonged skin contact with molten filament. Never eat or bring near food prep surfaces." },
    ];

    return (
        <div className="space-y-5 sm:space-y-6">
            <div className="rounded-lg border border-[#FFF085] bg-[#FEFCE8] p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="flex-shrink-0"
                    >
                        <path
                            d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.8A2 2 0 004.6 20h14.8a2 2 0 001.71-3.34l-7.4-12.8a2 2 0 00-3.42 0z"
                            stroke="#A65F00"
                            strokeWidth={1.6667}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <h4 className="text-xs sm:text-sm font-medium text-[#733E0A]">
                        Safety Warnings
                    </h4>
                </div>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-[#894B00] leading-relaxed">
                    <li>May emit very low VOCs during printing, use in a well-ventilated area</li>
                    <li>Hotend and heated bed pose burn risks — do not touch during operation</li>
                    <li>Keep out of reach of children and pets</li>
                    <li>Keep spool sealed with desiccant when not in use</li>
                </ul>
            </div>
            
            {safetyData.map((s, i) => (
                <div key={i}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                        {s.icon} {s.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {s.detail}
                    </p>
                </div>
            ))}

            {downloads && downloads.length > 0 ? (
                <>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 mt-8">
                        Safety Downloads
                    </h3>
                    {downloads.map((download) => (
                        <a
                            key={download.id}
                            href={download.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group mb-3 last:mb-0"
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
                    ))}
                </>
            ) : (
                <div className="text-center py-6 sm:py-8 mt-6">
                    <Download className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-gray-600">
                        No downloads available for this filament.
                    </p>
                </div>
            )}
        </div>
    );
}

