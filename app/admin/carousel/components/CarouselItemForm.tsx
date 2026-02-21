"use client";

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
import { useEffect, useState } from "react";

interface CarouselItem {
    id: string;
    type: "image" | "video";
    duration: number;
}

interface CarouselItemFormProps {
    item: CarouselItem;
    onSave: (formData: FormData, id?: string) => Promise<void>;
    onCancel: () => void;
}

export function CarouselItemForm({
    item,
    onSave,
    onCancel,
}: CarouselItemFormProps) {
    const [type, setType] = useState<"image" | "video">(item.type || "image");
    const [duration, setDuration] = useState(item.duration || 5);
    const [file, setFile] = useState<File | null>(null);

    const isEdit = !!item.id;

    useEffect(() => {
        setType(item.type || "image");
        setDuration(item.duration || 5);
        setFile(null);
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file && !isEdit) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        if (file) formData.append("file", file);
        formData.append("type", type);
        formData.append("duration", String(duration));

        await onSave(formData, item.id || undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Type</Label>
                <Select
                    value={type}
                    onValueChange={(v) => setType(v as "image" | "video")}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Upload File</Label>
                <Input
                    type="file"
                    accept={type === "image" ? "image/*" : "video/*"}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
            </div>

            <div>
                <Label>Duration (seconds)</Label>
                <Input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {isEdit ? "Update" : "Add"} Carousel Item
                </Button>
            </div>
        </form>
    );
}
