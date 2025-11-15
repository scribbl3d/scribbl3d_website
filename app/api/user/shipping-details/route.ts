import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await req.json();
    // Get user by email to get userId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return new NextResponse("User not found", { status: 404 });
    // Always create a new address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        street: data.address,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        zipCode: data.pincode,
        pincode: data.pincode,
        country: data.country || "India",
      },
    });
    return NextResponse.json(address);
  } catch (error) {
    console.error("[SHIPPING_DETAILS_SAVE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // Get the most recent address for the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return new NextResponse("User not found", { status: 404 });
    const address = await prisma.address.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (!address) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(address);
  } catch (error) {
    console.error("[SHIPPING_DETAILS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
