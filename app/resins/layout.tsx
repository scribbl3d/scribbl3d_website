import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

export const metadata: Metadata = {
    title: 'Buy 3D Printing Resins Online in India | Scribbl3D',
    description:
        'Shop premium 3D printing resins in India — standard, water-washable, ABS-like, flexible, and dental-grade. Compare colours, volumes, and compatibility. Fast shipping at Scribbl3D.',
    keywords: [
        '3D resin India',
        'buy 3D resin',
        'UV resin',
        'water washable resin',
        'resin 3D printer',
        'SLA resin',
        'Scribbl3D',
    ],
    alternates: { canonical: `${baseUrl}/resins` },
    openGraph: {
        title: 'Buy 3D Printing Resins Online in India | Scribbl3D',
        description:
            'Shop premium 3D printing resins — standard, water-washable, ABS-like, flexible, and dental-grade. Fast shipping at Scribbl3D.',
        url: `${baseUrl}/resins`,
        type: 'website',
        images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: '3D Printing Resins at Scribbl3D' }],
        locale: 'en_IN',
        siteName: 'Scribbl3D',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printing Resins Online in India | Scribbl3D',
        description:
            'Shop premium 3D printing resins in India. Fast shipping, expert support, best deals.',
        images: [`${baseUrl}/og-image.png`],
    },
};

export default function ResinsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
