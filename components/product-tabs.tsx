"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Review } from "@/types/review";
import { StarRating } from "./reviews/star-rating";
import { RatingBar } from "./reviews/rating-bar";
import { ReviewCard } from "./reviews/review-card";
import { Button } from "@/components/ui/button";
import { calculateRatings } from "@/utils/calculate-ratings";

interface ProductTabsProps {
  productId: string;
  productType?: "product" | "prebuilt-product";
}

interface ProductDescription {
  productdesc: string | null;
  features: string[];
  productDetails: string[];
}

export default function ProductTabs({
  productId,
  productType,
}: ProductTabsProps) {
  const pathname = usePathname()!;

  // Dynamically determine product type if not explicitly provided
  const resolvedProductType: "product" | "prebuilt-product" =
    productType ??
    (pathname.startsWith("/product/") ? "prebuilt-product" : "product");

  const [description, setDescription] = useState<ProductDescription | null>(
    null
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductData() {
      try {
        setIsLoading(true);

        const descUrl =
          resolvedProductType === "prebuilt-product"
            ? `/api/prebuilt-products/${productId}/description`
            : `/api/products/${productId}`;

        const reviewsUrl =
          resolvedProductType === "prebuilt-product"
            ? `/api/prebuilt-products/${productId}/reviews`
            : `/api/products/${productId}/reviews`;

        const [descResponse, reviewsResponse] = await Promise.all([
          fetch(descUrl),
          fetch(reviewsUrl),
        ]);

        if (!descResponse.ok || !reviewsResponse.ok) {
          throw new Error("Failed to fetch product data");
        }

        const [descData, reviewsData] = await Promise.all([
          descResponse.json(),
          reviewsResponse.json(),
        ]);

        setDescription({
          productdesc: descData.productdesc || descData.description || "",
          features: descData.features || [],
          productDetails: descData.productDetails || [],
        });

        setReviews(reviewsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductData();
  }, [productId, resolvedProductType]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const { average, distribution } = calculateRatings(reviews);

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="border-b border-gray-200 w-full h-auto p-0 mb-8 bg-transparent">
        <div className="flex gap-8">
          <TabsTrigger
            value="description"
            className="px-0 pb-4 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-base font-medium data-[state=inactive]:text-gray-500 hover:text-blue-600 transition-colors"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="px-0 pb-4 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-base font-medium data-[state=inactive]:text-gray-500 hover:text-blue-600 transition-colors"
          >
            Reviews
          </TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="description" className="space-y-8">
        {description && (
          <>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Product Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {description.productdesc}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
              <ul className="space-y-3">
                {description.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-600"
                  >
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Product Details
              </h2>
              <ul className="space-y-3">
                {description.productDetails.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-600"
                  >
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </TabsContent>
      <TabsContent value="reviews" className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Customers Feedback
          </h2>
          <div className="flex gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {average}
              </div>
              <StarRating rating={average} />
              <div className="text-sm text-gray-600 mt-2">Product Rating</div>
            </div>
            <div className="flex-1 space-y-2">
              {distribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-4">
                  <StarRating rating={item.rating} size="sm" />
                  <RatingBar percentage={item.percentage} />
                  <span className="text-sm text-gray-600 w-12">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews</h2>
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700"
            >
              View All Reviews
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
