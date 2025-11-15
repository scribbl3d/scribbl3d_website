import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          } ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`}
        />
      ))}
    </div>
  );
}
