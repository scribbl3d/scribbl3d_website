// Regular color mappings
export const colorMappings: Record<string, string> = {
  // Basic colors
  White: "#FFFFFF",
  Black: "#000000",
  Red: "#FF0000",
  Blue: "#0000FF",
  Green: "#008000",
  Yellow: "#FFFF00",
  Orange: "#FFA500",
  Pink: "#FFC0CB",
  Purple: "#800080",
  Brown: "#A52A2A",
  Grey: "#808080",
  Violet: "#8F00FF",
  "Sky Blue": "#87CEEB",
  "Dark Blue": "#00008B",
  "Slate Grey": "#708090",
  "Special Grey": "#A9A9A9",
  "Navy Fusion": "#000080",

  // Transparent variations
  Transparent: "rgba(255, 255, 255, 0.5)",
  Transcrystal: "rgba(255, 255, 255, 0.7)",

  // Natural variations
  Natural: "#F5DEB3",
  Skin: "#FFE5B4",

  // Special finishes
  Silver: "#C0C0C0",
  Gold: "#FFD700",
  Copper: "#B87333",
  Bronze: "#CD7F32",
  "Sparkling Silver": "#E8E8E8",

  // Matte variations
  "White Matte": "#F5F5F5",
  "Red Matte": "#CC0000",
  "Pink Matte": "#FFB6C1",
  "Blue Matte": "#0000CC",
  "Orange Matte": "#FF8C00",
  "Green Matte": "#006400",
  "Black Matte": "#1A1A1A",

  // Silk variations
  "Yellow Silk": "#FFD700",
  "Red Silk": "#FF0000",
  "Green Silk": "#008000",
  "White Silk": "#FFFFFF",
  "Blue Silk": "#0000FF",
  "Black Silk": "#000000",

  // Special Grade variations
  "Silver Special Grade": "#C0C0C0",
  "Gold Special Grade": "#FFD700",
  "Copper Special Grade": "#B87333",
  "Bronze Special Grade": "#CD7F32",
  "Sparkling Silver Special Grade": "#E8E8E8",
  "GID Green Special Grade": "#90EE90",
  "GID Blue Special Grade": "#87CEEB",

  // Gloss variations
  "Yellow Gloss": "#FFD700",
  "White Gloss": "#FFFFFF",
  "Violet Gloss": "#8F00FF",
  "Sky Blue Gloss": "#87CEEB",
  "Red Gloss": "#FF0000",
  "Skin Gloss": "#FFE5B4",
  "Pink Gloss": "#FFC0CB",
  "Orange Gloss": "#FFA500",
  "Grey Gloss": "#808080",
  "Green Gloss": "#008000",
  "Dark Blue Gloss": "#00008B",
  "Brown Gloss": "#A52A2A",
  "Black Gloss": "#000000",

  // ABS variations
  "Black ABS": "#000000",
  "Blue ABS": "#0000FF",
  "Carbon Fiber ABS": "#333333",
  "Dark Blue ABS": "#00008B",
  "Green ABS": "#008000",
  "Grey ABS": "#808080",
  "Orange ABS": "#FFA500",
  "Red ABS": "#FF0000",
  "Violet ABS": "#8F00FF",
  "White ABS": "#FFFFFF",

  // PETG variations
  "Transparent PETG": "rgba(255, 255, 255, 0.5)",
  "White PETG": "#FFFFFF",
  "Blue PETG": "#0000FF",
  "Sky Blue PETG": "#87CEEB",
  "Carbon Fiber PETG": "#333333",
  "Black PETG": "#000000",

  // NYLON variations
  "White Nylon": "#FFFFFF",
  "Natural Nylon": "#F5DEB3",
  "Black Nylon": "#000000",

  // TPU variations
  "Black TPU": "#000000",
  "Blue TPU": "#0000FF",
  "Green TPU": "#008000",
  "Navy Fusion TPU": "#000080",
  "Orange TPU": "#FFA500",
  "Red TPU": "#FF0000",
  "Slate Grey TPU": "#708090",
  "Special Grey TPU": "#A9A9A9",
  "Transcrystal TPU": "rgba(255, 255, 255, 0.7)",
  "White TPU": "#FFFFFF",
  "Yellow TPU": "#FFFF00",
};

// Special materials that need texture images
export const specialMaterials = new Set([
  "Wood Special Grade",
  "Marble Special Grade",
  "Carbon Special Grade",
  "Carbon Fiber ABS",
  "Carbon Fiber PETG",
  "Sparkling Silver Special Grade",
  "GID Green Special Grade",
  "GID Blue Special Grade",
]);

// Get base color name by removing finish types
function getBaseColorName(colorName: string): string {
  return colorName
    .replace(/(Matte|Gloss|Special Grade|Silk| PETG| NYLON| ABS| TPU)$/, "")
    .trim();
}

// Get color or texture for a given color name
export function getColorOrTexture(colorName: string): {
  type: "color" | "texture";
  value: string;
} {
  // Check if it's a special material that needs texture
  if (specialMaterials.has(colorName)) {
    return {
      type: "texture",
      value: `/textures/${colorName.toLowerCase().replace(/\s+/g, "-")}.jpg`,
    };
  }

  // Get base color name
  const baseColor = getBaseColorName(colorName);

  // Look up the color in our mappings
  const color = colorMappings[baseColor];
  if (color) {
    return {
      type: "color",
      value: color,
    };
  }

  // Special handling for GID (Glow in Dark) colors
  if (colorName.includes("GID")) {
    return {
      type: "color",
      value: "#90EE90", // Light green color for GID
    };
  }

  // Fallback to a default color
  return {
    type: "color",
    value: "#808080",
  };
}

// Get contrast text color for a given background color
export function getContrastTextColor(hexColor: string): string {
  // Remove the # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
