"use client";

import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Order } from "../types";

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchOrders() {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/orders");
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : (data.orders ?? []));
        } catch {
            toast({
                title: "Failed to fetch orders",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetch("/api/internal/sync-refunds", {
            method: "POST",
        }).catch(() => {});
        fetchOrders();
    }, []);

    return { orders, fetchOrders, loading };
}
