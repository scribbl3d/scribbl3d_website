import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
    const [materials, technologies, resolutionsRaw, colours, brands, priceAgg] =
        await Promise.all([
            prisma.resinAttribute.findMany({
                where: { label: "Material" },
                select: { value: true },
                distinct: ["value"],
            }),
            prisma.resin.findMany({
                select: { technology: true },
                distinct: ["technology"],
            }),
            prisma.resin.findMany({
                select: { resolution: true },
            }),
            prisma.resinColour.findMany({
                select: { name: true },
                distinct: ["name"],
            }),
            prisma.resin.findMany({
                select: { brand: true },
                distinct: ["brand"],
            }),
            prisma.resinWeight.aggregate({
                _min: { price: true },
                _max: { price: true },
            }),
        ]);

    const resolutions = resolutionsRaw.map((r) => r.resolution).flat();

    return NextResponse.json({
        materialTypes: materials.map((m) => m.value),
        technologies: technologies.map((t) => t.technology),
        resolutions: Array.from(new Set(resolutions)),
        colours: colours.map((c) => c.name),
        brands: brands.map((b) => b.brand),
        price: {
            min: priceAgg._min.price ?? 0,
            max: priceAgg._max.price ?? 0,
        },
    });
}
