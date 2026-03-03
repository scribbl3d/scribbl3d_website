"use client";

import Loader from "@/components/Loader";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useState } from "react";
import AnnouncementBanner from "./landingpage/AnnouncementBanner";
import MakeItYourOwn from "./landingpage/herosectionimage";
import ImageCarousel from "./landingpage/image-carousel";

export default function Home() {
    const [isHeroVisible, setIsHeroVisible] = useState(false);

    const isLoading = useAutoImageLoader();
    return (
        <main className="w-full">
            {isLoading && <Loader />}

            <div
                className="pt-[80px]"
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.8s ease-in-out",
                }}
            >
                <AnnouncementBanner />
                <MakeItYourOwn onHeroVisible={setIsHeroVisible} />
                {isHeroVisible && <ImageCarousel />}
            </div>
        </main>
    );
}
