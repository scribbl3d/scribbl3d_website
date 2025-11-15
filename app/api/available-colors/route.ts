import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(
      { error: "Category is required" },
      { status: 400 }
    );
  }

  try {
    const availableColors = await prisma.availableColors.findUnique({
      where: { category },
    });

    if (!availableColors) {
      return NextResponse.json({ colors: {}, colorCategories: [] });
    }

    return NextResponse.json({
      colors: availableColors.colors,
      colorCategories: availableColors.colorCategories,
    });
  } catch (error) {
    console.error("Error fetching available colors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { category, colorName, hexCode, finishType } = await request.json();

    if (!category || !colorName || !hexCode || !finishType) {
      return NextResponse.json(
        {
          error: "Category, color name, hex code, and finish type are required",
        },
        { status: 400 }
      );
    }

    // Get existing colors for the category
    const existingColors = await prisma.availableColors.findUnique({
      where: { category },
    });

    const colors = (existingColors?.colors as Record<string, string[]>) || {};
    const colorCategories = (existingColors?.colorCategories as string[]) || [];

    // Use the provided finishType
    const colorCategory = finishType;
    if (!colorCategories.includes(colorCategory)) {
      colorCategories.push(colorCategory);
    }

    // Add the color to the appropriate category
    if (!colors[colorCategory]) {
      colors[colorCategory] = [];
    }
    if (!colors[colorCategory].includes(colorName)) {
      colors[colorCategory].push(colorName);
    }

    // Update or create the available colors record
    await prisma.availableColors.upsert({
      where: { category },
      update: {
        colors,
        colorCategories,
      },
      create: {
        category,
        colors,
        colorCategories,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding color:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { category, colorName } = await request.json();

    if (!category || !colorName) {
      return NextResponse.json(
        { error: "Category and color name are required" },
        { status: 400 }
      );
    }

    // Get existing colors for the category
    const existingColors = await prisma.availableColors.findUnique({
      where: { category },
    });

    if (!existingColors) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const colors = existingColors.colors as Record<string, string[]>;
    const colorCategories = existingColors.colorCategories as string[];

    // Find and remove the color from its category
    const colorCategory = colorName.split(" ").pop() || "Other";
    if (colors[colorCategory]) {
      colors[colorCategory] = colors[colorCategory].filter(
        (color) => color !== colorName
      );

      // If the category is now empty, remove it
      if (colors[colorCategory].length === 0) {
        delete colors[colorCategory];
        const categoryIndex = colorCategories.indexOf(colorCategory);
        if (categoryIndex > -1) {
          colorCategories.splice(categoryIndex, 1);
        }
      }
    }

    // Update the available colors record
    await prisma.availableColors.update({
      where: { category },
      data: {
        colors,
        colorCategories,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing color:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
