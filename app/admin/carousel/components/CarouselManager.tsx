"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const res = await fetch("/api/admin/carousel");
        const data = await res.json();
        setItems(data);
    };

    const handleSave = async (formData: FormData, id?: string) => {
        const url = id ? `/api/admin/carousel/${id}` : "/api/admin/carousel";
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            body: formData,
        });

        if (res.ok) {
            fetchItems();
            setEditingItem(null);
        } else {
            alert("Failed to save carousel item");
        }
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/admin/carousel/${id}`, { method: "DELETE" });
        fetchItems();
    };

    return (
        <div>
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
                    item={editingItem || { id: "", type: "image", duration: 5 }}
                    onSave={handleSave}
                    onCancel={() => setEditingItem(null)}
                />
            </div>
        </div>
    );
}
