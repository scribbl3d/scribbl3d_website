import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const sortBy = searchParams.get("sortBy") || "new";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 9);

    /* ================= FILTERS ================= */

    const where: any = {};

    const technologies = searchParams.getAll("technology");
    if (technologies.length) where.technology = { in: technologies };

    const brands = searchParams.getAll("brand");
    if (brands.length) where.brand = { in: brands };

    const resolutions = searchParams.getAll("resolution");
    if (resolutions.length) where.resolution = { in: resolutions };

    const colours = searchParams.getAll("colour");
    if (colours.length) {
        where.colours = {
            some: { name: { in: colours } },
        };
    }

    const materialTypes = searchParams.getAll("materialType");
    if (materialTypes.length) {
        where.attributes = {
            some: {
                label: "Material",
                value: { in: materialTypes },
            },
        };
    }

    const washable = searchParams.get("washable");
    if (washable !== null) {
        where.attributes = {
            some: {
                label: "Washable",
                value: washable === "true" ? "Yes" : "No",
            },
        };
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
        where.weights = {
            some: {
                price: {
                    ...(minPrice && { gte: Number(minPrice) }),
                    ...(maxPrice && { lte: Number(maxPrice) }),
                },
            },
        };
    }

    /* ================= FETCH ================= */

    const resins = await prisma.resin.findMany({
        where,
        orderBy: sortBy === "new" ? { createdAt: "desc" } : undefined,
        include: {
            attributes: true,
            weights: { orderBy: { sortOrder: "asc" } },
            colours: {
                orderBy: { sortOrder: "asc" },
                include: {
                    images: { orderBy: { sortOrder: "asc" } },
                },
            },
        },
    });

    /* ================= SORT ================= */

    let sorted = [...resins];

    if (sortBy === "price_asc") {
        sorted.sort((a, b) => {
            const aMin = Math.min(...a.weights.map((w) => w.price));
            const bMin = Math.min(...b.weights.map((w) => w.price));
            return aMin - bMin;
        });
    }

    if (sortBy === "price_desc") {
        sorted.sort((a, b) => {
            const aMin = Math.min(...a.weights.map((w) => w.price));
            const bMin = Math.min(...b.weights.map((w) => w.price));
            return bMin - aMin;
        });
    }

    /* ================= PAGINATION ================= */

    const total = sorted.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = sorted.slice(start, end);

    return NextResponse.json({
        resins: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
}
