"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";

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
                    <h2 className="text-2xl font-bold">Filaments List</h2>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    Add New Product
                </Button>
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
