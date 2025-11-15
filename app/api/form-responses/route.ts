import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const formResponse = await prisma.form3DResponse.create({
      data: {
        service: body.service,
        fileReference: body.fileReference,
        requirement: body.requirement,
        fileExtension: body.fileExtension,
        prototype: body.prototype,
        prototypeOption: body.prototypeOption,
        printingTechnology: body.printingTechnology,
        material: body.material,
        materialType: body.materialType,
        materialDescription: body.materialDescription,
        quantity: body.quantity ? parseInt(body.quantity) : null,
        productColor: body.productColor,
        filamentColor: body.filamentColor,
        resinColor: body.resinColor,
        additionalFile: body.additionalFile,
      },
    });

    return NextResponse.json(formResponse);
  } catch (error) {
    console.error("Failed to create form response:", error);
    return NextResponse.json(
      { error: "Failed to create form response" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const formResponses = await prisma.form3DResponse.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(formResponses);
  } catch (error) {
    console.error("Failed to fetch form responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch form responses" },
      { status: 500 }
    );
  }
}
