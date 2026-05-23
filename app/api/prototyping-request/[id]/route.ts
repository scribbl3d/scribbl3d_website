import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        await prisma.prototypingRequest.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting prototyping request:", error);
        return NextResponse.json(
            { error: "Failed to delete request" },
            { status: 500 },
        );
    }
}
