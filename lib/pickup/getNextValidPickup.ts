import { PickupInfo } from "@/app/ops/control/orders/types";

export function getNextValidPickup(
    pickups?: PickupInfo[] | null,
): PickupInfo | null {
    if (!Array.isArray(pickups) || pickups.length === 0) return null;

    const now = new Date();

    const futurePickups = pickups
        .map((p) => ({
            ...p,
            dateTime: new Date(`${p.pickupDate}T${p.pickupTime}:00`),
        }))
        .filter((p) => !isNaN(p.dateTime.getTime()))
        .filter((p) => p.dateTime > now)
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    return futurePickups.length ? futurePickups[0] : null;
}
