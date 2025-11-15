"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Kits() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Kits",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Kits"
      viewAllLink="/kits"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
