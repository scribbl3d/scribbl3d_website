export function mapOrderToDelhiveryShipment(order: any) {
    const shipping = order.shippingAddress as any;

    if (!shipping?.phone) {
        throw new Error("Shipping phone missing");
    }

    if (!shipping?.address || !shipping?.pincode) {
        throw new Error("Shipping address incomplete");
    }

    return {
        name: shipping.fullName || "Customer",
        phone: String(shipping.phone), // 🔥 MUST be string
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

        quantity: "1",
        weight: String(order.weightInGrams || 500),

        shipment_length: "10",
        shipment_width: "10",
        shipment_height: "10",

        address_type: "home",
        shipping_mode: "Surface",
        end_date: "2025-12-31",
    };
}
