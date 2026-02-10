import { CartItem } from "@/providers/CartProvider";

const MAX_EXPRESS_WEIGHT = 100; // kg
const PREBUILT_WEIGHT_KG = 0.75; // 750 grams per prebuilt
const ORIGIN_PINCODE = "110041"; // Your warehouse pincode - UPDATE THIS

// Box dimensions for resin/filament/prebuilt (in cm)
const BOX_DIMENSIONS: Record<
    number,
    { length: number; breadth: number; height: number }
> = {
    1: { length: 22, breadth: 21, height: 8 },
    3: { length: 27.5, breadth: 25.5, height: 25.5 },
    5: { length: 42, breadth: 21, height: 21 },
    10: { length: 42, breadth: 38, height: 21 },
};

// Default printer box dimensions (fallback if no dimensions provided)
const DEFAULT_PRINTER_BOX = { length: 60, breadth: 60, height: 60 }; // cm
const DEFAULT_PRINTER_WEIGHT_KG = 15;

/* ---------- quantity slab ---------- */
function getSlabbedQuantity(qty: number): number {
    if (qty === 1) return 1;
    if (qty === 2 || qty === 3) return 3;
    if (qty === 4 || qty === 5) return 5;
    if (qty > 5 && qty <= 10) return 10;
    return qty;
}

/* ---------- get box for slab ---------- */
function getBoxForSlab(slabQty: number) {
    if (slabQty <= 1) return BOX_DIMENSIONS[1];
    if (slabQty <= 3) return BOX_DIMENSIONS[3];
    if (slabQty <= 5) return BOX_DIMENSIONS[5];
    return BOX_DIMENSIONS[10];
}

/* ---------- resolve weight for resin ---------- */
function resolveResinWeight(size: string | null | undefined): number {
    if (!size) return 1;
    if (size.includes("g")) {
        return Number(size.replace("g", "")) / 1000;
    }
    if (size.includes("kg")) {
        return Number(size.replace("kg", ""));
    }
    return 1;
}

/* ---------- Types for shipping calculation ---------- */
export interface ShippingItem {
    weight: number; // in grams for API
    length: number; // in cm
    breadth: number; // in cm
    height: number; // in cm
    itemType: string;
    quantity: number;
}

export interface ExpressShippingResult {
    allowed: boolean;
    items: ShippingItem[];
    totalWeightKg: number;
    reason?: string;
}

/* ---------- main calculator ---------- */
export function prepareExpressShippingItems(
    cart: CartItem[],
): ExpressShippingResult {
    const items: ShippingItem[] = [];
    let totalWeightKg = 0;

    for (const item of cart) {
        switch (item.itemType) {
            case "printer": {
                // Weight from API is in grams as string (e.g., "21000" = 21kg)
                // Convert to kg for calculation
                const weightValue = item.weight ? Number(item.weight) : 0;
                const printerWeightKg =
                    weightValue > 1000
                        ? weightValue / 1000 // It's in grams, convert to kg
                        : weightValue || DEFAULT_PRINTER_WEIGHT_KG; // It's already in kg or use default

                // Machine dimensions are in mm, convert to cm
                // Add ~20cm buffer for packaging
                const length = item.machineDimensionLength
                    ? Math.ceil(item.machineDimensionLength / 10) + 20
                    : DEFAULT_PRINTER_BOX.length;
                const breadth = item.machineDimensionWidth
                    ? Math.ceil(item.machineDimensionWidth / 10) + 20
                    : DEFAULT_PRINTER_BOX.breadth;
                const height = item.machineDimensionHeight
                    ? Math.ceil(item.machineDimensionHeight / 10) + 20
                    : DEFAULT_PRINTER_BOX.height;

                // Each printer is a separate shipment
                for (let i = 0; i < item.quantity; i++) {
                    totalWeightKg += printerWeightKg;
                    items.push({
                        weight: printerWeightKg * 1000, // Convert to grams for API
                        length,
                        breadth,
                        height,
                        itemType: "printer",
                        quantity: 1,
                    });
                }
                break;
            }

            case "prebuilt": {
                // Each prebuilt is 750g, use box based on quantity slab
                const slabQty = getSlabbedQuantity(item.quantity);
                const box = getBoxForSlab(slabQty);
                const weightKg = PREBUILT_WEIGHT_KG * item.quantity;

                totalWeightKg += weightKg;
                items.push({
                    weight: weightKg * 1000, // grams
                    length: box.length,
                    breadth: box.breadth,
                    height: box.height,
                    itemType: "prebuilt",
                    quantity: item.quantity,
                });
                break;
            }

            case "resin":
            case "product": {
                const slabQty = getSlabbedQuantity(item.quantity);
                const box = getBoxForSlab(slabQty);
                const unitWeight = resolveResinWeight(item.size);
                const totalItemWeight = unitWeight * item.quantity;

                totalWeightKg += totalItemWeight;
                items.push({
                    weight: totalItemWeight * 1000, // grams
                    length: box.length,
                    breadth: box.breadth,
                    height: box.height,
                    itemType: item.itemType,
                    quantity: item.quantity,
                });
                break;
            }
        }
    }

    if (totalWeightKg > MAX_EXPRESS_WEIGHT) {
        return {
            allowed: false,
            items: [],
            totalWeightKg,
            reason: "Express shipping not allowed for orders above 10kg",
        };
    }

    return {
        allowed: true,
        items,
        totalWeightKg,
    };
}

/* ---------- Calculate total shipping by calling Delhivery API ---------- */
export async function calculateExpressShippingPrice(
    cart: CartItem[],
    destinationPincode: string,
    originPincode: string = ORIGIN_PINCODE,
): Promise<{
    allowed: boolean;
    price: number;
    totalWeightKg: number;
    reason?: string;
}> {
    const prepared = prepareExpressShippingItems(cart);

    if (!prepared.allowed) {
        return {
            allowed: false,
            price: 0,
            totalWeightKg: prepared.totalWeightKg,
            reason: prepared.reason,
        };
    }

    try {
        let totalPrice = 0;

        // Calculate shipping for each item/box
        for (const item of prepared.items) {
            const response = await fetch("/api/internal/calculate-shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shippingMode: "Express",
                    weight: item.weight, // in grams
                    length: item.length,
                    breadth: item.breadth,
                    height: item.height,
                    originPincode,
                    destinationPincode,
                    paymentType: "Pre-paid",
                }),
            });

            const data = await response.json();

            if (!data.ok) {
                throw new Error(data.error || "Failed to calculate shipping");
            }

            const charge =
                data.charge?.total_amount || data.charge?.charge || 0;
            totalPrice += charge;
        }

        return {
            allowed: true,
            price: Math.round(totalPrice),
            totalWeightKg: prepared.totalWeightKg,
        };
    } catch (error) {
        console.error("Express shipping calculation error:", error);
        throw error;
    }
}

/* ---------- Quick estimate without API call (for initial UI) ---------- */
const BASE_FARE_PER_KG = 200;

export function estimateExpressShipping(cart: CartItem[]): {
    allowed: boolean;
    estimatedPrice: number;
    totalWeightKg: number;
    reason?: string;
} {
    const prepared = prepareExpressShippingItems(cart);

    if (!prepared.allowed) {
        return {
            allowed: false,
            estimatedPrice: 0,
            totalWeightKg: prepared.totalWeightKg,
            reason: prepared.reason,
        };
    }

    const estimatedPrice = Math.round(
        prepared.totalWeightKg * BASE_FARE_PER_KG,
    );

    return {
        allowed: true,
        estimatedPrice,
        totalWeightKg: prepared.totalWeightKg,
    };
}

/* ---------- Backwards compatibility (estimate only) ---------- */
export function calculateExpressShipping(cart: CartItem[]): {
    allowed: boolean;
    price: number;
    reason?: string;
} {
    const result = estimateExpressShipping(cart);
    return {
        allowed: result.allowed,
        price: result.estimatedPrice,
        reason: result.reason,
    };
}
