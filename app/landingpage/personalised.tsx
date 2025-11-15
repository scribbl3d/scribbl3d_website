"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Personalised() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Personalised",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title="Personalised"
      viewAllLink="/personalised"
      products={products}
      isLoading={isLoading}
      error={error}
      totalCount={totalCount}
    />
  );
}
