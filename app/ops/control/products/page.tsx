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
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-0">
                    <Link href="/ops/control" passHref>
                        <Button variant="ghost" className="text-sm sm:text-base px-2 sm:px-4 mr-2 sm:mr-4">
                            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h2 className="text-xl sm:text-2xl font-bold">Filaments List</h2>
                </div>
                <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto text-sm sm:text-base">
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
