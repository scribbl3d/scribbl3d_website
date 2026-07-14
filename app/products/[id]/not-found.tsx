import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 mt-[150px]">
      <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Sorry, we could not find the product you are looking for.
      </p>
      <Button asChild>
        <Link href="/filament">Browse Filaments</Link>
      </Button>
    </div>
  );
}
