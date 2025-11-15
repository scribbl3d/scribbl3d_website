"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function WallDecor() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Wall-Decor",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Wall Decor"
      viewAllLink="/wall-decor"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
