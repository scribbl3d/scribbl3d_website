"use client";

import { useState, useMemo, useEffect } from 'react';

interface Variant {
    id: string;
    colorId?: string;
    sizeId?: string;
    weightId?: string;
    price: number;
    originalPrice?: number;
    inStock: boolean;
}

interface Color {
    id: string;
    name: string;
    hexCode?: string;
    inStock: boolean;
}

interface Size {
    id: string;
    name: string;
    inStock: boolean;
}

interface Weight {
    id: string;
    weightInGrams: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    inStock: boolean;
}

interface Product {
    variants?: Variant[];
    colors?: Color[];
    sizes?: Size[];
    weights?: Weight[];
    price?: number;
    originalPrice?: number;
}

export function useVariantSelection(product: Product | null) {
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
    const [selectedWeightId, setSelectedWeightId] = useState<string | null>(null);

    // Auto-select first available variant on product load
    useEffect(() => {
        if (!product) return;
        
        // Auto-select first available color
        if (product.colors?.length && !selectedColorId) {
            const firstAvailable = product.colors.find(c => c.inStock);
            if (firstAvailable) setSelectedColorId(firstAvailable.id);
        }
        
        // Auto-select first available size
        if (product.sizes?.length && !selectedSizeId) {
            const firstAvailable = product.sizes.find(s => s.inStock);
            if (firstAvailable) setSelectedSizeId(firstAvailable.id);
        }
        
        // Auto-select first available weight
        if (product.weights?.length && !selectedWeightId) {
            const firstAvailable = product.weights.find(w => w.inStock);
            if (firstAvailable) setSelectedWeightId(firstAvailable.id);
        }
    }, [product]);

    // Reset selections when product changes
    useEffect(() => {
        if (!product) {
            setSelectedColorId(null);
            setSelectedSizeId(null);
            setSelectedWeightId(null);
        }
    }, [product?.variants]);

    // Find the selected variant
    const selectedVariant = useMemo(() => {
        if (!product?.variants) return null;
        
        return product.variants.find(v => {
            const colorMatch = !selectedColorId || v.colorId === selectedColorId;
            const sizeMatch = !selectedSizeId || v.sizeId === selectedSizeId;
            const weightMatch = !selectedWeightId || v.weightId === selectedWeightId;
            return colorMatch && sizeMatch && weightMatch;
        });
    }, [product, selectedColorId, selectedSizeId, selectedWeightId]);

    // Get selected weight (for resin products)
    const selectedWeight = useMemo(() => {
        if (!product?.weights || !selectedWeightId) return null;
        return product.weights.find(w => w.id === selectedWeightId) || null;
    }, [product?.weights, selectedWeightId]);

    // Determine if out of stock
    const isOutOfStock = selectedVariant?.inStock === false || selectedWeight?.inStock === false;
    
    // Get price (from variant, weight, or product)
    const price = selectedVariant?.price || selectedWeight?.price || product?.price || 0;
    const originalPrice = selectedVariant?.originalPrice || selectedWeight?.originalPrice || product?.originalPrice;
    
    // Calculate discount
    const discount = originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : selectedWeight?.discount || 0;

    // Get available colors based on current selection
    const availableColors = useMemo(() => {
        if (!product?.colors) return [];
        
        return product.colors.map(color => {
            const isAvailable = product.variants?.some(v => 
                v.colorId === color.id && 
                (!selectedSizeId || v.sizeId === selectedSizeId) &&
                (!selectedWeightId || v.weightId === selectedWeightId) &&
                v.inStock
            ) || color.inStock;
            
            return {
                ...color,
                available: isAvailable,
            };
        });
    }, [product, selectedSizeId, selectedWeightId]);

    // Get available sizes based on current selection
    const availableSizes = useMemo(() => {
        if (!product?.sizes) return [];
        
        return product.sizes.map(size => {
            const isAvailable = product.variants?.some(v => 
                v.sizeId === size.id && 
                (!selectedColorId || v.colorId === selectedColorId) &&
                (!selectedWeightId || v.weightId === selectedWeightId) &&
                v.inStock
            ) || size.inStock;
            
            return {
                ...size,
                available: isAvailable,
            };
        });
    }, [product, selectedColorId, selectedWeightId]);

    // Get available weights based on current selection
    const availableWeights = useMemo(() => {
        if (!product?.weights) return [];
        
        return product.weights.map(weight => ({
            ...weight,
            available: weight.inStock,
        }));
    }, [product?.weights]);

    // Check if color is out of stock
    const isColorOOS = selectedColorId 
        ? !availableColors.find(c => c.id === selectedColorId)?.available 
        : false;

    // Check if size is out of stock
    const isSizeOOS = selectedSizeId 
        ? !availableSizes.find(s => s.id === selectedSizeId)?.available 
        : false;

    // Check if weight is out of stock
    const isWeightOOS = selectedWeightId 
        ? selectedWeight?.inStock === false 
        : false;

    // Check if any selection is OOS
    const isAnyOOS = isColorOOS || isSizeOOS || isWeightOOS;

    return {
        // Selected IDs
        selectedColorId,
        selectedSizeId,
        selectedWeightId,
        
        // Setters
        setSelectedColorId,
        setSelectedSizeId,
        setSelectedWeightId,
        
        // Selected items
        selectedVariant,
        selectedWeight,
        
        // Stock status
        isOutOfStock,
        isColorOOS,
        isSizeOOS,
        isWeightOOS,
        isAnyOOS,
        
        // Price info
        price,
        originalPrice,
        discount,
        
        // Available options
        availableColors,
        availableSizes,
        availableWeights,
        
        // Metadata
        hasVariants: !!product?.variants?.length,
        hasColors: !!product?.colors?.length,
        hasSizes: !!product?.sizes?.length,
        hasWeights: !!product?.weights?.length,
    };
}
