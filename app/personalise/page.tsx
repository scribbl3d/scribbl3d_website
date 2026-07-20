import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import PersonaliseForm from "./personalise-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Custom 3D Printing - Upload Your Design | Scribbl3D",
    description: "Upload your STL/OBJ files for instant 3D printing quotes. Custom parts, prototypes, and personalized products. FDM & resin printing available. Fast turnaround, pan-India delivery.",
    keywords: [
        "custom 3D printing",
        "upload STL file",
        "3D print my design",
        "custom 3D parts",
        "personalized 3D printing",
        "3D printing quote",
        "upload 3D model",
        "custom prototype printing",
        "Scribbl3D custom"
    ],
    alternates: { canonical: "https://www.scribbl3d.com/personalise" },
    openGraph: {
        title: "Custom 3D Printing - Upload Your Design | Scribbl3D",
        description: "Upload your STL/OBJ files for instant 3D printing quotes. Custom parts, prototypes, and personalized products.",
        url: "https://www.scribbl3d.com/personalise",
        type: "website",
        locale: "en_IN",
        siteName: "Scribbl3D",
        images: [{
            url: "https://www.scribbl3d.com/og-personalise.png",
            width: 1200,
            height: 630,
            alt: "Custom 3D Printing Service"
        }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Custom 3D Printing - Upload Your Design | Scribbl3D",
        description: "Upload your STL/OBJ files for instant 3D printing quotes.",
        images: ["https://www.scribbl3d.com/og-personalise.png"],
    },
};

export default async function PersonalisePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-100 to-blue-200 text-gray-900 py-12 px-4 mt-[80px]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Customize Your Experience
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us understand your preferences so we can create the perfect
            personalized products for you.
          </p>
        </div>
        <PersonaliseForm userSession={session} />
      </div>
    </div>
  );
}
