import EcosystemSection from "./components/EcosystemSection";
import GlobalPresenceSection from "./components/GlobalPresenceSection";
import HeroSection from "./components/HeroSection";
import OurStorySection from "./components/OurStorySection";
import StatsSection from "./components/StatsSection";
import TrustedBySection from "./components/TrustedBySection";
import ValuesSection from "./components/ValuesSection";

export const metadata = {
    title: "About Us | Scribbl3D",
    description:
        "India's leading industrial additive manufacturing partner — 500+ printers, 12+ years, 150+ cities served.",
};

export default function AboutPage() {
    return (
        <main
            style={{
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                margin: 0,
                padding: 0,
            }}
        >
            <HeroSection />
            <StatsSection />
            <OurStorySection />
            <TrustedBySection />
            <EcosystemSection />
            <ValuesSection />
            <GlobalPresenceSection />
        </main>
    );
}
