"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Utilities() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Utilities",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Utilities"
      viewAllLink="/utilities"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
