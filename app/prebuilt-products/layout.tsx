import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

export const metadata: Metadata = {
    title: 'Buy 3D Printed Products Online in India | Scribbl3D',
    description:
        'Shop unique 3D printed products in India — custom keychains, lamps, decor, figurines, and more. Personalise your order. Fast shipping, expert craftsmanship at Scribbl3D.',
    keywords: [
        '3D printed products India',
        'buy 3D printed items',
        'custom 3D prints',
        '3D printed gifts',
        '3D printed decor',
        'personalised 3D print',
        'Scribbl3D',
    ],
    alternates: { canonical: `${baseUrl}/prebuilt-products` },
    openGraph: {
        title: 'Buy 3D Printed Products Online in India | Scribbl3D',
        description:
            'Shop unique 3D printed products — custom keychains, lamps, decor, figurines, and more. Fast shipping at Scribbl3D.',
        url: `${baseUrl}/prebuilt-products`,
        type: 'website',
        images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: '3D Printed Products at Scribbl3D' }],
        locale: 'en_IN',
        siteName: 'Scribbl3D',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy 3D Printed Products Online in India | Scribbl3D',
        description:
            'Shop unique 3D printed products in India. Fast shipping, expert craftsmanship at Scribbl3D.',
        images: [`${baseUrl}/og-image.png`],
    },
};

export default function PrebuiltProductsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
