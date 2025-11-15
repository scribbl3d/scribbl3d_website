"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function TrendingNow() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Trending-Now",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Trending Now"
      viewAllLink="/trending-now"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
