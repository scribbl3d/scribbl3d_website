"use client";

import { useEffect, useRef, useState } from "react";

export type UrlParamValue = string | string[] | null | undefined;
export type UrlParams = Record<string, UrlParamValue>;

// Current listing page, starting from the server-rendered ?page=N.
// Resets to page 1 only when resetKey (filters/sort) actually changes, and
// mirrors the page — plus the given filter/sort params, when provided —
// into the URL so it can be shared, reloaded and crawled. Uses
// history.replaceState (not the Next router) to avoid a navigation/
// re-render on every filter change.
export function useListingPage(initialPage: number, resetKey: string, urlParams?: UrlParams) {
    const [page, setPage] = useState(initialPage);

    const lastResetKey = useRef(resetKey);
    useEffect(() => {
        if (lastResetKey.current === resetKey) return;
        lastResetKey.current = resetKey;
        setPage(1);
    }, [resetKey]);

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const url = new URL(window.location.href);
        const params = url.searchParams;

        if (urlParams) {
            Object.keys(urlParams).forEach((key) => params.delete(key));
            Object.entries(urlParams).forEach(([key, value]) => {
                if (value === null || value === undefined || value === "") return;
                if (Array.isArray(value)) {
                    if (value.length === 0) return;
                    value.forEach((v) => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            });
        }

        if (page > 1) params.set("page", String(page));
        else params.delete("page");

        if (url.href !== window.location.href) {
            window.history.replaceState(null, "", url.toString());
        }
        // resetKey stands in for urlParams here: it changes exactly when the
        // caller's filters/sort (and therefore urlParams) change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, resetKey]);

    return [page, setPage] as const;
}
