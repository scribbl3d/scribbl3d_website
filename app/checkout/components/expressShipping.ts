import { CartItem } from "@/providers/CartProvider";

const BASE_FARE = 200;
const MAX_EXPRESS_WEIGHT = 10;

/* ---------- quantity slab ---------- */
function getSlabbedQuantity(qty: number) {
    if (qty === 1) return 1;
    if (qty === 2 || qty === 3) return 3;
    if (qty === 4 || qty === 5) return 5;
    if (qty > 5 && qty <= 10) return 10;
    return qty;
}

/* ---------- resolve weight ---------- */
function resolveWeight(item: CartItem): number {
    // resin size like "2000g"
    if (item.itemType === "resin" && item.size) {
        if (item.size.includes("g")) {
            return Number(item.size.replace("g", "")) / 1000;
        }
        if (item.size.includes("kg")) {
            return Number(item.size.replace("kg", ""));
        }
    }

    // defaults
    if (item.itemType === "prebuilt") return 1;
    if (item.itemType === "product") return 1;

    return 1;
}

/* ---------- main calculator ---------- */
export function calculateExpressShipping(cart: CartItem[]) {
    let totalWeight = 0;
    let totalPrice = 0;

    for (const item of cart) {
        const unitWeight = resolveWeight(item);

        switch (item.itemType) {
            case "printer": {
                const weight = unitWeight * item.quantity;
                totalWeight += weight;
                totalPrice += BASE_FARE * weight;
                break;
            }

            case "prebuilt": {
                totalWeight += item.quantity;
                totalPrice += BASE_FARE * item.quantity;
                break;
            }

            case "resin":
            case "product": {
                const slabQty = getSlabbedQuantity(item.quantity);
                const weight = unitWeight * slabQty;
                totalWeight += weight;
                totalPrice += BASE_FARE * weight;
                break;
            }
        }
    }

    if (totalWeight > MAX_EXPRESS_WEIGHT) {
        return {
            allowed: false,
            price: 0,
            reason: "Express shipping not allowed for orders above 10kg",
        };
    }

    return {
        allowed: true,
        price: Math.round(totalPrice),
    };
}
