import type { Metadata } from 'next';

export const LISTING_PAGE_SIZE = 9;

// Parses ?page=N for catalogue listings: positive integers only, otherwise page 1
export function parseListingPage(value: string | string[] | undefined): number {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw || !/^\d+$/.test(raw)) return 1;
    const page = Number.parseInt(raw, 10);
    return page >= 1 ? page : 1;
}

// Page 1 keeps the listing's metadata unchanged; later pages get a
// self-referencing canonical and a page suffix so each page is indexable.
export function paginatedListingMetadata(base: Metadata, url: string, page: number): Metadata {
    if (page <= 1) return base;

    const pageUrl = `${url}?page=${page}`;
    const suffix = ` – Page ${page}`;
    const title = base.title;
    const pagedTitle =
        typeof title === 'string'
            ? `${title}${suffix}`
            : title && typeof title === 'object' && 'absolute' in title && title.absolute
                ? { absolute: `${title.absolute}${suffix}` }
                : title;

    return {
        ...base,
        title: pagedTitle,
        alternates: { ...base.alternates, canonical: pageUrl },
        openGraph: base.openGraph ? { ...base.openGraph, url: pageUrl } : base.openGraph,
    };
}
