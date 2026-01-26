"use client";

import { Button } from "@/components/ui/button";
import { Order } from "../types";

export function OrderActions({
    order,
    onView,
}: {
    order: Order;
    onView(order: Order): void;
}) {
    return (
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onView(order)}>
                View
            </Button>
        </div>
    );
}
