"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Discount } from "./types";

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/discounts")
            .then((res) => res.json())
            .then((data) => {
                setDiscounts(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Discounts</h1>
                <Link href="/admin/discounts/new">
                    <Button>Add Discount</Button>
                </Link>
            </div>

            {loading && <p>Loading discounts…</p>}

            {!loading && discounts.length === 0 && (
                <p className="text-muted-foreground">
                    No discounts created yet
                </p>
            )}

            <div className="grid gap-4">
                {discounts.map((d) => (
                    <Card key={d.id}>
                        <CardHeader>
                            <CardTitle>{d.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <div>
                                Code: <b>{d.code}</b>
                            </div>
                            <div>Scope: {d.scope}</div>
                            <div>
                                Value:{" "}
                                {d.valueType === "percentage"
                                    ? `${d.value}%`
                                    : `₹${d.value}`}
                            </div>
                            <div>
                                Status: {d.isActive ? "Active" : "Inactive"}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
