"use client";

import Loader from "@/components/Loader";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useState } from "react";
import AnnouncementBanner from "./landingpage/AnnouncementBanner";
import Cosplay from "./landingpage/cosplay";
import Figurine from "./landingpage/figurine";
import MakeItYourOwn from "./landingpage/herosectionimage";
import HomeEssentials from "./landingpage/home-essentials";
import HouseholdUtilities from "./landingpage/household-utilities";
import ImageCarousel from "./landingpage/image-carousel";
import Keychains from "./landingpage/keychains";
import Kits from "./landingpage/kits";
import Lamps from "./landingpage/lamps";
import NewLaunch from "./landingpage/new-launch";
import Personalised from "./landingpage/personalised";
import Statues from "./landingpage/statues";
import Thelatest from "./landingpage/the-latest";
import TrendingNow from "./landingpage/trending-now";
import Utilities from "./landingpage/utilities";
import WallDecor from "./landingpage/wall-decor";

export default function Home() {
    const [isHeroVisible, setIsHeroVisible] = useState(false);
    // Automatically detects all images in all sub-sections
    const isLoading = useAutoImageLoader();
    return (
        <main className="w-full">
            {isLoading && <Loader />}

            <div
                className="pt-[80px]"
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.8s ease-in-out", // Smoother reveal
                }}
            >
                <AnnouncementBanner />
                <MakeItYourOwn onHeroVisible={setIsHeroVisible} />
                {isHeroVisible && <ImageCarousel />}
                <TrendingNow />
                <NewLaunch />
                <HomeEssentials />
                <Thelatest />
                <Cosplay />
                <Figurine />
                <HouseholdUtilities />
                <Keychains />
                <Kits />
                <Lamps />
                <Personalised />
                <Statues />
                <Utilities />
                <WallDecor />
            </div>
        </main>
    );
}
