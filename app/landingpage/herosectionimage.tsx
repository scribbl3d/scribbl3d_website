"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroImage {
    id: string;
    page: string;
    imageUrl: string;
    alt: string;
}

type Props = {
    onHeroVisible?: (visible: boolean) => void;
};

export default function MakeItYourOwn({ onHeroVisible }: Props) {
    const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroImage = async () => {
            try {
                const res = await fetch("/api/hero-image?page=landing");
                if (!res.ok) {
                    onHeroVisible?.(false);
                    return;
                }

                const data = await res.json();

                if (data?.imageUrl) {
                    setHeroImage(data);
                    onHeroVisible?.(true);
                } else {
                    onHeroVisible?.(false);
                }
            } catch (error) {
                console.error("Failed to load hero image", error);
                onHeroVisible?.(false);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroImage();
    }, [onHeroVisible]);

    // ✅ Skeleton matches final size → no jump
    if (loading) {
        return (
            <div className="w-full aspect-[16/9] bg-gray-100 animate-pulse" />
        );
    }

    if (!heroImage) return null;

    return (
        <div className="relative w-full aspect-[16/9] overflow-hidden">
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.alt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />
        </div>
    );
}
