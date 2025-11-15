"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Breadcrumb } from "@/components/breadcrumb";
import { getColorOrTexture, getContrastTextColor } from "@/lib/color-mappings";

import Producttabs from "./product-tabs";

import { signIn } from "next-auth/react";

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

interface FilamentSize {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
}

interface FilamentProductPageProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  reviews: Review[];
  sizes: FilamentSize[];
  material: string;
  diameter: string;
  weight: number;
  temperature: number;
}

export default function FilamentProductPage({
  id: initialId,
  name: initialName,
  price: initialPrice,
  originalPrice: initialOriginalPrice,
  images: initialImages,
  category,
  sizes,
  material,
  diameter,
  weight,
  temperature,
}: FilamentProductPageProps) {
  const [id, setId] = useState(initialId);
  const [name, setName] = useState(initialName);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [currentOriginalPrice, setCurrentOriginalPrice] =
    useState(initialOriginalPrice);
  const [images, setImages] = useState(initialImages);
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [availableColors, setAvailableColors] = useState<
    Record<string, string[]>
  >({});
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [colorCategories, setColorCategories] = useState<string[]>([]);
  const [selectedColorCategory, setSelectedColorCategory] = useState<
    string | null
  >(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchAvailableColors = async () => {
      try {
        const response = await fetch(
          `/api/available-colors?category=${category}`
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableColors(data.colors);
          setColorCategories(data.colorCategories);
          if (data.colorCategories.length > 0) {
            setSelectedColorCategory(data.colorCategories[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching available colors:", error);
      }
    };

    fetchAvailableColors();
  }, [category]);

  useEffect(() => {
    if (
      selectedColorCategory &&
      availableColors[selectedColorCategory]?.length > 0
    ) {
      setSelectedColor(availableColors[selectedColorCategory][0]);
    }
  }, [selectedColorCategory, availableColors]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (session) {
        try {
          const response = await fetch(
            `/api/wishlist/check?productId=${id}&isPrebuilt=false`
          );
          if (!response.ok) {
            throw new Error("Failed to check wishlist status");
          }
          const { isInWishlist: wishlistStatus } = await response.json();
          setIsInWishlist(wishlistStatus);
        } catch (error) {
          console.error("Error checking wishlist status:", error);
        }
      }
    };

    checkWishlistStatus();
  }, [id, session]);

  const handleAddToCart = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const cartItem = {
        productId: id,
        quantity,
        isPrebuilt: false,
        name,
        price: currentPrice,
        images: [images[0]], // Send only the first image
      };

      await addToCart(cartItem);

      toast({
        title: "Added to Cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart. Please try again.");
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = async (color: string) => {
    setIsLoadingProduct(true);
    setSelectedColor(color);

    try {
      const response = await fetch(
        `/api/products?category=${category}&color=${color}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const products = await response.json();

      if (!products || products.length === 0) {
        throw new Error("No product found with selected color");
      }

      const productData = products[0];

      setCurrentImageIndex(0);
      setCurrentPrice(productData.price);
      setCurrentOriginalPrice(productData.originalPrice);
      setName(productData.name);
      setImages(productData.images);

      // Update the product ID
      setId(productData.id);

      window.history.pushState(
        { productData },
        "",
        `/products/${productData.id}`
      );
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast({
        title: "Error",
        description: "Failed to load product details for selected color.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

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
        console.error("Failed to copy:", err);
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
        body: JSON.stringify({ productId: id, isPrebuilt: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update wishlist");
      }

      setIsInWishlist(!isInWishlist);
      toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: `${name} has been ${
          isInWishlist ? "removed from" : "added to"
        } your wishlist.`,
      });
    } catch (err) {
      console.error("Error updating wishlist:", err);
      if (err instanceof Error) {
        toast({
          title: "Error",
          description:
            err.message || "Failed to update wishlist. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const filteredColors =
    selectedColorCategory && availableColors[selectedColorCategory]
      ? availableColors[selectedColorCategory]
      : [];

  const colorCategorySection = (
    <div className="space-y-4">
      <Label className="text-gray-400 font-inter font-medium text-[16px]">
        Choose a Color Category
      </Label>
      <RadioGroup
        value={selectedColorCategory || ""}
        onValueChange={setSelectedColorCategory}
        className="flex flex-wrap gap-4"
      >
        {colorCategories.map((category) => (
          <Label
            key={category}
            className={`relative px-4 py-2 border rounded-md cursor-pointer ${
              selectedColorCategory === category
                ? "border-[#2B3674] bg-[#2B3674] text-white"
                : "border-gray-300 hover:border-[#2B3674]"
            }`}
          >
            <RadioGroupItem value={category} className="sr-only" />
            <span className="font-medium">{category}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );

  const colorSection = filteredColors.length > 0 && (
    <div className="space-y-4">
      <Label className="text-gray-400 font-inter font-medium text-[16px]">
        Choose a Color
      </Label>
      <RadioGroup
        value={selectedColor || ""}
        onValueChange={handleColorChange}
        className="flex flex-wrap gap-6"
      >
        {filteredColors.map((color) => (
          <div key={color} className="flex flex-col items-center">
            <Label
              className={`relative w-[60px] h-[60px] rounded-full cursor-pointer ${
                isLoadingProduct ? "opacity-50 cursor-not-allowed" : ""
              } ${
                selectedColor === color
                  ? "ring-2 ring-offset-2 ring-[#2B3674]"
                  : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-200"
              }`}
              style={{
                border: "2px solid #e5e7eb", // always show a border for contrast
                boxShadow:
                  color.toLowerCase() === "white"
                    ? "0 0 0 2px #888"
                    : undefined,
                background: "#fff",
              }}
            >
              <RadioGroupItem
                value={color}
                className="sr-only"
                disabled={isLoadingProduct}
              />
              <span
                className="block w-full h-full rounded-full relative overflow-hidden"
                style={{
                  backgroundColor: (() => {
                    const { type, value } = getColorOrTexture(color);
                    if (type === "texture") {
                      return "transparent";
                    }
                    return value;
                  })(),
                  border:
                    color.toLowerCase() === "white"
                      ? "2px solid #888"
                      : undefined,
                }}
              >
                {(() => {
                  const { type, value } = getColorOrTexture(color);
                  const colorName = color
                    .replace(
                      /(Matte|Gloss|Special Grade|Silk| PETG| NYLON| ABS| TPU)$/,
                      ""
                    )
                    .trim();
                  if (type === "texture") {
                    return (
                      <Image
                        src={value || "/placeholder.svg"}
                        alt={colorName}
                        fill
                        className="object-cover"
                        loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                        unoptimized={true} // Key prop
                      />
                    );
                  }
                  return null;
                })()}
                {selectedColor === color && (
                  <span
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                    style={{
                      color: getContrastTextColor(
                        getColorOrTexture(color).value
                      ),
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </span>
            </Label>
            <span className="mt-2 text-sm text-gray-600">
              {color
                .replace(
                  /(Matte|Gloss|Special Grade|Silk| PETG| NYLON| ABS| TPU)$/,
                  ""
                )
                .trim()}
            </span>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-[80px]">
      <main className="max-w-[1440px] w-full mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4 w-full max-w-2xl mx-auto relative">
            {/* Breadcrumbs for mobile: show above image */}
            <div className="block sm:hidden absolute top-2 left-2 right-2 z-20">
              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Filaments", href: "/filaments" },
                  {
                    label: category
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" "),
                    href: `/filaments/categories/${category.toLowerCase()}`,
                  },
                  { label: name, href: `/products/${id}` },
                ]}
              />
            </div>
            <div className="aspect-square w-full relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={name}
                fill
                className="object-cover"
                unoptimized={true} // Key prop
              />
              {/* Breadcrumbs for desktop: show below image as before */}
              <div className="hidden sm:block absolute top-2 left-2 right-2 z-20">
                <Breadcrumb
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Filaments", href: "/filaments" },
                    {
                      label: category
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" "),
                      href: `/filaments/categories/${category.toLowerCase()}`,
                    },
                    { label: name, href: `/products/${id}` },
                  ]}
                />
              </div>
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
                  onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentImageIndex < images.length - 1 && (
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-lg"
                  onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
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
                  { label: "Filaments", href: "/filaments" },
                  {
                    label: category
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" "),
                    href: `/filaments/categories/${category.toLowerCase()}`,
                  },
                  { label: name, href: `/products/${id}` },
                ]}
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-[28px] font-inter font-semibold leading-normal">
                  {name}
                </h1>
                <p className="text-[#B9BBBF] font-inter text-sm sm:text-base font-normal leading-normal">
                  Scribbl3D Filament
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
                      100
                  )}
                  % OFF
                </span>
              </div>
            </div>
            <hr className="my-4 border-gray-200" />

            {/* Filament Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-medium">{material}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Diameter</p>
                  <p className="font-medium">{diameter}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{weight}g</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Printing Temperature</p>
                  <p className="font-medium">{temperature}</p>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            {colorCategorySection}
            {colorSection}

            <hr className="my-4 border-gray-200" />

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="space-y-4">
                <Label className="text-gray-400 font-inter font-medium text-[16px]">
                  Choose a Size
                </Label>
                <RadioGroup
                  value={selectedSize || ""}
                  onValueChange={(value) => {
                    setSelectedSize(value);
                    const selectedSizeData = sizes.find((s) => s.id === value);
                    if (selectedSizeData) {
                      setCurrentPrice(selectedSizeData.price);
                      setCurrentOriginalPrice(selectedSizeData.originalPrice);
                    } else {
                      setCurrentPrice(initialPrice);
                      setCurrentOriginalPrice(initialOriginalPrice);
                    }
                  }}
                  className="flex flex-wrap gap-4"
                >
                  {sizes.map((size) => (
                    <Label
                      key={size.id}
                      className={`relative px-4 py-2 border rounded-md cursor-pointer ${
                        selectedSize === size.id
                          ? "border-[#2B3674] bg-[#2B3674] text-white"
                          : "border-gray-300 hover:border-[#2B3674]"
                      }`}
                    >
                      <RadioGroupItem value={size.id} className="sr-only" />
                      <span className="font-medium">{size.name}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}
            <hr className="my-4 border-gray-200" />

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center bg-gray-100 rounded-xl px-3 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
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

              <Button
                className="flex-1 bg-[#2B3674] hover:bg-[#1e2654] text-[16px] h-12 rounded-full font-inter font-semibold"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add To Cart
              </Button>

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
                    isInWishlist ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>
        {/* Product desc and review tab */}
        <div className="mt-16">
          <Producttabs productId={id} />
        </div>
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          {/*isLoading ? (
            <div className="text-center">Loading related products...</div>
          ) : (
            <ProductRecommendations products={relatedProducts} />
          )*/}
        </div>
      </main>
    </div>
  );
}
