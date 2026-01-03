"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useCheckoutItems() {
    const searchParams = useSearchParams();
    const mode = searchParams?.get("mode");
    const productId = searchParams?.get("productId");
    const type = searchParams?.get("type");

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);

            if (mode === "buynow" && productId && type) {
                const res = await fetch(
                    `/api/buynow?type=${type}&productId=${productId}`
                );
                const item = await res.json();
                setItems([item]);
            } else {
                const res = await fetch("/api/cart");
                const data = await res.json();
                setItems(data.items || []);
            }

            setLoading(false);
        }

        load();
    }, [mode, productId, type]);

    return { items, loading, mode };
}
