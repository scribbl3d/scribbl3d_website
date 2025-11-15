"use client";
import ProductGrid from "./product-grid";
import { useProducts } from "@/hooks/use-products";
import { LottieAnimation } from "./_components/LottieAnimation";

export default function NewLaunch() {
  const { products, isLoading, error, totalCount } = useProducts({
    category: "New-Launch",
    highlighted: true,
    limit: 6,
  });

  return (
    <ProductGrid
      title={
        <div className="flex flex-col sm:flex-row items-start sm:items-center w-full max-w-full">
          <div className="relative inline-flex items-center w-full max-w-full">
            <LottieAnimation />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pl-0 sm:pl-[60px] py-2 sm:py-4 relative z-10 w-full max-w-full">
              <h2 className="text-[#1a237e] font-lato text-2xl sm:text-4xl font-bold leading-tight sm:leading-[43.2px] italic">
                New Launch
              </h2>
              <div
                className="flex-shrink-0 size-5 sm:size-8 bg-[#1a237e] flex items-center justify-center mt-2 sm:mt-0"
                style={{
                  clipPath:
                    "polygon(50% 0%, 61% 20%, 83% 12%, 83% 35%, 100% 50%, 83% 65%, 83% 88%, 61% 80%, 50% 100%, 39% 80%, 17% 88%, 17% 65%, 0% 50%, 17% 35%, 17% 12%, 39% 20%)",
                }}
              >
                <span className="text-white font-bold text-xs sm:text-sm">
                  !
                </span>
              </div>
              <span className="ml-0 sm:ml-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full leading-normal mt-2 sm:mt-0">
                {totalCount ?? products.length}{" "}
                {(totalCount ?? products.length) === 1 ? "Product" : "Products"}
              </span>
            </div>
          </div>
        </div>
      }
      viewAllLink="/new-launch"
      products={products}
      isLoading={isLoading}
      error={error}
      titleClassName="!p-0"
    />
  );
}
