"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import PrebuiltProductForm from "./PrebuiltProductForm";
import PrebuiltProductList from "./PrebuiltProductList";

export default function PrebuiltProductsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center mb-6">
                <Link href="/admin" passHref>
                    <Button variant="ghost" className="mr-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold">Prebuilt Products Old</h2>
            </div>
            <PrebuiltProductForm
                product={null}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
            />
            <PrebuiltProductList />
        </div>
    );
}
