import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } },
) {
    try {
        await prisma.partner.delete({
            where: { id: params.id },
        });
        return NextResponse.json({ message: "Partner deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete partner" },
            { status: 500 },
        );
    }
}
