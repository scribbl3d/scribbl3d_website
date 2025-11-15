"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function TheLatest() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "The-Latest",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="The-Latest"
      viewAllLink="/the-latest"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
