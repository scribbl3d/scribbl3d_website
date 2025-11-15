import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Leaf, Heart, Recycle } from "lucide-react";

const features = [
  {
    title: "Innovation",
    description:
      "We constantly push the boundaries of whats possible in 3D printing.",
    icon: Lightbulb,
  },
  {
    title: "Sustainability",
    description:
      "Our eco-friendly practices minimize waste and promote responsible manufacturing.",
    icon: Leaf,
  },
  {
    title: "Integrity",
    description:
      "We conduct our business with honesty, transparency, and ethical practices.",
    icon: Heart,
  },
  {
    title: "Circular Economy",
    description:
      "We promote recycling and reusing materials to reduce environmental impact.",
    icon: Recycle,
  },
];

export function CompanyFeatures() {
  return (
    <section className="w-full py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">
          What Sets Us Apart
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <feature.icon className="w-8 h-8 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
