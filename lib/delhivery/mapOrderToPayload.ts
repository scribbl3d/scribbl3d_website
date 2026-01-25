// lib/delhivery/mapOrderToPayload.ts
export function mapOrderToDelhiveryShipment(input: any) {
    const { order, shipping_mode, dimensions, weight, quantity } = input;

    const shipping = order.shippingAddress as any;

    if (!shipping?.phone) {
        throw new Error("Shipping phone missing");
    }

    if (!shipping?.address || !shipping?.pincode) {
        throw new Error("Shipping address incomplete");
    }

    return {
        name: shipping.fullName || "Customer",
        phone: String(shipping.phone),
        add: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pin: String(shipping.pincode),
        country: "India",

        order: order.id,

        payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",

        cod_amount:
            order.paymentMethod === "COD" ? String(order.totalAmount) : "0",

        total_amount: String(order.totalAmount),

        quantity: String(quantity),
        weight: String(weight), // grams

        shipment_length: String(dimensions.length),
        shipment_width: String(dimensions.breadth),
        shipment_height: String(dimensions.height),

        address_type: "home",
        shipping_mode: shipping_mode === "Express" ? "Express" : "Surface",

        end_date: "2026-12-31",
    };
}
