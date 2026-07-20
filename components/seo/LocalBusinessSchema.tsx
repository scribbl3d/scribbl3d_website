export default function LocalBusinessSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://www.scribbl3d.com/#localbusiness",
        "name": "Scribbl3D",
        "alternateName": "Scribbl3D Printing Solutions",
        "description": "Premium 3D printing solutions provider in Delhi NCR. Offering 3D printers, filaments, resins, rapid prototyping, and custom 3D printing services.",
        "url": "https://www.scribbl3d.com",
        "logo": "https://www.scribbl3d.com/logo.webp",
        "image": [
            "https://www.scribbl3d.com/logo.webp",
            "https://www.scribbl3d.com/og-image.png"
        ],
        "telephone": "+91-9599523434",
        "email": "scribbl3dofficial@gmail.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Plot no. 685, Behind MCD Primary School, Saini Mohalla",
            "addressLocality": "Nangloi",
            "addressRegion": "Delhi",
            "postalCode": "110041",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.6808",
            "longitude": "77.0688"
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ],
                "opens": "10:00",
                "closes": "19:00"
            }
        ],
        "priceRange": "₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
        "areaServed": [
            {
                "@type": "City",
                "name": "Delhi"
            },
            {
                "@type": "City",
                "name": "Gurgaon"
            },
            {
                "@type": "City",
                "name": "Noida"
            },
            {
                "@type": "City",
                "name": "Faridabad"
            },
            {
                "@type": "City",
                "name": "Ghaziabad"
            },
            {
                "@type": "State",
                "name": "Delhi NCR"
            },
            {
                "@type": "Country",
                "name": "India"
            }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "3D Printing Products & Services",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "3D Printers",
                        "description": "FDM and Resin 3D printers from top brands"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "3D Printer Filaments",
                        "description": "PLA, PETG, ABS, TPU, Nylon and specialty filaments"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "3D Printer Resins",
                        "description": "Standard, engineering, and specialty resins"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Rapid Prototyping",
                        "description": "Fast turnaround 3D printing services for prototypes"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Custom 3D Printing",
                        "description": "Professional 3D printing services for custom parts"
                    }
                }
            ]
        },
        "sameAs": [
            "https://in.linkedin.com/company/scribbl3dprinting",
            "https://www.instagram.com/scribbl3d_/",
            "https://twitter.com/Scribbl3d_"
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150",
            "bestRating": "5",
            "worstRating": "1"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
