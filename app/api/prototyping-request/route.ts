import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Handle file upload (if implemented)
    const designFile = formData.get("designFile");
    const designFilePath = designFile instanceof File ? designFile.name : null;

    const data = {
      projectType: formData.get("projectType") as string,
      technology: formData.get("technology") as string,
      material: formData.get("material") as string,
      materialSubtype: (formData.get("materialSubtype") as string) || null,
      color: formData.get("color") as string,
      filamentColor: (formData.get("filamentColor") as string) || null,
      resinColor: (formData.get("resinColor") as string) || null,
      customMaterial: (formData.get("customMaterial") as string) || null,
      designFile: designFilePath,
      specialRequirements:
        (formData.get("specialRequirements") as string) || null,
      bulkQuantity: (formData.get("bulkQuantity") as string) || null,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: (formData.get("company") as string) || null,
    };

    const response = await prisma.prototypingRequest.create({
      data: data,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Error details:", {
      name: error?.name || "Unknown error",
      message: error?.message || "No error message available",
      stack: error?.stack || "No stack trace available",
    });

    return NextResponse.json(
      { success: false, error: "Failed to create prototyping request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const requests = await prisma.prototypingRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch prototyping requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch prototyping requests" },
      { status: 500 }
    );
  }
}
