// components/seo/CollectionPageSchema.tsx
export default function CollectionPageSchema({
    name,
    description,
    url,
    numberOfItems,
}: {
    name: string;
    description: string;
    url: string;
    numberOfItems: number;
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "description": description,
        "url": url,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": numberOfItems,
            "itemListElement": []
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
