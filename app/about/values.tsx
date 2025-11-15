import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Lightbulb, Target } from "lucide-react";

const values = [
  {
    title: "Customer-First Mindset",
    description:
      "We listen. We adapt. We deliver. Every decision is made with your success in mind.",
    icon: Users,
  },
  {
    title: "Integrity You Can Count On",
    description:
      "We say what we mean and do what we say. Transparent processes and honest communication are the foundation of our work.",
    icon: Heart,
  },
  {
    title: "Innovation with Purpose",
    description:
      "We're constantly evolving—exploring new materials, methods, and machines to bring smarter, more sustainable solutions to life.",
    icon: Lightbulb,
  },
  {
    title: "Passion That Shows",
    description:
      "We love what we do, and it shows in every print, every prototype, and every partnership we build.",
    icon: Target,
  },
];

export function Values() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-100 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <value.icon className="w-12 h-12 text-primary mb-4" />
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
