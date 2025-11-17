import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CarouselManager } from "./components/CarouselManager";

export default function AdminCarouselPage() {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Link href="/admin">
                    <Button variant="ghost" className="p-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-6">Carousel Management</h1>
            <CarouselManager />
        </div>
    );
}
