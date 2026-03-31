import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlogManager from "./components/BlogManager";

export default function AdminBlogsPage() {
    return (
        <div>
            <div className="flex items-center mb-6">
                <Link href="/ops/control" passHref>
                    <Button variant="ghost" className="mr-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold">Blog Management</h2>
            </div>
            <BlogManager />
        </div>
    );
}
