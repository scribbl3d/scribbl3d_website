import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSizeLabel } from "@/lib/size-mapper";

interface Size {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
}

interface ChooseSizeSectionProps {
  sizes: Size[];
  initialPrice: number;
  initialOriginalPrice: number;
  onSizeSelect: (size: string | null) => void;
}

export default function ChooseSizeSection({
  sizes,
  onSizeSelect,
}: ChooseSizeSectionProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Label className="text-gray-600 font-medium text-base">
        Choose a Size
      </Label>
      <RadioGroup
        value={selectedSize || ""}
        onValueChange={(value) => {
          setSelectedSize(value);
          onSizeSelect(value);
        }}
        className="flex flex-wrap gap-4"
      >
        {sizes.map((size) => (
          <Label
            key={size.id}
            className={`inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all ${
              selectedSize === size.id
                ? "bg-[#EEF0F7] text-[#2B3674]"
                : "bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="relative flex items-center justify-center">
              <RadioGroupItem
                value={size.id}
                className={`h-5 w-5 border-2 before:hidden after:hidden ${
                  selectedSize === size.id
                    ? "border-[#2B3674] bg-[#2B3674]"
                    : "border-gray-400"
                }`}
              />
            </div>
            <span className="text-lg font-medium">
              {getSizeLabel(size.name)}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
