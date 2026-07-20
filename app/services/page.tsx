import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import ServiceSchema from "@/components/seo/ServiceSchema";

export const metadata: Metadata = {
    title: "3D Printing Services India - Rapid Prototyping & Custom Manufacturing | Scribbl3D",
    description: "Professional 3D printing services in Delhi NCR. Rapid prototyping, small batch manufacturing, custom parts. FDM & resin printing. Material expertise from PLA to engineering polymers. Fast turnaround.",
    keywords: [
        "3D printing services India",
        "rapid prototyping Delhi",
        "custom 3D printing",
        "small batch manufacturing",
        "3D printing service near me",
        "FDM printing service",
        "resin printing service",
        "prototype printing India",
        "Scribbl3D services"
    ],
    alternates: { canonical: "https://www.scribbl3d.com/services" },
    openGraph: {
        title: "3D Printing Services India - Rapid Prototyping & Custom Manufacturing",
        description: "Professional 3D printing services in Delhi NCR. Rapid prototyping, small batch manufacturing, custom parts.",
        url: "https://www.scribbl3d.com/services",
        type: "website",
        locale: "en_IN",
        siteName: "Scribbl3D",
        images: [{
            url: "https://www.scribbl3d.com/og-services.png",
            width: 1200,
            height: 630,
            alt: "Scribbl3D 3D Printing Services"
        }],
    },
    twitter: {
        card: "summary_large_image",
        title: "3D Printing Services India | Scribbl3D",
        description: "Professional 3D printing services - rapid prototyping, custom manufacturing, small batch production.",
        images: ["https://www.scribbl3d.com/og-services.png"],
    },
};

// Dynamically import components for better performance
const CompanySlider = dynamic(
  () => import("@/app/services/_component/CompanySlider"),
  {
    loading: () => <div className="h-[120px] animate-pulse bg-gray-800" />,
  }
);

const OfferSection = dynamic(
  () => import("@/app/services/_component/OfferSection"),
  {
    loading: () => <div className="h-[400px] animate-pulse bg-gray-800" />,
  }
);

const TestSection = dynamic(
  () => import("@/app/services/_component/TestSection"),
  {
    loading: () => <div className="h-[600px] animate-pulse bg-gray-800" />,
  }
);

const FAQ = dynamic(() => import("@/app/services/_component/FAQ"), {
  loading: () => <div className="h-[400px] animate-pulse bg-gray-800" />,
});

const Hero = dynamic(() => import("@/app/services/_component/hero_services"), {
  loading: () => <div className="h-[400px] animate-pulse bg-gray-800" />,
});

const Herovid = dynamic(() => import("@/app/services/_component/herovid"), {
  loading: () => <div className="h-screen animate-pulse bg-gray-800" />,
});

const Services = () => {
  return (
    <>
      <ServiceSchema
        name="3D Printing Services"
        description="Professional 3D printing services including rapid prototyping, small batch manufacturing, and custom parts production. FDM and resin printing with material expertise from PLA to engineering polymers."
        provider="Scribbl3D"
        serviceType="3D Printing Service"
        url="https://www.scribbl3d.com/services"
      />
      
      <div className="w-full min-h-screen mt-[72px] bg-[#141414]">
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          }
        >
          <Herovid videoSrc="/services/herovid/heroser.mp4" />
          <Hero />
          <CompanySlider />
          <OfferSection />
          <TestSection />
          <FAQ />
        </Suspense>
      </div>
    </>
  );
};

export default Services;
