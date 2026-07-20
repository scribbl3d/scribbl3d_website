interface ServiceSchemaProps {
    name: string;
    description: string;
    provider: string;
    areaServed?: string;
    serviceType?: string;
    url?: string;
}

export default function ServiceSchema({
    name,
    description,
    provider,
    areaServed = "Delhi NCR, India",
    serviceType = "3D Printing Service",
    url
}: ServiceSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": name,
        "description": description,
        "provider": {
            "@type": "LocalBusiness",
            "name": provider,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Plot no. 685, Behind MCD Primary School, Saini Mohalla",
                "addressLocality": "Nangloi",
                "addressRegion": "Delhi",
                "postalCode": "110041",
                "addressCountry": "IN"
            },
            "telephone": "+91-9599523434",
            "email": "scribbl3dofficial@gmail.com"
        },
        "serviceType": serviceType,
        "areaServed": {
            "@type": "GeoCircle",
            "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": 28.6808,
                "longitude": 77.0688
            },
            "geoRadius": "50000",
            "description": areaServed
        },
        ...(url && { "url": url })
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
