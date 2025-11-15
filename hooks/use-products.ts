"use client";

import { useState, useEffect } from "react";

interface UseProductsOptions {
  category: string;
  highlighted?: boolean;
  limit?: number;
}

export function useProducts({
  category,
  highlighted = true,
  limit = 6,
}: UseProductsOptions) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          category,
          highlighted: String(highlighted),
          limit: String(limit),
        });

        const response = await fetch(`/api/prebuilt-products?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (isMounted) {
          setProducts(data);
        }

        // Fetch total count for the category (ignoring highlighted/limit)
        const countParams = new URLSearchParams({ category });
        const countResponse = await fetch(
          `/api/prebuilt-products/count?${countParams}`
        );
        if (countResponse.ok) {
          const countData = await countResponse.json();
          if (isMounted) {
            setTotalCount(countData.count);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        if (isMounted) {
          setError("Failed to load products. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [category, highlighted, limit]);

  return { products, isLoading, error, totalCount };
}
