"use client";

import Loader from "@/components/Loader";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useEffect, useState } from "react";

import BestSellers from "./BestSellers";
import BrowseByBrand from "./BrowseByBrand";
import BrowseByEcosystem from "./BrowseByEcosystem";
import CommunityShowcase from "./CommunityShowcase";
import CustomerReviews from "./CustomerReviews";
import CustomPrinting from "./CustomPrinting";
import HeroBanner from "./HeroBanner";
import LearningHub from "./LearningHub";
import NewArrivals from "./NewArrivals";

interface LandingContentProps {
    heroBanners: any[];
    newArrivals: any[];
    blogs: any[];
    communityImages: any[];
    testimonials: any[];
}

export default function LandingContent({
    heroBanners,
    newArrivals,
    blogs,
    communityImages,
    testimonials,
}: LandingContentProps) {
    const isLoading = useAutoImageLoader();
    const [isReady, setIsReady] = useState(false);

    // Once loading finishes, wait for the opacity transition to complete, then trigger animations
    useEffect(() => {
        if (!isLoading) {
            // Small delay to let the opacity fade-in start, then fire animations
            const timer = setTimeout(() => setIsReady(true), 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    return (
        <>
            {isLoading && <Loader />}
            <div
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.8s ease-in-out",
                }}
            >
                <HeroBanner slides={heroBanners} animate={isReady} />
                <BrowseByBrand animate={isReady} />
                <BrowseByEcosystem />
                <BestSellers />
                <NewArrivals items={newArrivals} />
                <CustomPrinting />
                <LearningHub blogs={blogs} />
                <CommunityShowcase images={communityImages} />
                <CustomerReviews testimonials={testimonials} />
            </div>
        </>
    );
}
