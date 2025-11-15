"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IndianRupee, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  productId: string | null;
  prebuiltProductId: string | null;
  wishlistId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
  prebuiltProduct: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
}

interface WishlistProps {
  initialWishlist: WishlistItem[];
}

export function Wishlist({ initialWishlist }: WishlistProps) {
  const [items, setItems] = useState<WishlistItem[]>(initialWishlist);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // id of item being acted on

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setItems(data);
    } catch (e: any) {
      setError(e.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item: WishlistItem) {
    setActionLoading(item.id);
    const isPrebuilt = !!item.prebuiltProduct;
    const productId = isPrebuilt ? item.prebuiltProduct?.id : item.product?.id;
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isPrebuilt }),
      });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e: any) {
      setError(e.message || "Failed to remove from wishlist");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    setActionLoading(item.id);
    const isPrebuilt = !!item.prebuiltProduct;
    const productId = isPrebuilt ? item.prebuiltProduct?.id : item.product?.id;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isPrebuilt, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      // Optionally remove from wishlist after adding to cart
      await handleDelete(item);
    } catch (e: any) {
      setError(e.message || "Failed to add to cart");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-lg text-gray-400">
        Loading wishlist...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12 text-lg text-red-500">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Your Wishlist
      </h1>
      {items.length === 0 ? (
        <div className="text-gray-400 text-center py-12 text-lg">
          No wishlist items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const prod = item.product || item.prebuiltProduct;
            if (!prod) return null;
            // Determine the correct product URL
            const productUrl = item.prebuiltProduct
              ? `/product/${item.prebuiltProduct.id}`
              : `/products/${item.product?.id}`;
            return (
              <Link
                key={item.id}
                href={productUrl}
                className="block group"
                style={{ textDecoration: "none" }}
              >
                <Card
                  className="relative flex flex-col rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 p-5 bg-white group cursor-pointer"
                  style={{
                    minHeight: 370,
                    minWidth: 320,
                    maxWidth: 400,
                    maxHeight: 400,
                    width: "100%",
                  }}
                  onClick={(e) => {
                    // Prevent navigation when clicking action buttons
                    if ((e.target as HTMLElement).closest(".action-btn")) {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* Image Area (occupies max space) */}
                  <div className="flex flex-1 items-center justify-center px-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={prod.images?.[0] || "/placeholder.svg"}
                        alt={prod.name}
                        className="object-contain"
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "100%",
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="mt-2">
                    {/* Row 1: Title & Price */}
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-[16px] text-gray-900 truncate max-w-[60%]">
                        {prod.name}
                      </div>
                      <div className="font-bold text-primary text-[18px] flex items-center gap-1">
                        <IndianRupee className="w-5 h-5" />
                        {prod.price}
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="action-btn w-[45px] h-[45px] flex items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow hover:bg-red-100 hover:text-red-700 border border-gray-200 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(item);
                      }}
                      disabled={actionLoading === item.id}
                      aria-label="Delete from wishlist"
                      style={{ minWidth: 44, minHeight: 44 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Button
                      className="action-btn flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow hover:from-blue-600 hover:to-blue-800 hover:scale-105 transition-all text-base font-semibold min-h-[45px]"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(item);
                      }}
                      disabled={actionLoading === item.id}
                      style={{ minHeight: 44 }}
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
