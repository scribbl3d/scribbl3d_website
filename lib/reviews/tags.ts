/* Review tag options, shared by the order feedback modal and the review page */

export const GLOBAL_TAGS = [
    "Fast delivery",
    "Secure packaging",
    "Great value",
    "Responsive support",
] as const;

export const ITEM_TYPE_TAGS: Record<string, readonly string[]> = {
    filament: [
        "Smooth extrusion",
        "Strong adhesion",
        "Vibrant color",
        "Stringing issues",
    ],

    resin: ["High detail", "Fast curing", "Low odor", "Brittle prints"],

    printer: [
        "Excellent print quality",
        "Reliable performance",
        "Easy setup",
        "Noisy operation",
    ],

    product: [
        "Excellent detailing",
        "Accurate sizing",
        "Premium finish",
        "Minor imperfections",
    ],

    prebuilt: [
        "Excellent detailing",
        "Accurate sizing",
        "Premium finish",
        "Minor imperfections",
    ],
};

/* ─────────── Review page: tags depend on the star rating ─────────── */

export type RatingBand = "low" | "mid" | "high";

/** 1–2 stars: problems, 3: could be better, 4–5: positives */
export function ratingBand(rating: number): RatingBand | null {
    if (rating >= 4) return "high";
    if (rating === 3) return "mid";
    if (rating >= 1) return "low";
    return null;
}

export const TAG_PROMPTS: Record<RatingBand, string> = {
    high: "What stood out?",
    mid: "What could be better?",
    low: "What went wrong?",
};

export const ORDER_TAGS_BY_BAND: Record<RatingBand, readonly string[]> = {
    high: ["Fast delivery", "Secure packaging", "Great value", "Responsive support", "Easy ordering"],
    mid: ["Delivery took a while", "Packaging could be better", "Fair value", "Support could be quicker"],
    low: ["Late delivery", "Damaged packaging", "Wrong or missing item", "Poor value", "Unhelpful support"],
};

const PREBUILT_TAGS: Record<RatingBand, readonly string[]> = {
    high: ["Excellent detailing", "Accurate sizing", "Premium finish", "Sturdy build", "Looks as shown"],
    mid: ["Minor imperfections", "Size slightly off", "Finish could be better", "Looks slightly different"],
    low: ["Poor finish", "Wrong size", "Arrived broken", "Not as shown", "Fragile build"],
};

export const PRODUCT_TAGS_BY_BAND: Record<string, Record<RatingBand, readonly string[]>> = {
    filament: {
        high: ["Smooth extrusion", "Strong adhesion", "Vibrant color", "Minimal stringing", "Consistent results"],
        mid: ["Some stringing", "Needed tuning", "Color slightly different", "Okay adhesion"],
        low: ["Frequent clogging", "Poor adhesion", "Brittle filament", "Tangled spool", "Color not as shown"],
    },
    resin: {
        high: ["High detail", "Fast curing", "Low odor", "Easy to clean", "Accurate color"],
        mid: ["Some failed prints", "Needed tuning", "Strong odor", "Slightly brittle"],
        low: ["Prints failing", "Very brittle", "Very strong odor", "Color not as shown", "Leaking bottle"],
    },
    printer: {
        high: ["Excellent print quality", "Reliable performance", "Easy setup", "Quiet operation", "Good value"],
        mid: ["Setup took time", "Some print issues", "Noisy operation", "Needed calibration"],
        low: ["Poor print quality", "Frequent failures", "Difficult setup", "Arrived damaged", "Very noisy"],
    },
    prebuilt: PREBUILT_TAGS,
    product: PREBUILT_TAGS,
};

/** Order-level tags offered for a given star rating (empty until rated) */
export function getOrderTags(rating: number): string[] {
    const band = ratingBand(rating);
    return band ? [...ORDER_TAGS_BY_BAND[band]] : [];
}

/** Product-type tags offered for a given star rating (empty until rated) */
export function getProductTags(itemType: string | null | undefined, rating: number): string[] {
    const band = ratingBand(rating);
    if (!band) return [];
    const type = itemType?.toLowerCase() || "product";
    return [...(PRODUCT_TAGS_BY_BAND[type] || PRODUCT_TAGS_BY_BAND.product)[band]];
}
