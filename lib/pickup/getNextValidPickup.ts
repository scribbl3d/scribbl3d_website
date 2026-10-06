import { PickupInfo } from "@/app/ops/control/orders/types";

export function getAllValidPickups(
    pickups?: PickupInfo[] | null,
): PickupInfo[] {
    if (!Array.isArray(pickups) || pickups.length === 0) return [];

    // The API already restricts results to pickupDate >= today using the
    // server's clock (and keeps a pickup visible for its whole scheduled
    // day, regardless of slot time). Re-deriving "today" here from the
    // browser's clock would risk disagreeing with the server near a day
    // boundary, so this only drops unparsable entries and sorts the rest
    // chronologically.
    return pickups
        .map((p) => {
            // pickupDate may arrive as a plain "YYYY-MM-DD" string or as a
            // full ISO datetime (e.g. from Prisma's serialized Date); keep
            // only the date part so it combines cleanly with pickupTime.
            const datePart = p.pickupDate.split("T")[0];
            return { pickup: p, dateTime: new Date(`${datePart}T${p.pickupTime}:00`) };
        })
        .filter(({ dateTime }) => !isNaN(dateTime.getTime()))
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
        .map(({ pickup }) => pickup);
}
