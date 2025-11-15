import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

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
  );
};

export default Services;
