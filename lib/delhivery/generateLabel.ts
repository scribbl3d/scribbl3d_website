// lib/delhivery/generateLabel.ts
import axios from "axios";

const DELHIVERY_LABEL_URL = "https://track.delhivery.com/api/p/packing_slip";

export async function generateDelhiveryLabel(waybill: string) {
    return axios.get(DELHIVERY_LABEL_URL, {
        params: {
            wbns: waybill,
            pdf: true,
            pdf_size: "4R",
        },
        headers: {
            Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
        },
        responseType: "arraybuffer", // ✅ REQUIRED
    });
}
