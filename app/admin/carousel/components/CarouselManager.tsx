"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CarouselItemForm } from "./CarouselItemForm";

interface CarouselItem {
    id: string;
    type: "image" | "video";
    src: string;
    duration: number;
}

export function CarouselManager() {
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const res = await fetch("/api/admin/carousel");
        const data = await res.json();
        setItems(data);
    };

    const handleSave = async (formData: FormData, id?: string) => {
        setIsSaving(true);

        const url = id ? `/api/admin/carousel/${id}` : "/api/admin/carousel";

        const method = id ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Save failed");
            }

            await fetchItems();
            setEditingItem(null); // close AFTER save finishes
        } catch {
            alert("Failed to save carousel item");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/carousel/${id}`, { method: "DELETE" });
        fetchItems();
    };

    return (
        <div>
            {/* 🔒 GLOBAL BLOCKING LOADER */}
            <Dialog open={isSaving}>
                <DialogContent
                    className="sm:max-w-md"
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <VisuallyHidden>
                        <DialogTitle>
                            {editingItem
                                ? "Updating Carousel Item"
                                : "Uploading Carousel Item"}
                        </DialogTitle>
                    </VisuallyHidden>

                    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />

                        <h2 className="text-lg font-semibold">
                            {editingItem ? "Updating" : "Uploading"}{" "}
                            {editingItem?.type === "video" ? "Video" : "Image"}…
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Please wait while the file is being processed.
                            <br />
                            Do not close this window.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <h2 className="text-2xl font-semibold mb-4">Carousel Items</h2>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded"
                    >
                        <div>
                            <p>
                                <b>Type:</b> {item.type}
                            </p>
                            <p className="truncate max-w-md">
                                <b>Source:</b> {item.src}
                            </p>
                            <p>
                                <b>Duration:</b> {item.duration}s
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => setEditingItem(item)}>
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">
                    {editingItem
                        ? "Edit Carousel Item"
                        : "Add New Carousel Item"}
                </h3>

                <CarouselItemForm
                    item={
                        editingItem || {
                            id: "",
                            type: "image",
                            duration: 5,
                        }
                    }
                    onSave={handleSave}
                    onCancel={() => setEditingItem(null)}
                />
            </div>
        </div>
    );
}
