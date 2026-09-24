"use client";

import { useEffect, useRef, useState } from "react";

// Current listing page, starting from the server-rendered ?page=N.
// Resets to page 1 only when resetKey (filters/sort) actually changes, and
// mirrors the page into the URL so it can be shared, reloaded and crawled.
export function useListingPage(initialPage: number, resetKey: string) {
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
        if (page > 1) url.searchParams.set("page", String(page));
        else url.searchParams.delete("page");
        if (url.href !== window.location.href) {
            window.history.replaceState(null, "", url.toString());
        }
    }, [page]);

    return [page, setPage] as const;
}
