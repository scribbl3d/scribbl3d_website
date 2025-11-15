"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";

export default function Figurine() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "Figurine",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title={
        <div className="flex items-center gap-2">
          <h2 className="text-[#333] font-lato text-2xl sm:text-3xl font-bold leading-[120%] tracking-normal pl-2 sm:pl-[60px]">
            Figurine
          </h2>
          <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full leading-normal">
            {totalCount ?? products.length}{" "}
            {(totalCount ?? products.length) === 1 ? "Product" : "Products"}
          </span>
        </div>
      }
      viewAllLink="/figurine"
      products={products}
      isLoading={isLoading}
      error={error}
    />
  );
}
