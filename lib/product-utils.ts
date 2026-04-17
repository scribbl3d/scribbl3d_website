/**
 * Product-related utility functions
 */

/** Build the PDP URL for a given item type + slug/id */
export function getPDPUrl(
    itemType: string | undefined,
    slug?: string | null,
    id?: string
): string | null {
    const identifier = slug || id;
    if (!identifier || !itemType) return null;
    const type = itemType.toLowerCase();
    switch (type) {
        case "printer":
            return slug ? `/printers/${slug}` : null;
        case "product":
            return `/products/${identifier}`;
        case "resin":
            return `/resins/${identifier}`;
        case "prebuilt":
            return `/prebuilt-products/${identifier}`;
        default:
            return null;
    }
}
