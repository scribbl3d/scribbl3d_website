"use client";

import dynamic from "next/dynamic";
import HeroBanner from "./HeroBanner";
import BrowseByBrand from "./BrowseByBrand";
import BrowseByEcosystem from "./BrowseByEcosystem";

const BestSellers = dynamic(() => import("./BestSellers"), {
    loading: () => <div className="h-96 bg-gray-50" />,
});
const NewArrivals = dynamic(() => import("./NewArrivals"), {
    loading: () => <div className="h-96 bg-gray-50" />,
});
const CustomPrinting = dynamic(() => import("./CustomPrinting"), {
    ssr: false,
});
const LearningHub = dynamic(() => import("./LearningHub"));
const CommunityShowcase = dynamic(() => import("./CommunityShowcase"), {
    ssr: false,
});
const CustomerReviews = dynamic(() => import("./CustomerReviews"));

interface LandingContentProps {
    heroBanners: any[];
    newArrivals: any[];
    blogs: any[];
    communityImages: any[];
    testimonials: any[];
    bestSellers: any[];
}

export default function LandingContent({
    heroBanners,
    newArrivals,
    blogs,
    communityImages,
    testimonials,
    bestSellers,
}: LandingContentProps) {
    return (
        <>
            <HeroBanner slides={heroBanners} animate={true} />
            <BrowseByBrand />
            <BrowseByEcosystem />
            <BestSellers items={bestSellers} />
            <NewArrivals items={newArrivals} />
            <CustomPrinting />
            <LearningHub blogs={blogs} />
            <CommunityShowcase images={communityImages} />
            <CustomerReviews testimonials={testimonials} />
        </>
    );
}
