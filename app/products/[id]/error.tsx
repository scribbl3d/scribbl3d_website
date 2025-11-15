"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 mt-[150px]">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {error.message || "An error occurred while loading the product."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
