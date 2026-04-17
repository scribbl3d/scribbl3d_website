"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { ProductRecommendations } from "@/components/product-recommendations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { getSizeLabel } from "@/lib/size-mapper";
import { useCart } from "@/providers/CartProvider";
import { Check, ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Producttabs from "./product-tabs";

interface Review {
    id: string;
    rating: number;
    title: string;
    content: string;
    userId: string;
    createdAt: string;
    user: {
        name: string | null;
    };
}

interface ProductSize {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    sizeType: string;
}

interface ProductColor {
    id: string;
    name: string;
    hexCode: string;
}

interface RelatedProduct {
    id: string;
    name: string;
    images: string[];
    sizes: {
        id: string;
        name: string;
        price: number;
        originalPrice: number;
    }[];
}

interface ProductPageProps {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    images: string[];
    isCustomizable: boolean;
    category: string;
    reviews: Review[];
    sizes: ProductSize[];
    colors: ProductColor[];
}

export default function ProductPage({
    id,
    name,
    price,
    originalPrice,
    images,
    category,
    sizes,
    colors,
}: ProductPageProps) {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPrice, setCurrentPrice] = useState(price);
    const [currentOriginalPrice, setCurrentOriginalPrice] =
        useState(originalPrice);
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (session) {
                try {
                    const response = await fetch(
                        `/api/wishlist/check?productId=${id}&isPrebuilt=true`,
                    );
                    if (!response.ok) {
                        throw new Error("Failed to check wishlist status");
                    }
                    const { isInWishlist: wishlistStatus } =
                        await response.json();
                    setIsInWishlist(wishlistStatus);
                } catch (error) {
                }
            }
        };

        checkWishlistStatus();
    }, [id, session]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/prebuilt-products/related?category=${encodeURIComponent(category)}&id=${encodeURIComponent(id)}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    },
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.error ||
                            `Failed to fetch related products: ${response.status}`,
                    );
                }

                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format from server");
                }

                setRelatedProducts(data as RelatedProduct[]);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load related products. Please try again later.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [category, id]);

    // const handleAddToCart = async () => {
    //     if (!session) {
    //         toast({
    //             title: "Authentication Required",
    //             description: "Please log in to add items to your cart.",
    //             variant: "destructive",
    //         });
    //         return;
    //     }

    //     // Auto-pick if only one option exists
    //     const effectiveSize = sizes.length === 1 ? sizes[0].id : selectedSize;

    //     const effectiveColor =
    //         colors.length === 1 ? colors[0].id : selectedColor;

    //     if (!effectiveSize || !effectiveColor) {
    //         toast({
    //             title: "Selection Required",
    //             description: "Please select a size and color.",
    //             variant: "destructive",
    //         });
    //         return;
    //     }

    //     setIsLoading(true);

    //     try {
    //         const sizeObj = sizes.find((s) => s.id === effectiveSize);
    //         const colorObj = colors.find((c) => c.id === effectiveColor);

    //         await addToCart({
    //             prebuiltProductId: id,
    //             quantity,

    //           
    //             prebuiltSize: sizeObj?.name,
    //             prebuiltColour: colorObj?.name,
    //         });

    //         toast({
    //             title: "Added to Cart",
    //             description: `${name} has been added to your cart.`,
    //         });
    //     } catch (err) {
    //         toast({
    //             title: "Error",
    //             description: "Failed to add item to cart.",
    //             variant: "destructive",
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleShareClick = () => {
        const productUrl = `https://scribbl3d.com/product/${id}`;
        navigator.clipboard
            .writeText(productUrl)
            .then(() => {
                toast({
                    title: "Link Copied!",
                    description: "Product link has been copied to clipboard",
                    duration: 2000,
                });
            })
            .catch((err) => {
                toast({
                    title: "Failed to copy",
                    description: "Please try again",
                    variant: "destructive",
                });
            });
    };

    const handleWishlistToggle = async () => {
        if (isWishlistLoading) return;

        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to your wishlist.",
                variant: "destructive",
                action: (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => signIn()}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        Log in
                    </Button>
                ),
            });
            return;
        }

        setIsWishlistLoading(true);
        try {
            const method = isInWishlist ? "DELETE" : "POST";
            const response = await fetch("/api/wishlist", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId: id, isPrebuilt: true }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update wishlist");
            }

            setIsInWishlist(!isInWishlist);
            toast({
                title: isInWishlist
                    ? "Removed from Wishlist"
                    : "Added to Wishlist",
                description: `${name} has been ${
                    isInWishlist ? "removed from" : "added to"
                } your wishlist.`,
            });
        } catch (err) {
            if (err instanceof Error) {
                toast({
                    title: "Error",
                    description:
                        err.message ||
                        "Failed to update wishlist. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsWishlistLoading(false);
        }
    };

    if (error) {
        return <div className="text-center text-red-500 mt-8">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-[1440px] w-full mx-auto px-4 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
                    {/* Product Images */}
                    <div className="space-y-4 w-full max-w-2xl mx-auto">
                        <div className="aspect-square w-full relative overflow-hidden rounded-lg bg-gray-100">
                            <Image
                                src={
                                    images[currentImageIndex] ||
                                    "/placeholder.svg"
                                }
                                alt={name}
                                fill
                                className="object-cover"
                                unoptimized={true} // Key prop
                            />
                        </div>
                        <div className="relative">
                            <div className="flex justify-center space-x-4 overflow-x-auto pb-2">
                                {images.slice(0, 4).map((image, i) => (
                                    <div
                                        key={i}
                                        className={`flex-none w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 cursor-pointer ${
                                            i === currentImageIndex
                                                ? "border-blue-900"
                                                : "border-transparent"
                                        }`}
                                        onClick={() => setCurrentImageIndex(i)}
                                    >
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`${name} ${i + 1}`}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover rounded-lg"
                                            unoptimized={true} // Key prop
                                        />
                                    </div>
                                ))}
                            </div>
                            {currentImageIndex > 0 && (
                                <button
                                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-lg"
                                    onClick={() =>
                                        setCurrentImageIndex(
                                            currentImageIndex - 1,
                                        )
                                    }
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            {currentImageIndex < images.length - 1 && (
                                <button
                                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-lg"
                                    onClick={() =>
                                        setCurrentImageIndex(
                                            currentImageIndex + 1,
                                        )
                                    }
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="w-full overflow-x-auto">
                            <Breadcrumb
                                items={[
                                    { label: "Home", href: "/" },
                                    {
                                        label: category
                                            .split("-")
                                            .map(
                                                (word) =>
                                                    word
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    word.slice(1),
                                            )
                                            .join(" "),
                                        href: `/${category.toLowerCase()}`,
                                    },
                                    { label: name, href: `/product/${id}` },
                                ]}
                            />
                        </div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-xl sm:text-[28px] font-inter font-semibold leading-normal">
                                    {name}
                                </h1>
                                <p className="text-[#B9BBBF] font-inter text-sm sm:text-base font-normal leading-normal">
                                    Scribbl3D
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg"
                                onClick={handleShareClick}
                            >
                                <Share2 className="h-6 w-6" />
                            </Button>
                        </div>
                        <hr className="my-4 border-gray-200" />
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[#3A4980] font-inter text-[34px] font-bold leading-normal">
                                    ₹{currentPrice}
                                </span>
                                <span className="text-[rgba(0,0,0,0.50)] font-inter text-[21px] font-normal leading-normal line-through">
                                    ₹{currentOriginalPrice}
                                </span>
                                <span className="text-[#4CAF50] font-lato bg-[#E8F5E9] text-[20px] font-medium px-2 py-[2px] rounded-full inline-block">
                                    {Math.round(
                                        ((currentOriginalPrice - currentPrice) /
                                            currentOriginalPrice) *
                                            100,
                                    )}
                                    % OFF
                                </span>
                            </div>
                        </div>
                        <hr className="my-4 border-gray-200" />

                        {/* Color Selection */}
                        {colors.length > 0 && (
                            <div className="space-y-4">
                                <Label className=" text-gray-400 font-inter font-medium text-[16px]">
                                    Choose a Color
                                </Label>
                                <RadioGroup
                                    value={selectedColor || ""}
                                    onValueChange={setSelectedColor}
                                    className="flex space-x-4"
                                >
                                    {colors.map((color) => (
                                        <div
                                            key={color.id}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <Label
                                                className={`relative w-[60px] h-[60px] rounded-full cursor-pointer border border-gray-200 ${
                                                    selectedColor === color.id
                                                        ? "ring-2 ring-offset-2 ring-[#2B3674]"
                                                        : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-200"
                                                }`}
                                            >
                                                <RadioGroupItem
                                                    value={color.id}
                                                    className="sr-only"
                                                />
                                                <span
                                                    className="block w-full h-full rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            color.hexCode,
                                                    }}
                                                />
                                                {selectedColor === color.id && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </span>
                                                )}
                                            </Label>
                                            <span className="text-sm text-gray-600 font-inter">
                                                {color.name}
                                            </span>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}
                        <hr className="my-4 border-gray-200" />
                        {/* Size Selection */}
                        {sizes.length > 0 && (
                            <div className="space-y-4">
                                <Label className="text-gray-400 font-inter font-medium text-[16px]">
                                    Choose a Size
                                </Label>
                                <div className="space-y-4">
                                    {/* Standard Sizes */}
                                    {sizes.filter(
                                        (size) => size.sizeType === "standard",
                                    ).length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-500">
                                                Standard Sizes
                                            </Label>
                                            <RadioGroup
                                                value={selectedSize || ""}
                                                onValueChange={(value) => {
                                                    setSelectedSize(value);
                                                    const selectedSizeData =
                                                        sizes.find(
                                                            (s) =>
                                                                s.id === value,
                                                        );
                                                    if (selectedSizeData) {
                                                        setCurrentPrice(
                                                            selectedSizeData.price,
                                                        );
                                                        setCurrentOriginalPrice(
                                                            selectedSizeData.originalPrice,
                                                        );
                                                    }
                                                }}
                                                className="flex flex-wrap gap-4"
                                            >
                                                {sizes
                                                    .filter(
                                                        (size) =>
                                                            size.sizeType ===
                                                            "standard",
                                                    )
                                                    .map((size) => (
                                                        <Label
                                                            key={size.id}
                                                            className={`relative px-4 py-2 border rounded-md cursor-pointer ${
                                                                selectedSize ===
                                                                size.id
                                                                    ? "border-[#2B3674] bg-[#2B3674] text-white"
                                                                    : "border-gray-300 hover:border-[#2B3674]"
                                                            }`}
                                                        >
                                                            <RadioGroupItem
                                                                value={size.id}
                                                                className="sr-only"
                                                            />
                                                            <span className="font-medium">
                                                                {getSizeLabel(
                                                                    size.name,
                                                                )}
                                                            </span>
                                                        </Label>
                                                    ))}
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* Fractional Sizes */}
                                    {sizes.filter(
                                        (size) =>
                                            size.sizeType === "fractional",
                                    ).length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-500">
                                                Fractional Sizes
                                            </Label>
                                            <RadioGroup
                                                value={selectedSize || ""}
                                                onValueChange={(value) => {
                                                    setSelectedSize(value);
                                                    const selectedSizeData =
                                                        sizes.find(
                                                            (s) =>
                                                                s.id === value,
                                                        );
                                                    if (selectedSizeData) {
                                                        setCurrentPrice(
                                                            selectedSizeData.price,
                                                        );
                                                        setCurrentOriginalPrice(
                                                            selectedSizeData.originalPrice,
                                                        );
                                                    }
                                                }}
                                                className="flex flex-wrap gap-4"
                                            >
                                                {sizes
                                                    .filter(
                                                        (size) =>
                                                            size.sizeType ===
                                                            "fractional",
                                                    )
                                                    .map((size) => (
                                                        <Label
                                                            key={size.id}
                                                            className={`relative px-4 py-2 border rounded-md cursor-pointer ${
                                                                selectedSize ===
                                                                size.id
                                                                    ? "border-[#2B3674] bg-[#2B3674] text-white"
                                                                    : "border-gray-300 hover:border-[#2B3674]"
                                                            }`}
                                                        >
                                                            <RadioGroupItem
                                                                value={size.id}
                                                                className="sr-only"
                                                            />
                                                            <span className="font-medium">
                                                                {getSizeLabel(
                                                                    size.name,
                                                                )}
                                                            </span>
                                                        </Label>
                                                    ))}
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* Custom Sizes */}
                                    {sizes.filter(
                                        (size) => size.sizeType === "custom",
                                    ).length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-500">
                                                Custom Sizes
                                            </Label>
                                            <RadioGroup
                                                value={selectedSize || ""}
                                                onValueChange={(value) => {
                                                    setSelectedSize(value);
                                                    const selectedSizeData =
                                                        sizes.find(
                                                            (s) =>
                                                                s.id === value,
                                                        );
                                                    if (selectedSizeData) {
                                                        setCurrentPrice(
                                                            selectedSizeData.price,
                                                        );
                                                        setCurrentOriginalPrice(
                                                            selectedSizeData.originalPrice,
                                                        );
                                                    }
                                                }}
                                                className="flex flex-wrap gap-4"
                                            >
                                                {sizes
                                                    .filter(
                                                        (size) =>
                                                            size.sizeType ===
                                                            "custom",
                                                    )
                                                    .map((size) => (
                                                        <Label
                                                            key={size.id}
                                                            className={`relative px-4 py-2 border rounded-md cursor-pointer ${
                                                                selectedSize ===
                                                                size.id
                                                                    ? "border-[#2B3674] bg-[#2B3674] text-white"
                                                                    : "border-gray-300 hover:border-[#2B3674]"
                                                            }`}
                                                        >
                                                            <RadioGroupItem
                                                                value={size.id}
                                                                className="sr-only"
                                                            />
                                                            <span className="font-medium">
                                                                {size.name}
                                                            </span>
                                                        </Label>
                                                    ))}
                                            </RadioGroup>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <hr className="my-4 border-gray-200" />
                        {/* Quantity and Add to Cart */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center bg-gray-100 rounded-xl px-3 py-2">
                                <button
                                    onClick={() =>
                                        setQuantity(Math.max(1, quantity - 1))
                                    }
                                    className="w-8 h-8 flex items-center justify-around text-[#2B3674] text-2xl font-medium pb-[4px]"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-bold text-xl text-[#2B3674]">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-[#2B3674] text-2xl font-medium pb-[3px]"
                                >
                                    +
                                </button>
                            </div>

                            {/* <Button
                                className="flex-1 bg-[#2B3674] hover:bg-[#1e2654] text-[16px] h-12 rounded-full font-inter font-semibold"
                                onClick={handleAddToCart}
                                disabled={
                                    isLoading ||
                                    // If multiple sizes/colors exist, require selection
                                    (sizes.length > 1 && !selectedSize) ||
                                    (colors.length > 1 && !selectedColor)
                                }
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Add To Cart
                            </Button> */}

                            <Button
                                variant="outline"
                                size="icon"
                                className={`h-12 w-12 rounded-lg ${
                                    isInWishlist ? "bg-red-100" : ""
                                }`}
                                onClick={handleWishlistToggle}
                                disabled={isWishlistLoading}
                            >
                                <Heart
                                    className={`h-6 w-6 ${
                                        isInWishlist
                                            ? "fill-red-500 text-red-500"
                                            : ""
                                    }`}
                                />
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Related Products */}
                <div className="mt-16">
                    <Producttabs productId={id} />
                </div>

                {/* Related Products */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-4">
                        Related Products
                    </h2>
                    {isLoading ? (
                        <div className="text-center">
                            Loading related products...
                        </div>
                    ) : (
                        <ProductRecommendations products={relatedProducts} />
                    )}
                </div>
            </main>
        </div>
    );
}
