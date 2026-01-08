"use client";

import {
    ProductTileA,
    ProductTileB,
} from "@/app/filaments/components/ProductTiles";

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discount: number;
    images: string[];
    color: string;
    tileType: string;
}

export function ProductWrapper({ product }: { product: Product }) {
    const ProductTile = product.tileType === "A" ? ProductTileA : ProductTileB;

    return (
        <ProductTile
            id={product.id}
            name={product.name}
            price={product.price}
            originalPrice={product.originalPrice}
            discount={product.discount}
            images={product.images}
            color={product.color}
        />
    );
}
