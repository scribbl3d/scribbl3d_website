import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

export const metadata: Metadata = {
    title: 'Buy 3D Printer Filaments Online in India — PLA, ABS, PETG, TPU | Scribbl3D',
    description:
        'Shop premium 3D printer filaments in India — PLA+, ABS, PETG, TPU, Nylon, and specialty filaments. Wide colour range, fast shipping, expert support at Scribbl3D.',
    keywords: [
        '3D filament India',
        'PLA filament',
        'ABS filament',
        'PETG filament',
        'TPU filament',
        'Nylon filament',
        'buy 3D filament',
        'Scribbl3D',
    ],
    alternates: { canonical: `${baseUrl}/filaments` },
    openGraph: {
        title: 'Buy 3D Printer Filaments Online in India | Scribbl3D',
        description:
            'Shop PLA, ABS, PETG, TPU, and specialty 3D printer filaments. Best prices in India, fast shipping.',
        url: `${baseUrl}/filaments`,
        type: 'website',
        images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: '3D Printer Filaments at Scribbl3D' }],
        locale: 'en_IN',
        siteName: 'Scribbl3D',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printer Filaments Online in India | Scribbl3D',
        description:
            'Shop PLA, ABS, PETG, TPU, and specialty filaments. Fast shipping at Scribbl3D.',
        images: [`${baseUrl}/og-image.png`],
    },
};

export default function FilamentsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
