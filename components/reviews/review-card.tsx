import { StarRating } from "./star-rating";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Review } from "@/types/review";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const userInitials = review.user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="py-6 border-b border-gray-200 last:border-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-600 text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{review.user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <h4 className="font-medium mt-2">{review.title}</h4>
          <p className="mt-2 text-gray-600">{review.content}</p>
          <div className="flex items-center gap-4 mt-4">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <ThumbsUp className="h-4 w-4 mr-1" />
              Like
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
