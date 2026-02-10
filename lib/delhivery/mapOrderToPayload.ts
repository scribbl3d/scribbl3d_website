// lib/delhivery/mapOrderToPayload.ts

/**
 * Map order to Delhivery Single Package Shipment (SPS) format
 */
export function mapOrderToDelhiveryShipment(input: any) {
    const { order, shipping_mode, dimensions, weight, quantity } = input;

    const shipping = order.shippingAddress as any;

    if (!shipping?.phone) {
        throw new Error("Shipping phone missing");
    }

    if (!shipping?.address || !shipping?.pincode) {
        throw new Error("Shipping address incomplete");
    }

    // Build product description from order items if available
    const productsDesc =
        order.items
            ?.map((item: any) => item.name)
            .join(", ")
            .slice(0, 100) || "";

    return {
        // Consignee details
        name: shipping.fullName || "Customer",
        phone: String(shipping.phone),
        add: shipping.address,
        city: shipping.city || "",
        state: shipping.state || "",
        pin: String(shipping.pincode),
        country: "India",
        address_type: shipping.addressType || "home",

        // Order details
        order: order.id,
        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
        cod_amount:
            order.paymentMethod === "COD" ? String(order.totalAmount) : "0",
        total_amount: String(order.totalAmount),

        // Package details
        quantity: String(quantity),
        weight: String(weight), // grams
        shipment_length: String(dimensions.length),
        shipment_width: String(dimensions.breadth),
        shipment_height: String(dimensions.height),

        // Shipping mode
        shipping_mode: shipping_mode === "Express" ? "Express" : "Surface",

        // Optional fields
        products_desc: productsDesc,
        seller_name: "Scribble3D",
    };
}

/**
 * Map order to Delhivery Multi-Package Shipment (MPS) format
 *
 * MPS specific fields:
 * - shipment_type: "MPS"
 * - master_id: The master waybill that tracks the entire shipment
 * - mps_children: Total number of packages (master + children)
 * - mps_amount: COD amount (0 for prepaid, actual amount only on master for COD)
 * - waybill: Pre-fetched waybill for this specific package
 */
export function mapOrderToMPSShipments(input: {
    order: any;
    shipping_mode: string;
    packages: Array<{
        dimensions: {
            length: number;
            breadth: number;
            height: number;
        };
        weight: number;
        quantity: number;
        products_desc?: string;
    }>;
    masterWaybill: string;
    waybills: string[];
}) {
    const { order, shipping_mode, packages, masterWaybill, waybills } = input;

    const shipping = order.shippingAddress as any;

    if (!shipping?.phone) {
        throw new Error("Shipping phone missing");
    }

    if (!shipping?.address || !shipping?.pincode) {
        throw new Error("Shipping address incomplete");
    }

    const packageCount = packages.length;
    const isCOD = order.paymentMethod === "COD";

    // Build default product description from order items
    const defaultProductsDesc =
        order.items
            ?.map((item: any) => item.name)
            .join(", ")
            .slice(0, 100) || "";

    return packages.map((pkg, index) => {
        const isFirstPackage = index === 0;
        const waybill = waybills[index];

        return {
            // Consignee details (same for all packages)
            name: shipping.fullName || "Customer",
            phone: String(shipping.phone),
            add: shipping.address,
            city: shipping.city || "",
            state: shipping.state || "",
            pin: String(shipping.pincode),
            country: "India",
            address_type: shipping.addressType || "home",

            // Order details
            order: order.id,
            payment_mode: isCOD ? "COD" : "Prepaid",

            // COD amount - only set on first package for COD orders
            cod_amount:
                isCOD && isFirstPackage ? String(order.totalAmount) : "0",

            // Total amount
            total_amount: String(order.totalAmount),

            // Package-specific details
            quantity: String(pkg.quantity),
            weight: String(pkg.weight), // grams
            shipment_length: String(pkg.dimensions.length),
            shipment_width: String(pkg.dimensions.breadth),
            shipment_height: String(pkg.dimensions.height),

            // Shipping mode
            shipping_mode: shipping_mode === "Express" ? "Express" : "Surface",

            // Product description - use package-specific or default
            products_desc: pkg.products_desc || defaultProductsDesc,

            // MPS-specific fields
            shipment_type: "MPS",
            master_id: masterWaybill,
            mps_children: String(packageCount),
            mps_amount: isCOD ? String(order.totalAmount) : "0",
            waybill: waybill, // Pre-fetched waybill

            // Optional fields
            seller_name: "Scribble3D",
        };
    });
}
