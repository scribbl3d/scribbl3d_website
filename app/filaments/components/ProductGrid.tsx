"use client";

import { ProductTileA, ProductTileB } from "./ProductTiles";

interface ProductGridProps {
  products: any[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 justify-items-center">
      {products.map((product) =>
        product.tileType === "B" ? (
          <ProductTileB
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
            images={product.images}
            isInWishlist={product.isInWishlist || false}
            onWishlistToggle={async () => {}}
          />
        ) : (
          <ProductTileA
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
            images={product.images}
            isInWishlist={product.isInWishlist || false}
            onWishlistToggle={async () => {}}
          />
        )
      )}
    </div>
  );
}
