import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Users } from "lucide-react";

const journeySteps = [
  {
    title: "The Beginning",
    description:
      "Scribbl3D was founded with one goal: to simplify the process of transforming concepts into physical form. Frustrated by long lead times and inflexible systems, we saw an opportunity to create a better, more agile 3D printing ecosystem.",
    icon: Sparkles,
  },
  {
    title: "The Growth",
    description:
      "We quickly evolved—expanding our services, refining our processes, and building long-term relationships with clients who value quality, speed, and care.",
    icon: TrendingUp,
  },
  {
    title: "The Now",
    description:
      "Today, we're more than just a service provider—we're collaborators in innovation, with a growing community of engineers, designers, educators, and entrepreneurs.",
    icon: Users,
  },
];

export function Journey() {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">Our Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {journeySteps.map((step, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <step.icon className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
