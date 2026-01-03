// app/api/printers/similar/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const technology = searchParams.get("technology");
        const excludeId = searchParams.get("exclude");
        const limit = parseInt(searchParams.get("limit") || "6");

        if (!technology) {
            return NextResponse.json(
                { error: "Technology parameter is required" },
                { status: 400 }
            );
        }

        // Build where clause
        const where: any = {
            technology: technology,
        };

        // Exclude current printer
        if (excludeId) {
            where.id = {
                not: excludeId,
            };
        }

        // Fetch similar printers
        const printers = await prisma.printer.findMany({
            where,
            include: {
                images: {
                    where: { isMain: true },
                    take: 1,
                },
                attributes: {
                    where: {
                        attributeKey: "material",
                    },
                },
            },
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        });

        // Format response
        const formattedPrinters = printers.map((printer) => ({
            ...printer,
            imageUrl: printer.images[0]?.url || null,
            priceDisplay: `₹${(printer.price / 100).toLocaleString("en-IN")}`,
            originalPriceDisplay: printer.originalPrice
                ? `₹${(printer.originalPrice / 100).toLocaleString("en-IN")}`
                : null,
        }));

        return NextResponse.json({
            printers: formattedPrinters,
            total: formattedPrinters.length,
        });
    } catch (error) {
        console.error("Error fetching similar printers:", error);
        return NextResponse.json(
            { error: "Failed to fetch similar printers" },
            { status: 500 }
        );
    }
}
