import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const categories = ["PLAplus", "ABS", "PETG", "TPU", "Nylon"];

    const products = await prisma.product.findMany({
        where: { category: { in: categories } },
        orderBy: { name: "asc" },
    });

    return NextResponse.json({
        PLAplus: products.filter((p) => p.category === "PLAplus").slice(0, 8),
        ABS: products.filter((p) => p.category === "ABS").slice(0, 8),
        PETG: products.filter((p) => p.category === "PETG").slice(0, 8),
        TPU: products.filter((p) => p.category === "TPU").slice(0, 8),
        Nylon: products.filter((p) => p.category === "Nylon").slice(0, 8),
    });
}
