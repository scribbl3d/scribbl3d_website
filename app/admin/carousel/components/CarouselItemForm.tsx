"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CarouselItem {
  id: string;
  type: string;
  src: string;
  duration: number;
}

interface CarouselItemFormProps {
  item: CarouselItem;
  onSave: (item: CarouselItem) => void;
  onCancel: () => void;
}

export function CarouselItemForm({
  item,
  onSave,
  onCancel,
}: CarouselItemFormProps) {
  const [formData, setFormData] = useState<CarouselItem>(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) : value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={handleTypeChange} value={formData.type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="src">Source URL</Label>
        <Input
          id="src"
          name="src"
          value={formData.src}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (seconds)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          required
          min={1}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {item.id ? "Update" : "Add"} Carousel Item
        </Button>
      </div>
    </form>
  );
}
