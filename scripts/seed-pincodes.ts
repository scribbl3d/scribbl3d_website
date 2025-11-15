import { PrismaClient } from "@prisma/client";
import { pincodeData } from "../prisma/data/pincodes";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting pincode data import...");

  try {
    const result = await prisma.pincodeLocation.createMany({
      data: pincodeData,
      skipDuplicates: true,
    });

    console.log(`Successfully imported ${result.count} pincodes`);
  } catch (error) {
    console.error("Error importing pincode data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
