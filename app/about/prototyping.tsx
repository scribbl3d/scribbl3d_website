import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Prototyping() {
  return (
    <div className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h2 className="text-4xl font-bold mb-6">
              Rapid Prototyping Services
            </h2>
            <p className="text-xl mb-8">
              Turn your ideas into reality faster than ever. Our rapid
              prototyping services help you iterate quickly, test concepts, and
              bring your products to market with confidence.
            </p>
            <Button size="lg">Learn More</Button>
          </div>
          <div className="lg:w-1/2 relative h-96">
            <Image
              src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Rapid Prototyping"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
