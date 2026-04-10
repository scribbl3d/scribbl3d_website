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

    // ================= UPLOAD IMAGES TO CLOUDINARY IN PARALLEL (before transaction) =================
    const uploadToCloudinary = async (file: File): Promise<string> => {
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
      return res.secure_url;
    };

    // Collect all upload promises across all colours
    const uploadJobs: { colourIdx: number; imageIdx: number; promise: Promise<string> }[] = [];

    for (let cIdx = 0; cIdx < colours.length; cIdx++) {
      const c = colours[cIdx];
      if (!c.images?.length) continue;
      for (let iIdx = 0; iIdx < c.images.length; iIdx++) {
        const img = c.images[iIdx];
        if (img.uploadKey) {
          const file = formData.get(img.uploadKey) as File;
          if (file && file.size > 0) {
            uploadJobs.push({ colourIdx: cIdx, imageIdx: iIdx, promise: uploadToCloudinary(file) });
          }
        }
      }
    }

    // Run all uploads in parallel
    const uploadResults = await Promise.all(
      uploadJobs.map(async (job) => ({ ...job, url: await job.promise }))
    );

    // Build a lookup map: "colourIdx-imageIdx" -> cloudinary url
    const uploadMap = new Map<string, string>();
    for (const r of uploadResults) {
      uploadMap.set(`${r.colourIdx}-${r.imageIdx}`, r.url);
    }

    // Build processedColours with resolved URLs
    const processedColours: ProcessedColour[] = [];

    for (let idx = 0; idx < colours.length; idx++) {
      const c = colours[idx];
      const processedImages: ProcessedImage[] = [];

      if (c.images?.length) {
        for (let iIdx = 0; iIdx < c.images.length; iIdx++) {
          const img = c.images[iIdx];
          const cloudinaryUrl = uploadMap.get(`${idx}-${iIdx}`);
          processedImages.push({
            url: cloudinaryUrl || img.url,
            altText: null,
            sortOrder: img.sortOrder,
          });
        }
      }

      processedColours.push({
        id: c.id || undefined,
        name: c.name,
        hexCode: c.hexCode || null,
        sortOrder: idx,
        inStock: c.inStock ?? true,
        images: processedImages,
      });
    }

    // ================= TRANSACTION (DB only, no external calls) =================
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

      // 🔹 4. Weights — upsert to preserve IDs (cart items reference these)
      const existingWeightIds = (
        await tx.resinWeight.findMany({
          where: { resinId: id },
          select: { id: true },
        })
      ).map((w) => w.id);

      const incomingWeightIds = weights
        .map((w: any) => w.id)
        .filter(Boolean);

      // Delete only weights that were removed in admin
      const weightIdsToDelete = existingWeightIds.filter(
        (eid) => !incomingWeightIds.includes(eid)
      );
      if (weightIdsToDelete.length) {
        await tx.resinWeight.deleteMany({
          where: { id: { in: weightIdsToDelete } },
        });
      }

      // Update existing or create new
      await Promise.all(
        weights.map((w: any, idx: number) => {
          const data = {
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
          };

          if (w.id && existingWeightIds.includes(w.id)) {
            return tx.resinWeight.update({ where: { id: w.id }, data });
          }
          return tx.resinWeight.create({ data });
        })
      );

      // 🔹 5. Colours + Images — upsert to preserve IDs (cart items reference these)
      const existingColourIds = (
        await tx.resinColour.findMany({
          where: { resinId: id },
          select: { id: true },
        })
      ).map((c) => c.id);

      const incomingColourIds = colours
        .map((c: any) => c.id)
        .filter(Boolean);

      // Delete only colours that were removed in admin
      const colourIdsToDelete = existingColourIds.filter(
        (eid) => !incomingColourIds.includes(eid)
      );
      if (colourIdsToDelete.length) {
        // Images cascade-delete with colour
        await tx.resinColour.deleteMany({
          where: { id: { in: colourIdsToDelete } },
        });
      }

      // Update existing or create new colours + replace their images
      await Promise.all(
        processedColours.map(async (c, idx) => {
          const originalColour = colours[idx];
          const colourData = {
            resinId: id,
            name: c.name,
            hexCode: c.hexCode,
            sortOrder: idx,
            inStock: c.inStock,
          };

          let colourId: string;

          if (originalColour.id && existingColourIds.includes(originalColour.id)) {
            await tx.resinColour.update({
              where: { id: originalColour.id },
              data: colourData,
            });
            colourId = originalColour.id;

            // Replace images for this colour (images don't need stable IDs)
            await tx.resinImage.deleteMany({ where: { colourId } });
          } else {
            const created = await tx.resinColour.create({ data: colourData });
            colourId = created.id;
          }

          if (!c.images.length) return;

          await tx.resinImage.createMany({
            data: c.images.map((img, i) => ({
              colourId,
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