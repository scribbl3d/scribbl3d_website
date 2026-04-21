import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b sticky top-0 bg-background z-10">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center">
                    <Link href="/ops/control" passHref>
                        <Button variant="ghost" className="text-sm sm:text-base px-2 sm:px-4">
                            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                            <span className="sm:hidden">Back</span>
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">{children}</main>
        </div>
    );
}
