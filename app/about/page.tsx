import type { Metadata } from 'next';
import AboutContent from "./AboutContent"; // Adjust path if necessary

export const metadata: Metadata = {
    title: 'About Us — Scribbl3D | 3D Printers, Filaments & Resins India',
    description:
        "India's leading industrial additive manufacturing partner — 500+ printers, 5+ years, 150+ cities served.",
    keywords: [
        'About Scribbl3D',
        'Scribbl3D company profile',
        '3D printing solutions India',
        'additive manufacturing company India',
        'buy 3D printing filaments India',
        'custom 3D printing services India',
        'FDM and SLA 3D printing supplier',
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/about' },
    openGraph: {
        title: 'About Us — Scribbl3D | 3D Printers, Filaments & Resins India',
        description:
            "Discover Scribbl3D: India's leading industrial additive manufacturing partner, empowering creators, engineers, and businesses with premium 3D printing materials and solutions.",
        url: 'https://www.scribbl3d.com/about',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-image.png',
            width: 1200,
            height: 630,
            alt: 'About Scribbl3D - Additive Manufacturing & 3D Printing Solutions India',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Us — Scribbl3D | 3D Printers, Filaments & Resins India',
        description:
            "India's leading industrial additive manufacturing partner — 500+ printers, 5+ years, 150+ cities served.",
        images: ['https://www.scribbl3d.com/og-image.png'],
    },
};

export default function AboutPage() {
    return <AboutContent />;
}
