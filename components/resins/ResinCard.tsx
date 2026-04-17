"use client";

import { toast } from "@/components/ui/use-toast";
import { getCardImageUrl } from "@/lib/cloudinary-url";
import { Bell, Check, Heart, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ── Notify Me Modal ── */
function NotifyMeModal({
    resin,
    onClose,
}: {
    resin: any;
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
                                This resin is currently out of stock. Leave your
                                details and we'll let you know the moment it's
                                available.
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

/* ── Resin Card ── */
interface ResinCardProps {
    resin: any;
    onSelect: () => void;
}

export default function ResinCard({ resin, onSelect }: ResinCardProps) {
    const { data: session } = useSession();

    const imageUrl = resin.cardImageUrl;
    const name = resin.name;
    const shortDescription = resin.shortDescription;
    const material = resin.attributes?.find(
        (attr: any) => attr.label === "Material",
    )?.value;
    const technology = resin.technology;
    const slug = resin.slug;

    const price = resin.weights?.[0]?.price ?? 0;
    const originalPrice = resin.weights?.[0]?.originalPrice ?? null;
    const discount = resin.weights?.[0]?.discount;

    const isOutOfStock = resin.inStock === false;

    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishLoading, setIsWishLoading] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

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

        if (isWishLoading) return;
        setIsWishLoading(true);
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
            setIsWishLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg sm:rounded-[10px] border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
                <Link
                    href={`/resins/${slug}`}
                    className="flex flex-col h-full"
                >
                    {/* IMAGE — square on all sizes */}
                    <div className="relative aspect-square w-full bg-white overflow-hidden">
                        {imageUrl && (
                            <img
                                src={getCardImageUrl(imageUrl)}
                                alt={name}
                                className="w-full h-full object-contain"
                                loading="eager"
                            />
                        )}
                        {isOutOfStock && (
                            <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-red-500 text-white text-[7px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                Out of Stock
                            </div>
                        )}
                        <button
                            onClick={handleToggleWishlist}
                            disabled={isWishLoading}
                            className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-10 sm:h-10 bg-white rounded-full shadow flex items-center justify-center"
                        >
                            {isWishLoading ? (
                                <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                                <Heart
                                    className={`w-3 h-3 sm:w-5 sm:h-5 transition ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                                />
                            )}
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className="px-2.5 pt-2 pb-0 sm:px-5 sm:pt-4 sm:pb-0">
                        {/* Material badge */}
                        <span className="inline-block mb-1 sm:mb-2 px-1.5 py-px sm:px-3 sm:py-1 text-[9px] sm:text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                            {material}
                        </span>

                        {/* Name */}
                        <h3 className="text-[13px] leading-tight sm:text-[15px] sm:leading-snug font-bold text-gray-900 line-clamp-1 sm:line-clamp-2">
                            {name}
                        </h3>

                        {/* Colour swatches */}
                        {resin.colours && resin.colours.length > 0 && (
                            <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
                                {resin.colours.map((c: any) => (
                                    <span
                                        key={c.id}
                                        title={`${c.name}${c.inStock === false ? " — Out of Stock" : ""}`}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300 flex-shrink-0 ${c.inStock === false ? "opacity-30" : ""}`}
                                        style={{
                                            backgroundColor:
                                                c.hexCode || "#ccc",
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Description — hidden on mobile */}
                        <p className="hidden sm:block text-[13px] leading-[20px] text-[#4A5565] mt-1 line-clamp-2">
                            {shortDescription}
                        </p>

                        {/* Specs — hidden on mobile */}
                        <div className="hidden sm:block text-[13px] text-gray-700 mt-1.5">
                            <div>
                                <strong>Technology:</strong> {technology}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* FOOTER */}
                <div className="mt-auto px-2.5 pb-2.5 sm:px-5 sm:pb-4">
                    <hr className="hidden sm:block my-3" />

                    {/* Line 1: Actual price + Original price */}
                    <div className="flex items-baseline gap-3 sm:gap-0 sm:justify-start mt-1">
                        <span className="text-[13px] sm:text-[16px] font-bold text-[#101828]">
                            ₹{price.toLocaleString("en-IN")}
                        </span>
                        {originalPrice && (
                            <span className="sm:ml-3 text-[10px] sm:text-[14px] font-normal line-through text-[#99A1AF]">
                                ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}
                        {/* Discount — desktop only inline with prices */}
                        {discount && (
                            <span className="hidden sm:inline-flex sm:ml-2 h-[22px] px-2 items-center rounded-full text-[12px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Line 2: GST + Discount on mobile */}
                    <div className="flex items-center gap-3 sm:gap-2.5 mb-0.5 sm:mb-2.5 sm:justify-start">
                        <p className="text-[9px] sm:text-[13px] text-[#667085]">
                            (incl. GST)
                        </p>
                        {discount && (
                            <span className="sm:hidden h-[14px] px-1 inline-flex items-center rounded-full text-[8px] font-medium text-[#008236] bg-[#F0FDF4] border border-[#B9F8CF]">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Select Variants — hidden when OOS */}
                    {!isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onSelect();
                            }}
                            className="w-full h-8 sm:h-10 text-[11px] sm:text-sm font-semibold rounded-md sm:rounded-lg transition flex items-center justify-center bg-black text-white hover:bg-gray-900"
                        >
                            Select Variants
                        </button>
                    )}

                    {/* Notify Me — only when OOS */}
                    {isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowNotifyModal(true);
                            }}
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

            {showNotifyModal && (
                <NotifyMeModal
                    resin={resin}
                    onClose={() => setShowNotifyModal(false)}
                />
            )}
        </>
    );
}