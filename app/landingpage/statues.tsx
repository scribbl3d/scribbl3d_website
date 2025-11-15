"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Statues() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Statues",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Statues"
      viewAllLink="/statues"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
