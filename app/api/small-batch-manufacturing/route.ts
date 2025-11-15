import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Log the received form data keys for debugging
    console.log("Form data keys:", Array.from(formData.keys()));

    // Handle file upload
    const designFile = formData.get("designFile");
    const designFilePath = designFile instanceof File ? designFile.name : null;

    const data = {
      designFile: designFilePath,
      quantity: parseInt(formData.get("quantity") as string) || 0,
      requirements: (formData.get("requirements") as string) ?? "",
      technology: (formData.get("technology") as string) ?? "",
      material: (formData.get("material") as string) ?? "",
      materialSubtype: (formData.get("materialSubtype") as string) ?? "",
      productColor: (formData.get("productColor") as string) ?? "",
      filamentColor: (formData.get("filamentColor") as string) ?? "",
      resinColor: (formData.get("resinColor") as string) ?? "",
      firstName: (formData.get("firstName") as string) ?? "",
      lastName: (formData.get("lastName") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      company: (formData.get("company") as string) ?? "",
    };

    // Log the processed data for debugging
    console.log("Processed data:", data);

    const response = await prisma.smallBatchManufacturingResponse.create({
      data: data,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    // Type assertion for error
    // Detailed error logging
    console.error("Error details:", {
      name: error?.name || "Unknown error",
      message: error?.message || "No error message available",
      stack: error?.stack || "No stack trace available",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create small batch manufacturing response",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responses = await prisma.smallBatchManufacturingResponse.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error(
      "Failed to fetch small batch manufacturing responses:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch small batch manufacturing responses" },
      { status: 500 }
    );
  }
}
