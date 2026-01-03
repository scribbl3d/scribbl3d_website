import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFileLocally } from "@/lib/file-upload";

// GET: Fetch single printer data
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> } // 1. Change type to Promise
) {
  const params = await props.params; // 2. Await params before using

  try {
    const printer = await prisma.printer.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
        features: { orderBy: { sortOrder: "asc" } },
        applications: { orderBy: { sortOrder: "asc" } },
        downloads: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!printer) {
      return NextResponse.json({ error: "Printer not found" }, { status: 404 });
    }

    return NextResponse.json(printer);
  } catch (error) {
    console.error("[PRINTER_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update existing printer
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> } // 1. Change type to Promise
) {
  const params = await props.params; // 2. Await params before using

  try {
    const formData = await req.formData();

    // 1. Extract Basic Fields
    // (We allow updating slug, but usually it's safer to keep the existing one if not provided)
    const existingPrinter = await prisma.printer.findUnique({ 
        where: { id: params.id },
        select: { slug: true }
    });
    
    // Use new slug from form, or fallback to existing slug
    const slug = (formData.get("slug") as string) || existingPrinter?.slug || "";

    // 2. Parse JSON Arrays
    const specifications = JSON.parse(formData.get("specifications") as string || "[]");
    const features = JSON.parse(formData.get("features") as string || "[]");
    const applications = JSON.parse(formData.get("applications") as string || "[]");
    const downloads = JSON.parse(formData.get("downloads") as string || "[]");

    // 3. Handle Images (Merge Strategy)
    const existingImages = JSON.parse(formData.get("existingImages") as string || "[]");
    
    const newFiles = formData.getAll("newImages") as File[];
    const newMetaStrings = formData.getAll("newImagesMeta") as string[];

    const finalImageRecords = [...existingImages];

    // Process new uploads
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const meta = JSON.parse(newMetaStrings[i] || "{}");
      
      // Save locally (This handles creating the folder if it doesn't exist)
      const publicUrl = await saveFileLocally(file, slug);

      finalImageRecords.push({
        url: publicUrl,
        isMain: meta.isMain || false,
        sortOrder: meta.sortOrder || 0
      });
    }

    // 4. Transaction Update
    const updatedPrinter = await prisma.$transaction([
      // Update basic fields
      prisma.printer.update({
        where: { id: params.id },
        data: {
          name: formData.get("name") as string,
          slug,
          brand: formData.get("brand") as string,
          price: parseInt(formData.get("price") as string),
          originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : null,
          discount: parseInt(formData.get("discount") as string),
          technology: formData.get("technology") as string,
          experience: formData.get("experience") as string,
          description: formData.get("description") as string,
          shortDescription: formData.get("shortDescription") as string,
          volumeLength: parseInt(formData.get("volumeLength") as string),
          volumeWidth: parseInt(formData.get("volumeWidth") as string),
          volumeHeight: parseInt(formData.get("volumeHeight") as string),
          volumeMax: parseInt(formData.get("volumeMax") as string),
          warrantyYears: parseInt(formData.get("warrantyYears") as string),
          freeInstallation: formData.get("freeInstallation") === "true",
        },
      }),

      // --- Sync Relations (Delete All + Re-create) ---
      
      // Images
      prisma.printerImage.deleteMany({ where: { printerId: params.id } }),
      prisma.printerImage.createMany({
        data: finalImageRecords.map((img: any) => ({
          printerId: params.id,
          url: img.url,
          isMain: img.isMain,
          sortOrder: img.sortOrder
        })),
      }),

      // Specifications
      prisma.printerSpecification.deleteMany({ where: { printerId: params.id } }),
      prisma.printerSpecification.createMany({
        data: specifications.map((spec: any, index: number) => ({
          printerId: params.id,
          category: spec.category,
          label: spec.label,
          value: spec.value,
          sortOrder: index,
        })),
      }),

      // Features
      prisma.printerFeature.deleteMany({ where: { printerId: params.id } }),
      prisma.printerFeature.createMany({
        data: features.map((feat: any, index: number) => ({
          printerId: params.id,
          title: feat.title,
          sortOrder: index,
        })),
      }),

      // Applications
      prisma.printerApplication.deleteMany({ where: { printerId: params.id } }),
      prisma.printerApplication.createMany({
        data: applications.map((app: any, index: number) => ({
          printerId: params.id,
          name: app.name,
          sortOrder: index,
        })),
      }),

      // Downloads
      prisma.printerDownload.deleteMany({ where: { printerId: params.id } }),
      prisma.printerDownload.createMany({
        data: downloads.map((doc: any, index: number) => ({
          printerId: params.id,
          title: doc.title,
          description: doc.description,
          downloadUrl: doc.downloadUrl,
          sortOrder: index,
        })),
      }),
    ]);

    return NextResponse.json(updatedPrinter[0]);
  } catch (error) {
    console.error("[PRINTER_PUT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}