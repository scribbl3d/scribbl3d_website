import { prisma } from "@/lib/prisma";

const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
const WAREHOUSE_PINCODE = "110041";

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Convert degrees to radians
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance); // Round to nearest kilometer
}

// Calculate shipping days based on distance
export function calculateShippingDays(distanceKm: number): number {
  if (distanceKm <= 100) return 1;
  if (distanceKm <= 500) return 2;
  if (distanceKm <= 1000) return 3;
  return 4;
}

// Format the delivery date
export function getEstimatedDeliveryDate(shippingDays: number): string {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + shippingDays);

  return deliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Main function to calculate shipping time
export async function calculateShippingTime(destinationPincode: string) {
  try {
    const [warehouseLocation, destinationLocation] = await Promise.all([
      prisma.pincodeLocation.findUnique({
        where: { pincode: WAREHOUSE_PINCODE },
      }),
      prisma.pincodeLocation.findUnique({
        where: { pincode: destinationPincode },
      }),
    ]);

    if (!warehouseLocation || !destinationLocation) {
      throw new Error("Invalid pincode");
    }

    const distance = calculateDistance(
      {
        latitude: warehouseLocation.latitude,
        longitude: warehouseLocation.longitude,
      },
      {
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
      }
    );

    const shippingDays = calculateShippingDays(distance);
    const estimatedDeliveryDate = getEstimatedDeliveryDate(shippingDays);

    return {
      distance,
      shippingDays,
      estimatedDeliveryDate,
      destinationCity: destinationLocation.city,
      destinationState: destinationLocation.state,
    };
  } catch {
    throw new Error("Error calculating shipping time");
  }
}
