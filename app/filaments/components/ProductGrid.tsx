"use client";

import { ProductTileA, ProductTileB } from "./ProductTiles";

interface ProductGridProps {
    products: any[];
    title?: string;
    viewAllHref?: string;
}

export default function ProductGrid({
    products,
    title,
    viewAllHref,
}: ProductGridProps) {
    return (
        <section className="mb-16">
            {/* Header */}
            {(title || viewAllHref) && (
                <div className="flex justify-between items-center mb-6 px-1">
                    {title && (
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            {title}
                        </h2>
                    )}

                    {viewAllHref && (
                        <a
                            href={viewAllHref}
                            className="text-sm font-medium text-blue-600 hover:underline"
                        >
                            View All →
                        </a>
                    )}
                </div>
            )}

            {/* Grid */}
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
                        />
                    )
                )}
            </div>
        </section>
    );
}
