import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

export const metadata: Metadata = {
    title: 'Buy 3D Printers Online in India — Bambu Lab, Creality, Anycubic | Scribbl3D',
    description:
        'Shop FDM and resin 3D printers from Bambu Lab, Creality, Anycubic, Elegoo, and Phrozen. Best prices in India, fast shipping, expert support.',
    keywords: [
        '3D printer India',
        'buy 3D printer',
        'FDM printer',
        'resin printer',
        '3D printer price',
        'Bambu Lab India',
        'Creality India',
        'Anycubic India',
        'Scribbl3D',
    ],
    alternates: { canonical: `${baseUrl}/printers` },
    openGraph: {
        title: 'Buy 3D Printers Online in India | Scribbl3D',
        description:
            'Shop FDM and resin 3D printers from top brands. Best prices in India.',
        url: `${baseUrl}/printers`,
        type: 'website',
        images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: '3D Printers at Scribbl3D' }],
        locale: 'en_IN',
        siteName: 'Scribbl3D',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printers Online in India | Scribbl3D',
        description:
            'Shop FDM and resin 3D printers from top brands. Best prices in India, fast shipping.',
        images: [`${baseUrl}/og-image.png`],
    },
};

export default function PrintersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
