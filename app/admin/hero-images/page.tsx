"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
interface HeroImage {
    id: string;
    page: string;
    imageUrl: string;
    alt: string;
}

export default function HeroImagesPage() {
    const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPage, setSelectedPage] = useState<string>("");
    const [altText, setAltText] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const pages = [
        { id: "filaments", name: "Filaments Page" },
        { id: "landing", name: "Landing Page" },
    ];

    useEffect(() => {
        fetchHeroImages();
    }, []);

    const fetchHeroImages = async () => {
        try {
            const response = await fetch("/api/admin/hero-images");
            if (response.ok) {
                const data = await response.json();
                setHeroImages(data);
            }
        } catch (error) {
            console.error("Error fetching hero images:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !selectedPage || !altText) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("page", selectedPage);
        formData.append("alt", altText);

        try {
            const response = await fetch("/api/admin/hero-images", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                await fetchHeroImages();
                setSelectedFile(null);
                setSelectedPage("");
                setAltText("");
                // Reset file input
                const fileInput = document.querySelector(
                    'input[type="file"]'
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            } else {
                console.error("Failed to upload image");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Dialog open={isLoading}>
                <DialogContent
                    className="sm:max-w-md"
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    <VisuallyHidden>
                        <DialogTitle>Uploading Image</DialogTitle>
                    </VisuallyHidden>

                    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />

                        <h2 className="text-lg font-semibold">
                            Uploading Image…
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Please wait while your image is being uploaded. Do
                            not close this window.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center mb-6">
                <Link href="/admin" passHref>
                    <Button variant="ghost" className="mr-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold">Manage Hero Images</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Hero Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="page">Select Page</Label>
                            <select
                                id="page"
                                value={selectedPage}
                                onChange={(e) =>
                                    setSelectedPage(e.target.value)
                                }
                                className="w-full p-2 border rounded-md"
                                required
                            >
                                <option value="">Select a page</option>
                                {pages.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {page.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Upload Image</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alt">Alt Text</Label>
                            <Input
                                id="alt"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Enter descriptive alt text"
                                required
                            />
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Uploading..." : "Upload Image"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {heroImages.map((image) => (
                    <Card key={image.id}>
                        <CardContent className="p-4">
                            <div className="aspect-video relative mb-4">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.alt}
                                    fill
                                    className="object-cover rounded-md"
                                    unoptimized={true} // Key prop
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">
                                    Page:{" "}
                                    {
                                        pages.find((p) => p.id === image.page)
                                            ?.name
                                    }
                                </p>
                                <p className="text-sm text-gray-500">
                                    Alt: {image.alt}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
