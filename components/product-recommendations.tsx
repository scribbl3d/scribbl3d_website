import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ProductSize {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
}

interface Product {
  id: string;
  name: string;
  images: string[];
  sizes: ProductSize[];
}

interface ProductRecommendationsProps {
  products: Product[];
}

export function ProductRecommendations({
  products,
}: ProductRecommendationsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link href={`/product/${product.id}`} key={product.id}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="aspect-square relative mb-2">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                  unoptimized={true} // Key prop
                />
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                {product.name}
              </h3>
              {product.sizes.length > 0 ? (
                <p className="text-blue-900 font-bold">
                  From ₹{Math.min(...product.sizes.map((size) => size.price))}
                </p>
              ) : (
                <p className="text-blue-900 font-bold">Price not available</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
