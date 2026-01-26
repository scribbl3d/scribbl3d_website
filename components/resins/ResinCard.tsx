"use client";
import { Heart } from "lucide-react";
import Link from "next/link";

import { toast } from "@/components/ui/use-toast";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ResinCardProps {
    resin: any;
    onSelect: () => void;
}
export default function ResinCard({ resin, onSelect }: ResinCardProps) {
    const { data: session } = useSession();
    const colour = resin.colours?.[0];
    const image = resin.cardImageUrl;
    const shortDescription = resin.shortDescription;
    const name = resin.name;
    const material = resin.attributes?.find(
        (attr: any) => attr.label === "Material",
    )?.value;
    const price = resin.weights?.[0]?.price;
    const originalPrice = resin.weights?.[0]?.originalPrice;
    const discount = resin.weights?.[0]?.discount;
    const slug = resin.slug;
    const technology = resin.technology;
    const [isFavorite, setIsFavorite] = useState(false);

    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
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

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
            {/* CARD LINK */}
            <Link href={`/resins/${slug}`} className=" flex flex-col h-full">
                {/* IMAGE */}
                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    <Image
                        src={image || "/images/placeholder-image.png"}
                        alt={name}
                        fill
                        priority
                        className="object-cover"
                    />

                    {/* WISHLIST */}
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

                {/* CONTENT */}
                <div className="p-5 flex-1">
                    {/* TECHNOLOGY */}
                    <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {material}
                    </span>

                    {/* NAME */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                        {name}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {shortDescription}
                    </p>
                    <div className="text-sm text-gray-700 space-y-1">
                        <div>
                            <strong>Technology:</strong> {technology}
                        </div>

                        <div className="line-clamp-2">
                            <span className="font-semibold">
                                UV Wavelength:
                            </span>{" "}
                            {"405 nm"}
                        </div>
                    </div>
                </div>
            </Link>

            {/* FOOTER (LOCKED POSITION) */}
            <div className="mt-auto px-5 pb-5">
                <hr className="mb-4" />

                {/* PRICE ROW */}
                <div className="flex items-center mt-1">
                    {/* FINAL PRICE */}
                    <span
                        className="
      text-[16px]
      leading-[24px]
      font-semibold
      text-[#101828]
    "
                    >
                        ₹{price.toLocaleString("en-IN")}
                    </span>

                    {/* ORIGINAL PRICE */}
                    {originalPrice && (
                        <span
                            className="
        ml-5

        text-[14px]
        leading-[20px]
        font-normal
        line-through
        text-[#99A1AF]
      "
                        >
                            ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                    )}

                    {/* DISCOUNT */}
                    {discount && (
                        <span
                            className="
        ml-6
        h-[22px]
        px-2
        inline-flex
        items-center
        rounded-full
        text-[12px]
        leading-[16px]
        font-medium
        text-[#008236]
        bg-[#F0FDF4]
        border
        border-[#B9F8CF]
      "
                        >
                            {discount}% OFF
                        </span>
                    )}
                </div>

                <p className="text-[14px] leading-[20px] text-[#667085] mt-1 mb-3">
                    (incl. GST)
                </p>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onSelect();
                    }}
                    className="w-full h-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                >
                    Select Options
                </button>
            </div>
        </div>
    );
}
