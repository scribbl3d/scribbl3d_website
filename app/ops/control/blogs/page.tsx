import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlogManager from "./components/BlogManager";

export default function AdminBlogsPage() {
    return (
        <div className="px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <Link href="/ops/control" passHref>
                    <Button variant="ghost" className="text-sm sm:text-base px-2 sm:px-4">
                        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h2 className="text-2xl sm:text-3xl font-bold">Blog Management</h2>
            </div>
            <BlogManager />
        </div>
    );
}
