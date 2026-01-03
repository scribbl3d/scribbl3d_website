// app/api/admin/printers/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - List all printers with pagination and search
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "name";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
            ];
        }

        // Build orderBy
        const orderBy: any = {};
        if (sortBy === "name") orderBy.name = "asc";
        else if (sortBy === "price") orderBy.price = "asc";
        else if (sortBy === "technology") orderBy.technology = "asc";
        else if (sortBy === "updatedAt") orderBy.updatedAt = "desc";

        // Fetch printers
        const [printers, total] = await Promise.all([
            prisma.printer.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    brand: true,
                    technology: true,
                    price: true,
                    originalPrice: true,
                    discount: true,
                    freeInstallation: true,
                    updatedAt: true,
                },
            }),
            prisma.printer.count({ where }),
        ]);

        return NextResponse.json({
            printers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching printers:", error);
        return NextResponse.json(
            { error: "Failed to fetch printers" },
            { status: 500 }
        );
    }
}

// POST - Create new printer
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Calculate volumeMax
        const volumeMax = Math.max(
            parseInt(data.volumeLength),
            parseInt(data.volumeWidth),
            parseInt(data.volumeHeight)
        );

        // Generate slug
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Create printer with all relations
        const printer = await prisma.printer.create({
            data: {
                name: data.name,
                slug,
                brand: data.brand,
                technology: data.technology,
                experience: data.experience,
                price: parseInt(data.price) * 100, // Convert to paise
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

        return NextResponse.json(printer, { status: 201 });
    } catch (error) {
        const err = error as Error;

        return NextResponse.json(
            {
                error: "Failed to create printer",
                details: err.message,
            },
            { status: 500 }
        );
    }
}
