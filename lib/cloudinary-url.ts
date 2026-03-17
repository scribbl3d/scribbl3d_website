// Card images (product listing pages) — square crop, 600×600
export function getCardImageUrl(url: string): string {
    if (!url || !url.includes("res.cloudinary.com")) return url;
    return url.replace(
        "/upload/",
        `/upload/w_600,h_600,c_fill,g_auto,q_auto,f_auto/`,
    );
}

// PDP main image — padded, full product visible, 1200×1200
export function getPdpImageUrl(url: string): string {
    if (!url || !url.includes("res.cloudinary.com")) return url;
    return url.replace(
        "/upload/",
        `/upload/w_1200,h_1200,c_pad,b_white,q_auto,f_auto/`,
    );
}

// PDP thumbnails — 160×160
export function getThumbnailUrl(url: string): string {
    if (!url || !url.includes("res.cloudinary.com")) return url;
    return url.replace(
        "/upload/",
        `/upload/w_160,h_160,c_pad,b_white,q_auto,f_auto/`,
    );
}
