import { extractDeliveredAt, parseDelhiveryDate } from "@/lib/reviews/deliveredAt";

const wrap = (shipment: any) => ({ ShipmentData: [{ Shipment: shipment }] });

describe("parseDelhiveryDate", () => {
    it("treats timestamps without an offset as IST", () => {
        expect(parseDelhiveryDate("2025-05-12T14:30:00")?.toISOString()).toBe(
            "2025-05-12T09:00:00.000Z",
        );
    });

    it("keeps an explicit offset", () => {
        expect(parseDelhiveryDate("2025-05-12T14:30:00Z")?.toISOString()).toBe(
            "2025-05-12T14:30:00.000Z",
        );
    });

    it("returns null for empty or invalid values", () => {
        expect(parseDelhiveryDate("")).toBeNull();
        expect(parseDelhiveryDate(null)).toBeNull();
        expect(parseDelhiveryDate("not a date")).toBeNull();
    });
});

describe("extractDeliveredAt", () => {
    it("prefers DeliveryDate", () => {
        const date = extractDeliveredAt(
            wrap({
                DeliveryDate: "2025-05-12T10:00:00",
                Status: { Status: "Delivered", StatusDateTime: "2025-05-13T10:00:00" },
            }),
        );
        expect(date?.toISOString()).toBe("2025-05-12T04:30:00.000Z");
    });

    it("uses the status time when status is Delivered", () => {
        const date = extractDeliveredAt(
            wrap({ Status: { Status: "Delivered", StatusDateTime: "2025-05-13T10:00:00" } }),
        );
        expect(date?.toISOString()).toBe("2025-05-13T04:30:00.000Z");
    });

    it("ignores the status time when not delivered", () => {
        const date = extractDeliveredAt(
            wrap({ Status: { Status: "In Transit", StatusDateTime: "2025-05-13T10:00:00" } }),
        );
        expect(date).toBeNull();
    });

    it("falls back to the latest Delivered scan", () => {
        const date = extractDeliveredAt(
            wrap({
                Status: { Status: "RTO" },
                Scans: [
                    { ScanDetail: { Scan: "Delivered", ScanDateTime: "2025-05-10T08:00:00" } },
                    { ScanDetail: { Scan: "In Transit", ScanDateTime: "2025-05-11T08:00:00" } },
                    { ScanDetail: { Scan: "Delivered", ScanDateTime: "2025-05-12T08:00:00" } },
                ],
            }),
        );
        expect(date?.toISOString()).toBe("2025-05-12T02:30:00.000Z");
    });

    it("returns null for missing or malformed data", () => {
        expect(extractDeliveredAt(null)).toBeNull();
        expect(extractDeliveredAt({})).toBeNull();
        expect(extractDeliveredAt(wrap({ Scans: "bad" }))).toBeNull();
    });
});
