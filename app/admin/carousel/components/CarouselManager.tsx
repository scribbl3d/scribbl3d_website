"use client";

import { useState, useEffect } from "react";
import { CarouselItemForm } from "./CarouselItemForm";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CarouselItem {
  id: string;
  type: string;
  src: string;
  duration: number;
}

export function CarouselManager() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  const fetchCarouselItems = async () => {
    try {
      const response = await fetch("/api/admin/carousel");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error("Failed to fetch carousel items");
      }
    } catch (error) {
      console.error("Error fetching carousel items:", error);
    }
  };

  const handleSave = async (item: CarouselItem) => {
    try {
      const url = item.id
        ? `/api/admin/carousel/${item.id}`
        : "/api/admin/carousel";
      const method = item.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        fetchCarouselItems();
        setEditingItem(null);
      } else {
        console.error("Failed to save carousel item");
      }
    } catch (error) {
      console.error("Error saving carousel item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/carousel/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchCarouselItems();
      } else {
        console.error("Failed to delete carousel item");
      }
    } catch (error) {
      console.error("Error deleting carousel item:", error);
    }
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
                <strong>Type:</strong> {item.type}
              </p>
              <p>
                <strong>Source:</strong> {item.src}
              </p>
              <p>
                <strong>Duration:</strong> {item.duration} seconds
              </p>
            </div>
            <div>
              <Button onClick={() => setEditingItem(item)} className="mr-2">
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
          {editingItem ? "Edit Carousel Item" : "Add New Carousel Item"}
        </h3>
        <CarouselItemForm
          item={editingItem || { id: "", type: "", src: "", duration: 5 }}
          onSave={handleSave}
          onCancel={() => setEditingItem(null)}
        />
      </div>
    </div>
  );
}
