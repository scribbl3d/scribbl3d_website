import axios from "axios";

const DELHIVERY_BASE_URL = "https://staging-express.delhivery.com/";

export const delhiveryClient = axios.create({
    baseURL: DELHIVERY_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
    },
    timeout: 10_000, // safety
});
