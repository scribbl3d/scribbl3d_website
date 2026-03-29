import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, context: any) {
    const id = context.params.id;

    try {
        await prisma.partner.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Partner deleted successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete partner" },
            { status: 500 },
        );
    }
}
