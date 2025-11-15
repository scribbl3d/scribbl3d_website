"use client";

import { useState, useEffect } from "react";
import {
  ProductTileA,
  ProductTileB,
} from "@/app/filaments/components/ProductTiles";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  color: string;
  tileType: string;
}

export function ProductWrapper({ product }: { product: Product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    // Check if product is in wishlist on component mount
    const checkWishlist = async () => {
      try {
        const res = await fetch(`/api/wishlist`);
        if (res.ok) {
          const wishlist = await res.json();
          setIsInWishlist(
            wishlist.some((item: any) => item.productId === product.id)
          );
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };
    checkWishlist();
  }, [product.id]);

  const handleWishlistToggle = async () => {
    try {
      const endpoint = `/api/wishlist/${product.id}`;
      const method = isInWishlist ? "DELETE" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      throw error; // Let the ProductTile component handle the error
    }
  };

  const ProductTile = product.tileType === "A" ? ProductTileA : ProductTileB;

  return (
    <ProductTile
      id={product.id}
      name={product.name}
      price={product.price}
      originalPrice={product.originalPrice}
      discount={product.discount}
      images={product.images}
      color={product.color}
      isInWishlist={isInWishlist}
      onWishlistToggle={handleWishlistToggle}
    />
  );
}
