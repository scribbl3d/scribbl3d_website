"use client";

import Loader from "@/components/Loader";
import { useAutoImageLoader } from "@/hooks/useAutoImageLoader";
import { useEffect, useState } from "react";

import EcosystemSection from "./components/EcosystemSection";
import GlobalPresenceSection from "./components/GlobalPresenceSection";
import HeroSection from "./components/HeroSection";
import OurStorySection from "./components/OurStorySection";
import StatsSection from "./components/StatsSection";
import TrustedBySection from "./components/TrustedBySection";
import ValuesSection from "./components/ValuesSection";

export default function AboutContent() {
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
        <main
            style={{
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                margin: 0,
                padding: 0,
            }}
        >
            {isLoading && <Loader />}
            <div
                style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.8s ease-in-out",
                }}
            >
                {/* Pass animate={isReady} to HeroSection if it supports animation triggers like HeroBanner does */}
                <HeroSection />
                <StatsSection />
                <OurStorySection />
                <TrustedBySection />
                <EcosystemSection />
                <ValuesSection />
                <GlobalPresenceSection />
            </div>
        </main>
    );
}
