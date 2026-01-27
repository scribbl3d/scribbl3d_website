import axios from "axios";
import qs from "qs";
const payload = {
    shipments: [
        {
            name: "Consignee name",
            phone: "9876543210",
            add: "Huda Market, Haryana",
            pin: "110042",
            city: "Gurugram",
            state: "Haryana",
            country: "India",
            order: "Test Order 01",
            payment_mode: "Prepaid",
            cod_amount: "0",
            total_amount: "500",
            quantity: "1",
            weight: "500",
            shipment_length: "10",
            shipment_width: "10",
            shipment_height: "10",
            shipping_mode: "Surface",
            address_type: "home",
            end_date: "2025-12-31",
        },
    ],
    pickup_location: { name: "Scribble3D Warehouse", end_date: "2025-12-31" },
};
axios
    .post(
        "https://track.delhivery.com/api/cmu/create.json",
        qs.stringify({ format: "json", data: JSON.stringify(payload) }),
        {
            headers: {
                Authorization: "Token d1b522c71ffaf712a7500e2d23b7e2114f34799e",
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
        },
    )
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err.response?.data || err.message));
