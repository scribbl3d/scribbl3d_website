"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { Bell, Check, ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
    inStock?: boolean;
    images?: { url: string }[];
    attributes?: {
        attributeKey: string;
        attributeValue: string;
    }[];
};

/* ── Notify Me Modal ── */
function NotifyMeModal({
    printer,
    onClose,
}: {
    printer: Printer;
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
                    productId: printer.id,
                    productName: printer.name,
                    productType: "printer",
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
                                {printer.name}
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
                                as soon as this printer is back in stock.
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
                                This printer is currently out of stock. Leave
                                your details and we'll let you know the moment
                                it's available.
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

export default function SimilarPrintersCarousel({
    currentPrinterId,
    technology,
}: SimilarPrintersCarouselProps) {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollRef.current || printers.length <= 1) return;

        const container = scrollRef.current;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollLeft = 0;

        const interval = setInterval(() => {
            container.scrollBy({ left: cardWidth, behavior: "smooth" });
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollTo({ left: 0, behavior: "auto" });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [printers]);

    useEffect(() => {
        fetchSimilarPrinters();
    }, [currentPrinterId, technology]);

    const fetchSimilarPrinters = async () => {
        try {
            const res = await fetch(
                `/api/printers/similar?technology=${technology}&exclude=${currentPrinterId}`,
            );
            const data = await res.json();
            setPrinters(data.printers || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scrollLeft = () => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({ left: -cardWidth, behavior: "smooth" });
    };

    const scrollRight = () => {
        const container = scrollRef.current;
        if (!container) return;
        const cardWidth = container.firstElementChild?.clientWidth || 0;
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
    };

    if (loading || printers.length === 0) return null;

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Similar Printers
            </h2>

            <div className="relative">
                <button
                    onClick={scrollLeft}
                    className="absolute left-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={scrollRight}
                    className="absolute right-[-18px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4"
                >
                    {[...printers, ...printers].map((printer, index) => (
                        <div
                            key={`${printer.id}-${index}`}
                            className="snap-start flex-shrink-0 w-[85%] sm:w-[48%] lg:w-[32%] xl:w-[24%]"
                        >
                            <SimilarPrinterCard printer={printer} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ---------------- CARD ---------------- */

function SimilarPrinterCard({ printer }: { printer: Printer }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const { data: session } = useSession();
    const { addToCart } = useCart();

    const isOutOfStock = printer.inStock === false;

    const materials =
        printer.attributes
            ?.filter((a) => a.attributeKey === "material")
            .map((a) => a.attributeValue) || [];

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOutOfStock) return;

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

        try {
            setIsCartLoading(true);
            await addToCart({ printerId: printer.id, quantity: 1 });
            toast({
                title: "Added to Cart",
                description: `${printer.name} added to cart.`,
            });
        } finally {
            setIsCartLoading(false);
        }
    };

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
                description: `${printer.name} has been ${wasInWishlist ? "removed from" : "added to"} your wishlist.`,
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

    return (
        <>
            <Link href={`/printers/${printer.slug}`} className="block h-full">
                <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                    {/* IMAGE */}
                    <div className="relative h-[220px] bg-gray-100 overflow-hidden">
                        {(printer.imageUrl || printer.images?.[0]?.url) && (
                            <Image
                                src={printer.imageUrl || printer.images![0].url}
                                alt={printer.name}
                                fill
                                className="object-contain"
                            />
                        )}

                        {/* Out of Stock badge */}
                        {isOutOfStock && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                                Out of Stock
                            </div>
                        )}

                        <button
                            onClick={handleToggleWishlist}
                            className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center z-10"
                        >
                            {isWishlistLoading ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-5 h-5 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                            )}
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4 flex-1">
                        <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {printer.technology}
                        </span>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                            {printer.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {printer.shortDescription || printer.description}
                        </p>
                        <div className="text-xs text-gray-700 space-y-1">
                            <div>
                                <b>Build Volume:</b> {printer.volumeLength} ×{" "}
                                {printer.volumeWidth} × {printer.volumeHeight}{" "}
                                mm
                            </div>
                            {materials.length > 0 && (
                                <div className="line-clamp-2">
                                    <b>Materials:</b> {materials.join(", ")}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-5 pb-5">
                        <hr className="mb-4" />

                        <div className="flex items-center">
                            <span className="text-[16px] font-semibold text-[#101828]">
                                ₹{printer.price.toLocaleString("en-IN")}
                            </span>
                            {printer.originalPrice && (
                                <span className="ml-5 text-sm line-through text-gray-400">
                                    ₹
                                    {printer.originalPrice.toLocaleString(
                                        "en-IN",
                                    )}
                                </span>
                            )}
                            {printer.discount && (
                                <span className="ml-6 px-2 py-0.5 text-xs rounded-full text-green-700 bg-green-50 border border-green-200">
                                    {printer.discount}% OFF
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mt-1 mb-3">
                            (incl. GST)
                        </p>

                        {/* Add to Cart — hidden when out of stock */}
                        {!isOutOfStock && (
                            <button
                                onClick={handleAddToCart}
                                disabled={isCartLoading}
                                className="w-full h-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                            >
                                {isCartLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : (
                                    "Add to Cart"
                                )}
                            </button>
                        )}

                        {/* Notify Me — only when out of stock */}
                        {isOutOfStock && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowNotifyModal(true);
                                }}
                                className="w-full rounded-[10px] py-2.5 text-sm font-semibold border-2  border-blue-200 text-blue-500 hover:text-blue-700  transition-all flex items-center justify-center gap-2"
                            >
                                <Bell size={14} />
                                Notify Me When Back in Stock
                            </button>
                        )}
                    </div>
                </div>
            </Link>

            {showNotifyModal && (
                <NotifyMeModal
                    printer={printer}
                    onClose={() => setShowNotifyModal(false)}
                />
            )}
        </>
    );
}
