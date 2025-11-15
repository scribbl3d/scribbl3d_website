"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Lamps() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Lamps",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Lamps"
      viewAllLink="/lamps"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
