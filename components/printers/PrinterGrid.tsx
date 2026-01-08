"use client";

import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/* ================= TYPES ================= */
interface PrinterGridProps {
    printers: any[];
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}

/* ================= GRID ================= */
export default function PrinterGrid({
    printers,
    page,
    total,
    limit,
    onPageChange,
}: PrinterGridProps) {
    const totalPages = Math.ceil(total / limit);

    if (printers.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No printers found
                </h3>
                <p className="text-gray-600">
                    Try adjusting your filters to see more results
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {printers.map((printer) => (
                    <PrinterCard key={printer.id} printer={printer} />
                ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`px-3 py-1 border rounded ${
                                    p === page ? "bg-black text-white" : ""
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

/* ================= CARD (UNCHANGED) ================= */
function PrinterCard({ printer }: { printer: any }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishLoading, setIsWishLoading] = useState(false);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isCartLoading, setIsCartLoading] = useState(false);
    const router = useRouter();

    const materials = printer.attributes
        .filter((attr: any) => attr.attributeKey === "material")
        .map((attr: any) => attr.attributeValue);

    const price = printer.price || 0;
    const originalPrice = printer.originalPrice || null;

    const handleAddToCart = async () => {
        if (!printer || isCartLoading) return;

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
                quantity: 1,
            });

            toast({
                title: "Added to Cart",
                description: `${printer.name} has been added to your cart.`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to add printer to cart.",
                variant: "destructive",
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
            {/* CARD LINK */}
            <Link
                href={`/printers/${printer.slug}`}
                className=" flex flex-col h-full"
            >
                {/* IMAGE */}
                <div className="relative h-[260px] w-full bg-gray-100 overflow-hidden">
                    {printer.images?.[0]?.url && (
                        <Image
                            src={printer.images[0].url}
                            alt={printer.name}
                            fill
                            priority
                            className="object-cover"
                        />
                    )}
                </div>

                {/* CONTENT */}
                <div className="p-5 flex-1">
                    {/* TECHNOLOGY */}
                    <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        {printer.technology}
                    </span>

                    {/* NAME */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                        {printer.name}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {printer.shortDescription || printer.description}
                    </p>

                    {/* SPECS */}
                    <div className="text-sm text-gray-700 space-y-1">
                        <div>
                            <strong>Build Volume:</strong>{" "}
                            {printer.volumeDisplay
                                ?.split("×")
                                .map((v) => `${v.trim()} mm`)
                                .join(" × ")}
                        </div>

                        <div className="line-clamp-2">
                            <span className="font-semibold">Materials:</span>{" "}
                            {materials?.length ? materials.join(", ") : "N/A"}
                        </div>
                    </div>
                </div>
            </Link>

            {/* FOOTER (LOCKED POSITION) */}
            <div className="mt-auto px-5 pb-5">
                <hr className="mb-4" />

                {/* PRICE ROW */}
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
                    {printer.discount && (
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
                            {printer.discount}% OFF
                        </span>
                    )}
                </div>

                <p className="text-[14px] leading-[20px] text-[#667085] mt-1 mb-3">
                    (incl. GST)
                </p>

                {/* ADD TO CART */}
                <button
                    onClick={handleAddToCart}
                    disabled={isCartLoading}
                    className="w-full h-12 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition flex items-center justify-center"
                >
                    {isCartLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        "Add to Cart"
                    )}
                </button>
            </div>
        </div>
    );
}
