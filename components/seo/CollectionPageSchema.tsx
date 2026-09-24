// components/seo/CollectionPageSchema.tsx
import { jsonLdString } from '@/lib/metadata';

export default function CollectionPageSchema({
    name,
    description,
    url,
    numberOfItems,
    items = [],
}: {
    name: string;
    description: string;
    url: string;
    numberOfItems: number;
    // Items rendered on the page, so crawlers can read the listing without JS
    items?: { name: string; url: string }[];
}) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "description": description,
        "url": url,
        "mainEntity": {
            "@type": "ItemList",
            // Count the listed items when provided, so the list is self-consistent
            "numberOfItems": items.length > 0 ? items.length : numberOfItems,
            "itemListElement": items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "url": item.url,
            }))
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdString(schema) }}
        />
    );
}
