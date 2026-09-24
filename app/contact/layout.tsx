import type { Metadata } from "next";

const description =
  "Contact Scribbl3D in Nangloi, Delhi for 3D printers, filaments, resins, and 3D printing services. Call, email, or send us a message.";

export const metadata: Metadata = {
  title: "Contact Us",
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Scribbl3D",
    description,
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | Scribbl3D",
    description,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
