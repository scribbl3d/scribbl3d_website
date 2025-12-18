import { delhiveryClient } from "./trackingwaybill";

type GetTrackingParams = {
    waybill?: string;
    refIds?: string;
};

export async function getDelhiveryTracking({
    waybill,
    refIds = "",
}: GetTrackingParams) {
    if (!waybill && !refIds) {
        throw new Error("Either waybill or refIds is required for tracking");
    }

    const response = await delhiveryClient.get("/api/v1/packages/json/", {
        params: {
            waybill,
            ref_ids: refIds,
        },
    });

    return response.data;
}
