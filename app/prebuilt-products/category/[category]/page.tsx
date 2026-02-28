"use client";

import Loader from "@/components/Loader";
import { toast } from "@/components/ui/use-toast";
import { ChevronLeft, Heart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    Cosplay:
        "High-detail cosplay props and accessories crafted for accuracy, durability, and convention-ready performance.",
    Figurine:
        "Premium 3D printed figurines designed with sharp detailing and smooth finishes — perfect for collectors and enthusiasts.",
    "Home Essentials":
        "Smart, minimal, and practical 3D printed products designed to simplify and elevate everyday living.",
    "Household Utilities":
        "Functional and durable utility products engineered to solve real household problems efficiently.",
    Keychains:
        "Compact, creative, and customizable keychains — ideal for gifting, branding, and everyday carry.",
    Kits: "Curated DIY and learning kits designed to combine creativity, engineering, and hands-on exploration.",
    Lamps: "Aesthetic 3D printed lamps that blend modern design with warm, ambient lighting.",
    "New Launch":
        "Discover our latest product innovations — freshly designed and now available.",
    Personalised:
        "Custom-designed 3D printed products tailored to your name, brand, or unique idea.",
    Statues:
        "Elegant decorative statues crafted with precision detailing and premium surface finish.",
    "The Latest":
        "Trending and recently added products — stay updated with what's new at Scribbl3D.",
    Utilities:
        "Purpose-built 3D printed tools and accessories designed for functionality and long-term use.",
    "Wall Decor":
        "Modern 3D printed wall décor pieces that add depth, texture, and character to your space.",
};

export default function CategoryListingPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = (params.category as string).replace(/-/g, " ");

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const res = await fetch(
                    `/api/prebuilt-products-new?category=${params.category}`,
                );
                const data = await res.json();
                // Safety: Ensure data is an array to fix ".map is not a function"
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryProducts();
    }, [params.category]);

    if (loading) return <Loader />;

    const categoryDescription =
        CATEGORY_DESCRIPTIONS[categoryName] ||
        `Discover our collection of ${categoryName.toLowerCase()} and interactive 3D printed models, perfect for display or as unique fidget toys.`;

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-6 pt-24">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to All Products
                </button>

                {/* HERO SECTION - Matching Figma Specs */}
                <div
                    className="w-full rounded-[24px] p-10 lg:p-16 text-white mb-10 shadow-xl"
                    style={{
                        background: `linear-gradient(135deg, #372AAC 0%, #1D4ED8 50%, #4A5565 100%)`,
                        minHeight: "262.5px",
                    }}
                >
                    <h1 className="text-[48px] font-black leading-tight mb-4 tracking-tight">
                        {categoryName?.charAt(0).toUpperCase() +
                            categoryName?.slice(1)}
                    </h1>
                    <p className="max-w-2xl text-[18px] font-normal opacity-90 leading-[29.25px] mb-8">
                        {categoryDescription}
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-5 py-2 border border-white/10">
                        <span className="text-sm font-black">
                            {products.length}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-widest">
                            Products
                        </span>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 border-b border-gray-100 pb-6">
                    <span className="text-sm font-medium text-gray-500">
                        Showing{" "}
                        <span className="text-black font-bold">
                            {products.length}
                        </span>{" "}
                        products
                    </span>
                    <div className="flex items-center gap-4">
                        <select className="appearance-none border border-gray-200 rounded-xl px-6 py-3 pr-10 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm">
                            <option>Sort by: Popularity</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* PRODUCT GRID - 4 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products.map((product) => (
                        <CategoryProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

function CategoryProductCard({ product }: { product: any }) {
    const { data: session } = useSession();
    const mainImage =
        product.images?.find((img: any) => img.isMain)?.url ||
        product.images?.[0]?.url;
    const variant = product.variants?.[0];

    const [isFavorite, setIsFavorite] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

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
        ).values(),
    ) as { name: string; hex: string }[];

    const sizeString =
        sizes.length > 0
            ? sizes.slice(0, 2).join(", ") + (sizes.length > 2 ? " & more" : "")
            : "One size";

    return (
        <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden w-full h-full transition-all hover:shadow-lg hover:border-gray-200">
            {/* Image */}
            <div
                className="relative overflow-hidden bg-[#f9f9f9]"
                style={{ aspectRatio: "1 / 0.9" }}
            >
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                        No image
                    </div>
                )}

                <button
                    onClick={handleToggleWishlist}
                    disabled={isWishlistLoading}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-400 shadow-sm backdrop-blur-md hover:text-red-500"
                >
                    {isWishlistLoading ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                        <Heart
                            size={20}
                            className={
                                isFavorite
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400"
                            }
                        />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Badge Slot (fixed height) */}
                <div className="mb-3 h-[32px] flex items-center">
                    {product.highlighted ? (
                        <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-medium text-[#372AAC] border-2 border-[#A3B3FF] bg-white">
                            Trending Now
                        </span>
                    ) : (
                        <span className="invisible px-4 py-1.5 text-[11px]">
                            Trending Now
                        </span>
                    )}
                </div>

                <h3 className="text-base font-medium text-[#101828] mb-2 line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-sm text-[#4A5565] mb-4 line-clamp-2">
                    {product.shortDescription}
                </p>

                {/* Sizes & Colors */}
                <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6A7282]">
                            Available Sizes:
                        </span>
                        <span className="text-xs text-[#364153]">
                            {sizeString}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6A7282]">
                            Colour Options:
                        </span>

                        {uniqueColors.length > 0 ? (
                            <div className="flex items-center gap-2">
                                {uniqueColors.slice(0, 5).map((c, i) => (
                                    <div
                                        key={i}
                                        title={c.name}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                            i === 0
                                                ? "border-black"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: c.hex }}
                                        />
                                    </div>
                                ))}
                                {uniqueColors.length > 5 && (
                                    <span className="text-[10px] text-gray-400">
                                        +{uniqueColors.length - 5}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-[#364153]">
                                Standard
                            </span>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#6A7282]">
                            Starts at
                        </span>
                        <span className="text-base font-semibold text-[#1a1a1a]">
                            ₹{variant?.price?.toLocaleString()}
                        </span>
                        {discount > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                                ₹{variant?.originalPrice?.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {discount > 0 && (
                        <span className="rounded-full bg-[#e8f5e9] px-2 py-1 text-[10px] font-semibold text-[#2e7d32]">
                            {discount}% OFF
                        </span>
                    )}
                </div>

                <span className="text-[10px] text-gray-400 mb-4">
                    (incl. GST)
                </span>

                <button className="w-full rounded-[10px] bg-[#1E1E1E] py-2.5 text-sm font-semibold text-white hover:bg-black active:scale-[0.97]">
                    Select Variants
                </button>
            </div>
        </div>
    );
}
