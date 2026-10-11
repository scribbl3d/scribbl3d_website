import axios from "axios";

/** Delhivery shipping charge quote (server-only: uses DELHIVERY_TOKEN). */

export type DelhiveryQuoteInput = {
    shippingMode: "Surface" | "Express";
    weight: number; // grams
    length: number; // cm
    breadth: number; // cm
    height: number; // cm
    originPincode: string;
    destinationPincode: string;
    paymentType: string; // e.g. "Pre-paid"
};

export type DelhiveryCharge = { total_amount?: number; charge?: number; [key: string]: unknown };

export class DelhiveryQuoteError extends Error {}

/** Charge object from Delhivery's invoice-charges API; throws DelhiveryQuoteError on failure */
export async function getDelhiveryCharge(input: DelhiveryQuoteInput): Promise<DelhiveryCharge> {
    if (!process.env.DELHIVERY_TOKEN) {
        throw new DelhiveryQuoteError("Shipping service not configured");
    }

    try {
        const res = await axios.get("https://track.delhivery.com/api/kinko/v1/invoice/charges/.json", {
            params: {
                md: input.shippingMode === "Surface" ? "S" : "E",
                ss: "Delivered",
                o_pin: input.originPincode,
                d_pin: input.destinationPincode,
                cgm: input.weight,
                pt: input.paymentType,
                l: input.length,
                b: input.breadth,
                h: input.height,
            },
            headers: { Authorization: `Token ${process.env.DELHIVERY_TOKEN}` },
            timeout: 8000,
        });

        const charge = (Array.isArray(res.data) ? res.data[0] : res.data) as DelhiveryCharge | undefined;
        if (!charge || (!charge.total_amount && !charge.charge)) {
            throw new DelhiveryQuoteError("No shipping charge returned");
        }
        return charge;
    } catch (err) {
        if (err instanceof DelhiveryQuoteError) throw err;
        const e = err as { message?: string; code?: string; response?: { status?: number } };
        console.error("[Delhivery quote] Failed:", { message: e.message, code: e.code, status: e.response?.status });
        throw new DelhiveryQuoteError("Failed to calculate shipping");
    }
}

export const chargeAmount = (charge: DelhiveryCharge) => Number(charge.total_amount || charge.charge || 0);
