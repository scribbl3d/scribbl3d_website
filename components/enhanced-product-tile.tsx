"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCart } from "@/providers/CartProvider";
import { ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductProps {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    images: string[];
    description: string;
    isCustomizable: boolean;
    availableSizes: string[];
    isPrebuilt?: boolean;
    isPrinter?: boolean;
}

export default function EnhancedProductTile({
    id,
    name,
    price,
    originalPrice,
    images,
    description,
    isCustomizable,
    availableSizes,
    isPrebuilt,
    isPrinter,
}: ProductProps) {
    const [isHovered, setIsHovered] = useState(false);

    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    const { data: session } = useSession();
    const { addToCart } = useCart();
    const router = useRouter();
    const pathname = usePathname();

    const discountPercentage = Math.round(
        ((originalPrice - price) / originalPrice) * 100
    );

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname]);

    /* =========================
     HANDLERS
  ========================= */

    // 🔥 IMPORTANT: ONLY navigate when clicking the card itself
    const handleProductClick = (e: React.MouseEvent) => {
        setIsNavigating(true);
        router.push(`/product/${id}`);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCartLoading(true);

        try {
            if (isPrinter) {
                await addToCart({ printerId: id, quantity: 1 });
            } else if (isPrebuilt) {
                await addToCart({ prebuiltProductId: id, quantity: 1 });
            } else {
                await addToCart({ productId: id, quantity: 1 });
            }

            toast({
                title: "Added to cart",
                description: `${name} has been added to your cart.`,
            });
        } finally {
            setIsCartLoading(false);
        }
    };

    /* =========================
     RENDER
  ========================= */

    return (
        <div
            className="relative w-[300px] h-[530px] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProductClick}
        >
            {isNavigating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <div
                className={`absolute top-0 left-0 w-full bg-white transition-all duration-300 ease-in-out ${
                    isHovered ? "h-[530px]" : "h-[430px]"
                } overflow-hidden`}
            >
                <div
                    className={`absolute top-0 left-0 w-full transition-all duration-300 ease-in-out ${
                        isHovered ? "h-[340px]" : "h-[300px]"
                    } bg-gray-100`}
                ></div>

                {isCustomizable && (
                    <div className="absolute top-[8px] right-[8px] bg-white rounded-full w-[110px] h-[25px] flex items-center justify-center text-xs font-bold z-10 shadow-md">
                        <span className="font-inter text-[13px] text-[var(--www-scribbl-3-d-com-silver-chalice,#9E9E9E)] font-medium">
                            *Customisable
                        </span>
                    </div>
                )}

                <div className="pt-[36px] px-4 relative z-10">
                    <div className="relative w-[250px] h-[250px] mx-auto overflow-hidden rounded-lg">
                        <Image
                            src={images[0] || "/placeholder.svg"}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, 250px"
                            className={`object-cover transition-opacity duration-300 ease-in-out ${
                                isHovered ? "opacity-0" : "opacity-100"
                            }`}
                            unoptimized={true} // Key prop
                        />
                        <Image
                            src={images[1] || "/placeholder.svg"}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, 250px"
                            className={`object-cover transition-opacity duration-300 ease-in-out ${
                                isHovered ? "opacity-100" : "opacity-0"
                            }`}
                            unoptimized={true} // Key prop
                        />
                    </div>

                    <div
                        className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out ${
                            isHovered
                                ? "opacity-100 bottom-[-39px]"
                                : "opacity-0 bottom-[-30px]"
                        }`}
                    >
                        <Button
                            className="w-[150px] h-[30px] bg-blue-300 hover:bg-blue-400 rounded-full p-0"
                            onClick={handleAddToCart}
                            disabled={isCartLoading}
                        >
                            {isCartLoading ? (
                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <ShoppingCart className="h-4 w-4 mr-2 text-black" />
                                    <span className="text-black font-inter text-base font-medium leading-normal">
                                        Add to Cart
                                    </span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div
                    className={`pt-[20px] px-[20px] width-[250px] transition-all duration-300 ease-in-out ${
                        isHovered ? "mt-[40px]" : "mt-0"
                    }`}
                >
                    <h2 className="font-lato text-xl text-[#3A3A3A] line-clamp-2 leading-[24px]">
                        {name}
                    </h2>

                    <div className="flex items-center justify-between mt-0.5">
                        <div className="flex items-center">
                            <span className="text-[17px] font-bold font-lato leading-5">
                                ₹ {price}
                            </span>
                            <span className="ml-2 text-[13px] line-through text-gray-500 font-bold font-lato leading-5">
                                ₹{originalPrice}
                            </span>
                        </div>

                        <div
                            className={`
                bg-[#E8F5E9] text-[#4CAF50] text-[12px] font-[500] leading-3 text-lato
                px-3 py-3 rounded-full 
                transition-all duration-300 ease-in-out 
                overflow-hidden whitespace-nowrap
                ${isHovered ? "w-[160px]" : "w-[70px]"}
              `}
                        >
                            <div className="flex items-center justify-center h-full">
                                <span
                                    className={`
                    transition-opacity duration-300 ease-in-out absolute
                    ${isHovered ? "opacity-0" : "opacity-100"}
                  `}
                                >
                                    {discountPercentage}% OFF
                                </span>
                                <span
                                    className={`
                    transition-opacity duration-300 ease-in-out absolute
                    ${isHovered ? "opacity-100" : "opacity-0"}
                  `}
                                >
                                    AVAILABLE SIZES : {availableSizes.join(",")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-0.5 relative pt-[6px]">
                        <p
                            className={`font-lato text-[13px] font-bold leading-[16px] text-[#A6A6AA] ${
                                isHovered ? "overflow-visible" : "line-clamp-2"
                            }`}
                            style={{
                                ...(isHovered && {
                                    maxHeight: "none",
                                    zIndex: 9,
                                    position: "relative",
                                }),
                            }}
                        >
                            {description}
                        </p>
                        {!isHovered && (
                            <div className="absolute bottom-0 right-0 bg-white pl-1"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
