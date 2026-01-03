"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await fetch("/api/admin/logout", { method: "POST" });
        if (response.ok) {
            router.push("/admin/login");
        } else {
            console.error("Logout failed");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Admin Dashboard</h2>
                <Button onClick={handleLogout} variant="outline">
                    Logout
                </Button>
            </div>
            <nav className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/orders" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Orders
                    </Button>
                </Link>{" "}
                <Link href="/admin/products" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Filaments
                    </Button>
                </Link>
                <Link href="/admin/prebuilt-products" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Prebuilt Products
                    </Button>
                </Link>
                <Link href="/admin/printers" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Printers
                    </Button>
                </Link>
                <Link href="/admin/blogs" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Blogs
                    </Button>
                </Link>
                <Link href="/admin/carousel" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Carousel
                    </Button>
                </Link>
                <Link href="/admin/small-batch-manufacturing" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Small Batch Manufacturing
                    </Button>
                </Link>
                <Link href="/admin/prototyping-request" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Prototyping Requests
                    </Button>
                </Link>
                <Link href="/admin/personalise-responses" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Personalise Form Responses
                    </Button>
                </Link>
                <Link href="/admin/form3d-responses" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        3D Printing Requests
                    </Button>
                </Link>
                <Link href="/admin/announcements" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Manage Announcements
                    </Button>
                </Link>
                <Link href="/admin/hero-images" className="block">
                    <Button variant="outline" className="w-full h-24 text-lg">
                        Manage Hero Images
                    </Button>
                </Link>
            </nav>
        </div>
    );
}
