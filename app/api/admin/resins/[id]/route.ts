// app/api/admin/resins/[id]/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

type ProcessedImage = {
    id?: string;
    url: string;
    altText: string | null;
    sortOrder: number;
};

type ProcessedColour = {
    id?: string;
    name: string;
    hexCode: string | null;
    sortOrder: number;
    inStock: boolean;
    images: ProcessedImage[];
};

/* ========================= GET ========================= */

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const resin = await prisma.resin.findUnique({
            where: { id },
            include: {
                attributes: true,
                colours: {
                    orderBy: { sortOrder: "asc" },
                    include: { images: { orderBy: { sortOrder: "asc" } } },
                },
                weights: { orderBy: { sortOrder: "asc" } },
                specifications: { orderBy: { sortOrder: "asc" } },
                features: { orderBy: { sortOrder: "asc" } },
                applications: { orderBy: { sortOrder: "asc" } },
                compatibilities: { orderBy: { sortOrder: "asc" } },
                downloads: { orderBy: { sortOrder: "asc" } },
            },
        });

        if (!resin) {
            return NextResponse.json(
                { error: "Resin not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(resin);
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch resin" },
            { status: 500 },
        );
    }
}

/* ========================= PUT ========================= */

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const brand = formData.get("brand") as string;
    const technology = formData.get("technology") as string;
    const resolution = JSON.parse((formData.get("resolution") as string) || "[]");
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const inStock = formData.get("inStock") !== "false";

    let cardImageUrl = (formData.get("cardImageUrl") as string) || null;
    const cardImageFile = formData.get("cardImageFile") as File;

    if (cardImageFile && cardImageFile.size > 0) {
      const buffer = Buffer.from(await cardImageFile.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `resins/${slug}`,
              resource_type: "image",
              transformation: [
                {
                  width: 1600,
                  height: 1600,
                  crop: "pad",
                  background: "white",
                  quality: "auto:good",
                  fetch_format: "auto",
                },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(buffer);
      });
      cardImageUrl = uploadResult.secure_url;
    }

    // ---------- PARSE ----------
    const attributes = JSON.parse((formData.get("attributes") as string) || "[]");
    const weights = JSON.parse((formData.get("weights") as string) || "[]");
    const specifications = JSON.parse((formData.get("specifications") as string) || "[]");
    const features = JSON.parse((formData.get("features") as string) || "[]");
    const applications = JSON.parse((formData.get("applications") as string) || "[]");
    const compatibilities = JSON.parse((formData.get("compatibilities") as string) || "[]");
    const downloads = JSON.parse((formData.get("downloads") as string) || "[]");
    const colours = JSON.parse((formData.get("colours") as string) || "[]");

    // ================= TRANSACTION =================
    const resin = await prisma.$transaction(async (tx) => {

      // 🔹 1. Update base
      await tx.resin.update({
        where: { id },
        data: {
          name,
          slug,
          brand,
          technology,
          resolution,
          shortDescription,
          description,
          cardImageUrl,
          inStock,
        },
      });

      // 🔹 2. Delete bulk (parallel)
      await Promise.all([
        tx.resinAttribute.deleteMany({ where: { resinId: id } }),
        tx.resinSpecification.deleteMany({ where: { resinId: id } }),
        tx.resinFeature.deleteMany({ where: { resinId: id } }),
        tx.resinApplication.deleteMany({ where: { resinId: id } }),
        tx.resinCompatibility.deleteMany({ where: { resinId: id } }),
        tx.resinDownload.deleteMany({ where: { resinId: id } }),
      ]);

      // 🔹 3. Create bulk (parallel)
      await Promise.all([
        attributes.length
          ? tx.resinAttribute.createMany({
              data: attributes.map((a: any) => ({
                resinId: id,
                label: a.label,
                value: a.value,
              })),
            })
          : null,

        specifications.length
          ? tx.resinSpecification.createMany({
              data: specifications.map((s: any, i: number) => ({
                resinId: id,
                category: s.category,
                label: s.label,
                value: s.value,
                sortOrder: i,
              })),
            })
          : null,

        features.length
          ? tx.resinFeature.createMany({
              data: features.map((f: any, i: number) => ({
                resinId: id,
                title: f.title,
                sortOrder: i,
              })),
            })
          : null,

        applications.length
          ? tx.resinApplication.createMany({
              data: applications.map((a: any, i: number) => ({
                resinId: id,
                name: a.name,
                sortOrder: i,
              })),
            })
          : null,

        compatibilities.length
          ? tx.resinCompatibility.createMany({
              data: compatibilities.map((c: any, i: number) => ({
                resinId: id,
                name: c.name,
                sortOrder: i,
              })),
            })
          : null,

        downloads.length
          ? tx.resinDownload.createMany({
              data: downloads.map((d: any, i: number) => ({
                resinId: id,
                title: d.title,
                description: d.description || null,
                downloadUrl: d.downloadUrl || null,
                sortOrder: i,
              })),
            })
          : null,
      ]);

      // 🔹 4. Weights (parallel)
      await tx.resinWeight.deleteMany({ where: { resinId: id } });

      await Promise.all(
        weights.map((w: any, idx: number) =>
          tx.resinWeight.create({
            data: {
              resinId: id,
              weightInGrams: Number(w.weightInGrams),
              price: Number(w.price),
              originalPrice: w.originalPrice ? Number(w.originalPrice) : null,
              discount:
                w.originalPrice && Number(w.originalPrice) > Number(w.price)
                  ? Math.round(
                      ((Number(w.originalPrice) - Number(w.price)) /
                        Number(w.originalPrice)) *
                        100
                    )
                  : null,
              sortOrder: idx,
              inStock: w.inStock ?? true,
            },
          })
        )
      );

      // 🔹 5. Colours + Images (parallel optimized)
      await tx.resinColour.deleteMany({ where: { resinId: id } });

      // Upload new colour images to Cloudinary before DB insert
      const processedColours: { name: string; hexCode: string | null; sortOrder: number; inStock: boolean; images: ProcessedImage[] }[] = [];

      for (let idx = 0; idx < colours.length; idx++) {
        const c = colours[idx];
        const processedImages: ProcessedImage[] = [];

        if (c.images?.length) {
          for (const img of c.images) {
            let imageUrl = img.url;
            if (img.uploadKey) {
              const file = formData.get(img.uploadKey) as File;
              if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const res: any = await new Promise((resolve, reject) => {
                  cloudinary.uploader
                    .upload_stream(
                      {
                        folder: `resins/${slug}/gallery`,
                        resource_type: "image",
                        transformation: [
                          {
                            width: 1600,
                            height: 1600,
                            crop: "pad",
                            background: "white",
                            quality: "auto:good",
                            fetch_format: "auto",
                          },
                        ],
                      },
                      (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                      },
                    )
                    .end(buffer);
                });
                imageUrl = res.secure_url;
              }
            }
            processedImages.push({
              url: imageUrl,
              altText: null,
              sortOrder: img.sortOrder,
            });
          }
        }

        processedColours.push({
          name: c.name,
          hexCode: c.hexCode || null,
          sortOrder: idx,
          inStock: c.inStock ?? true,
          images: processedImages,
        });
      }

      await Promise.all(
        processedColours.map(async (c, idx) => {
          const colour = await tx.resinColour.create({
            data: {
              resinId: id,
              name: c.name,
              hexCode: c.hexCode,
              sortOrder: idx,
              inStock: c.inStock,
            },
          });

          if (!c.images.length) return;

          await tx.resinImage.createMany({
            data: c.images.map((img, i) => ({
              colourId: colour.id,
              url: img.url,
              altText: null,
              sortOrder: i,
            })),
          });
        })
      );

      // 🔹 6. Return updated
      return tx.resin.findUnique({
        where: { id },
        include: {
          attributes: true,
          colours: { include: { images: true } },
          weights: true,
          specifications: true,
          features: true,
          applications: true,
          compatibilities: true,
          downloads: true,
        },
      });
    }, {
      timeout: 20000, // 🔥 FIX
    });

    return NextResponse.json(resin);

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update resin" },
      { status: 500 }
    );
  }
}
/* ========================= DELETE ========================= */

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        await prisma.resin.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete resin" },
            { status: 500 },
        );
    }
}