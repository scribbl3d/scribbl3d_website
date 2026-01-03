// app/api/admin/printers/[id]/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Get single printer for editing
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const printer = await prisma.printer.findUnique({
            where: { id },
            include: {
                images: { orderBy: { sortOrder: "asc" } },
                specifications: {
                    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
                },
                features: { orderBy: { sortOrder: "asc" } },
                applications: { orderBy: { sortOrder: "asc" } },
                downloads: { orderBy: { sortOrder: "asc" } },
            },
        });

        if (!printer) {
            return NextResponse.json(
                { error: "Printer not found" },
                { status: 404 }
            );
        }

        // Convert price from paise to rupees for editing
        const formattedPrinter = {
            ...printer,
            price: (printer.price / 100).toString(),
            originalPrice: printer.originalPrice
                ? (printer.originalPrice / 100).toString()
                : "",
            discount: printer.discount ? printer.discount.toString() : "",
            volumeLength: printer.volumeLength.toString(),
            volumeWidth: printer.volumeWidth.toString(),
            volumeHeight: printer.volumeHeight.toString(),
            warrantyYears: printer.warrantyYears.toString(),
        };

        return NextResponse.json(formattedPrinter);
    } catch (error) {
        console.error("Error fetching printer:", error);
        return NextResponse.json(
            { error: "Failed to fetch printer" },
            { status: 500 }
        );
    }
}

// PUT - Update printer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        // Calculate volumeMax
        const volumeMax = Math.max(
            parseInt(data.volumeLength),
            parseInt(data.volumeWidth),
            parseInt(data.volumeHeight)
        );

        // Update slug if name changed
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Delete existing relations
        await Promise.all([
            prisma.printerImage.deleteMany({ where: { printerId: id } }),
            prisma.printerSpecification.deleteMany({
                where: { printerId: id },
            }),
            prisma.printerFeature.deleteMany({ where: { printerId: id } }),
            prisma.printerApplication.deleteMany({ where: { printerId: id } }),
            prisma.printerDownload.deleteMany({ where: { printerId: id } }),
        ]);

        // Update printer with new relations
        const printer = await prisma.printer.update({
            where: { id },
            data: {
                name: data.name,
                slug,
                brand: data.brand,
                technology: data.technology,
                experience: data.experience,
                price: parseInt(data.price) * 100,
                originalPrice: data.originalPrice
                    ? parseInt(data.originalPrice) * 100
                    : null,
                discount: data.discount ? parseInt(data.discount) : null,
                volumeLength: parseInt(data.volumeLength),
                volumeWidth: parseInt(data.volumeWidth),
                volumeHeight: parseInt(data.volumeHeight),
                volumeMax,
                description: data.description || "",
                shortDescription: data.shortDescription || "",
                warrantyYears: parseInt(data.warrantyYears) || 1,
                freeInstallation: data.freeInstallation || false,
                images: {
                    create: (data.images || []).map((img, index) => ({
                        url: img.url,
                        altText: img.altText || data.name,
                        sortOrder: index,
                        isMain: img.isMain || index === 0,
                    })),
                },
                specifications: {
                    create: (data.specifications || []).map((spec, index) => ({
                        category: spec.category,
                        label: spec.label,
                        value: spec.value,
                        sortOrder: index,
                    })),
                },
                features: {
                    create: (data.features || []).map((feature, index) => ({
                        title: feature.title,
                        sortOrder: index,
                    })),
                },
                applications: {
                    create: (data.applications || []).map((app, index) => ({
                        name: app.name,
                        sortOrder: index,
                    })),
                },
                downloads: {
                    create: (data.downloads || []).map((download, index) => ({
                        title: download.title,
                        description: download.description || "",
                        downloadUrl: download.downloadUrl,
                        sortOrder: index,
                    })),
                },
            },
            include: {
                images: true,
                specifications: true,
                features: true,
                applications: true,
                downloads: true,
            },
        });

        return NextResponse.json(printer);
    } catch (error) {
        console.error("Error updating printer:", error);

        return NextResponse.json(
            {
                error: "Failed to update printer",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete printer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.printer.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting printer:", error);
        return NextResponse.json(
            { error: "Failed to delete printer" },
            { status: 500 }
        );
    }
}
