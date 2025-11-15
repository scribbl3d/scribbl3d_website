"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductList from "./ProductList";
import ProductForm from "./ProductForm";
import { useState } from "react";

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin" passHref>
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Filament Products</h2>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Add New Product</Button>
      </div>
      <ProductForm
        product={null}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
      <ProductList />
    </div>
  );
}
