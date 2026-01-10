import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const resinsData = [
    {
        name: "Scrible3D Standard Grey Resin",
        slug: "scrible3d-standard-grey-resin",
        brand: "Scrible3D",
        technology: "MSLA",
        resolution: ["4K", "8K"],

        shortDescription:
            "Reliable general-purpose resin for everyday printing",
        description:
            "High-quality standard resin offering excellent surface finish, dimensional accuracy, and easy post-processing. Ideal for prototyping and miniatures.",

        colours: [
            {
                name: "Grey",
                sortOrder: 1,
                images: [
                    {
                        url: "/images/resins/standard-grey/front.jpg",
                        altText: "Grey resin bottle front",
                        sortOrder: 0,
                        isMain: true,
                    },
                    {
                        url: "/images/resins/standard-grey/side.jpg",
                        altText: "Grey resin bottle side",
                        sortOrder: 1,
                    },
                ],
            },
            {
                name: "Black",
                sortOrder: 2,
                images: [
                    {
                        url: "/images/resins/standard-black/front.jpg",
                        altText: "Black resin bottle front",
                        sortOrder: 0,
                        isMain: true,
                    },
                ],
            },
        ],

        weights: [
            {
                weightInGrams: 500,
                price: 2200,
                originalPrice: 2500,
                discount: 12,
                sortOrder: 1,
            },
            {
                weightInGrams: 1000,
                price: 3900,
                originalPrice: 4500,
                discount: 13,
                sortOrder: 2,
            },
        ],

        attributes: [
            { label: "Material", value: "Water Washable Resin" },
            { label: "Type", value: "Standard Resin" },
            { label: "Odor", value: "Low" },
            { label: "Flexibility", value: "Low" },
        ],

        specifications: [
            {
                category: "Physical Properties",
                label: "Viscosity",
                value: "450 cps @ 25°C",
                sortOrder: 1,
            },
            {
                category: "Print Settings",
                label: "Layer Height",
                value: "0.05 – 0.1 mm",
                sortOrder: 2,
            },
        ],

        features: [
            { title: "Excellent surface finish", sortOrder: 1 },
            { title: "Low shrinkage", sortOrder: 2 },
            { title: "Easy post-processing", sortOrder: 3 },
        ],

        downloads: [
            {
                title: "Technical Datasheet",
                downloadUrl:
                    "https://docs.scrible3d.com/standard-resin-tds.pdf",
                sortOrder: 1,
            },
            {
                title: "MSDS",
                downloadUrl:
                    "https://docs.scrible3d.com/standard-resin-msds.pdf",
                sortOrder: 2,
            },
        ],
    },

    {
        name: "Scrible3D ABS-Like Resin",
        slug: "scrible3d-abs-like-resin",
        brand: "Scrible3D",
        technology: "MSLA",
        resolution: ["8K"],

        shortDescription: "Tough resin for functional and mechanical parts",
        description:
            "ABS-like resin with enhanced toughness and impact resistance. Ideal for snap-fit parts, enclosures, and engineering prototypes.",

        colours: [
            {
                name: "White",
                sortOrder: 1,
                images: [
                    {
                        url: "/images/resins/abs-white/front.jpg",
                        altText: "ABS-like white resin bottle",
                        sortOrder: 0,
                        isMain: true,
                    },
                ],
            },
        ],

        weights: [
            {
                weightInGrams: 1000,
                price: 4800,
                originalPrice: 5500,
                discount: 13,
                sortOrder: 1,
            },
        ],

        attributes: [
            { label: "Material", value: "Standard Resin" },
            { label: "Type", value: "ABS-like Resin" },
            { label: "Flexibility", value: "Medium" },
            { label: "Impact Resistance", value: "High" },
        ],

        specifications: [
            {
                category: "Mechanical Properties",
                label: "Tensile Strength",
                value: "45 MPa",
                sortOrder: 1,
            },
            {
                category: "Mechanical Properties",
                label: "Elongation at Break",
                value: "20%",
                sortOrder: 2,
            },
        ],

        features: [
            { title: "High impact resistance", sortOrder: 1 },
            { title: "Durable functional prints", sortOrder: 2 },
        ],

        downloads: [
            {
                title: "Technical Datasheet",
                downloadUrl:
                    "https://docs.scrible3d.com/abs-like-resin-tds.pdf",
                sortOrder: 1,
            },
        ],
    },
];

async function main() {
    console.log("🌱 Seeding resins...");

    // Clear existing resin data
    await prisma.resinImage.deleteMany();
    await prisma.resinColour.deleteMany();
    await prisma.resinWeight.deleteMany();
    await prisma.resinFeature.deleteMany();
    await prisma.resinSpecification.deleteMany();
    await prisma.resinAttribute.deleteMany();
    await prisma.resinDownload.deleteMany();
    await prisma.resin.deleteMany();

    for (const resinData of resinsData) {
        const {
            colours,
            weights,
            attributes,
            specifications,
            features,
            downloads,
            ...resinInfo
        } = resinData;

        const resin = await prisma.resin.create({
            data: {
                ...resinInfo,

                colours: {
                    create: colours.map((colour) => ({
                        name: colour.name,
                        sortOrder: colour.sortOrder,
                        images: { create: colour.images },
                    })),
                },

                weights: { create: weights },
                attributes: { create: attributes },
                specifications: { create: specifications },
                features: { create: features },
                downloads: { create: downloads },
            },
        });

        console.log(`✅ Created resin: ${resin.name}`);
    }

    console.log("🎉 Resin seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Resin seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
