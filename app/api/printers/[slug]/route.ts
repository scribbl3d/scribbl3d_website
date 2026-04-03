// app/api/printers/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;

        const printer = await prisma.printer.findUnique({
            where: { slug },
            include: {
                images: {
                    orderBy: { sortOrder: "asc" },
                },
                attributes: true,
                specifications: {
                    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
                },
                features: {
                    orderBy: { sortOrder: "asc" },
                },
                applications: {
                    orderBy: { sortOrder: "asc" },
                },
                downloads: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!printer) {
            return NextResponse.json(
                { error: "Printer not found" },
                { status: 404 },
            );
        }

        // Format the response
        const formattedPrinter = {
            ...printer,
            priceDisplay: `₹${(printer.price / 100).toLocaleString("en-IN")}`,
            originalPriceDisplay: printer.originalPrice
                ? `₹${(printer.originalPrice / 100).toLocaleString("en-IN")}`
                : null,
            savingsDisplay: printer.originalPrice
                ? `₹${((printer.originalPrice - printer.price) / 100).toLocaleString("en-IN")}`
                : null,
        };

        return NextResponse.json(formattedPrinter);
    } catch (error) {
        console.error("Error fetching printer details:", error);
        return NextResponse.json(
            { error: "Failed to fetch printer details" },
            { status: 500 },
        );
    }
}
