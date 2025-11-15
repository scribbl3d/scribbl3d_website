import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const founders = [
  {
    name: "Emily Chen",
    role: "CEO & Co-founder",
    bio: "With a background in mechanical engineering and a passion for 3D printing, Emily leads our company vision and strategy.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80",
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-founder",
    bio: "Michael's expertise in materials science and additive manufacturing drives our technological innovations.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
  },
  {
    name: "Sarah Thompson",
    role: "COO & Co-founder",
    bio: "Sarah's experience in supply chain management ensures our operations run smoothly and efficiently.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
  },
];

export function Founders() {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Meet Our Founders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, index) => (
            <Card
              key={index}
              className="bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="relative w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <CardTitle className="text-center">{founder.name}</CardTitle>
                <p className="text-center text-gray-600">{founder.role}</p>
              </CardHeader>
              <CardContent>
                <p className="text-center">{founder.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
