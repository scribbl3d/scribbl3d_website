"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroImage {
    id: string;
    page: string;
    imageUrl: string;
    alt: string;
}

export default function MakeItYourOwn() {
    const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroImage = async () => {
            try {
                const res = await fetch("/api/hero-image?page=landing");
                if (!res.ok) return;

                const data = await res.json();
                setHeroImage(data);
            } catch (error) {
                console.error("Failed to load hero image", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroImage();
    }, []);

    // Optional: skeleton / placeholder (NO IMAGE FALLBACK)
    if (loading) {
        return <div className="w-full h-[60vh] bg-gray-100 animate-pulse" />;
    }

    if (!heroImage) {
        return null; // or a design placeholder
    }

    return (
        <div className="relative w-full h-[60vh]">
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.alt}
                fill
                priority
                className="object-cover"
            />
        </div>
    );
}
