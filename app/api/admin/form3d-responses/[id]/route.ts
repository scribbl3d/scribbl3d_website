import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        await prisma.form3DResponse.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting Form3D response:", error);
        return NextResponse.json(
            { error: "Failed to delete response" },
            { status: 500 },
        );
    }
}
