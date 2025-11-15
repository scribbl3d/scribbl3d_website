export const getSizeLabel = (size: string): string => {
  const sizeMap: Record<string, string> = {
    S: "Small",
    M: "Medium",
    L: "Large",
    R: "Regular",
    XS: "Extra Small",
    XL: "Extra Large",
    XXL: "Extra Extra Large",
    "1/2": "Half Size",
    "1/4": "Quarter Size",
    "1/8": "Eighth Size",
    "1/16": "Sixteenth Size",
    "1/32": "Thirty-Second Size",
    "1/64": "Sixty-Fourth Size",
    "1/128": "One Hundred Twenty-Eighth Size",
    "1/256": "Two Hundred Fifty-Sixth Size",
    "1/512": "Five Hundred Twelfth Size",
    "1/1024": "One Thousand Twenty-Fourth Size",
  };
  return sizeMap[size] || size;
};

export const isStandardSize = (size: string): boolean => {
  const standardSizes = ["S", "M", "L", "R", "XS", "XL", "XXL"];
  return standardSizes.includes(size);
};

export const isFractionalSize = (size: string): boolean => {
  return /^\d+\/\d+$/.test(size);
};

export const getSizeType = (
  size: string
): "standard" | "fractional" | "custom" => {
  if (isStandardSize(size)) return "standard";
  if (isFractionalSize(size)) return "fractional";
  return "custom";
};
