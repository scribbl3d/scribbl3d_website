import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Prototyping } from "./prototyping";
import { Founders } from "./founders";

const ClientParallaxSection = dynamic(
  () => import("./client-parallax-section")
);
const Values = dynamic(() => import("./values").then((mod) => mod.Values), {
  ssr: true,
});
const Journey = dynamic(() => import("./journey").then((mod) => mod.Journey), {
  ssr: true,
});
const Mission = dynamic(() => import("./mission").then((mod) => mod.Mission), {
  ssr: true,
});

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <ClientParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        height="100vh"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8 text-center">
            About Scribbl3D
          </h2>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8">
            From Vision to Reality—One Layer at a Time
          </p>
          <p className="text-xl text-center max-w-3xl mx-auto mb-8">
            What began as a spark between passionate makers has grown into one
            of India&rsquo;s most trusted 3D printing partners. At Scribbl3D, we
            believe every idea—no matter how bold or complex—deserves the chance
            to become something real.
          </p>
          <p className="text-xl text-center max-w-3xl mx-auto">
            We exist to make innovation accessible, reliable, and sustainable
            for creators, startups, and enterprises across industries. Whether
            it&rsquo;s a functional prototype, a custom component, or top-tier
            printing filament—if you can imagine it, we can help you build it.
          </p>
        </div>
      </section>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Journey />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Mission />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Values />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Values />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Prototyping />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <Founders />
      </Suspense>
    </div>
  );
}
