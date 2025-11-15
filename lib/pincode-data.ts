import { prisma } from "@/lib/prisma";

export interface PincodeData {
  pincode: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

export async function importPincodeData(data: PincodeData[]) {
  try {
    // Create pincodes in batches of 100
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await prisma.pincodeLocation.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
    return true;
  } catch (error) {
    console.error("Error importing pincode data:", error);
    return false;
  }
}

export async function searchPincode(pincode: string) {
  try {
    const location = await prisma.pincodeLocation.findUnique({
      where: { pincode },
    });
    return location;
  } catch (error) {
    console.error("Error searching pincode:", error);
    return null;
  }
}

export async function searchPincodesByCity(city: string) {
  try {
    const locations = await prisma.pincodeLocation.findMany({
      where: {
        city: {
          contains: city,
          mode: "insensitive",
        },
      },
    });
    return locations;
  } catch (error) {
    console.error("Error searching pincodes by city:", error);
    return [];
  }
}

export async function searchPincodesByState(state: string) {
  try {
    const locations = await prisma.pincodeLocation.findMany({
      where: {
        state: {
          contains: state,
          mode: "insensitive",
        },
      },
    });
    return locations;
  } catch (error) {
    console.error("Error searching pincodes by state:", error);
    return [];
  }
}
