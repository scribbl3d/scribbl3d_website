"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tab = "campaign" | "rewards";

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [tab, setTab] = useState<Tab>("campaign");

    useEffect(() => {
        // Fetch with admin=true to get ALL discounts unfiltered
        fetch("/api/discounts?admin=true")
            .then((res) => res.json())
            .then(setDiscounts);
    }, []);

    async function toggle(id: string, key: string, value: boolean) {
        await fetch(`/api/discounts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [key]: value }),
        });

        setDiscounts((d) =>
            d.map((x) => (x.id === id ? { ...x, [key]: value } : x)),
        );
    }

    async function del(id: string) {
        const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" });
        if (!res.ok) return;
        setDiscounts((d) => d.filter((x) => x.id !== id));
    }

    const campaignDiscounts = discounts.filter((d) => !d.reviewReward);
    const rewardDiscounts = discounts.filter((d) => d.reviewReward);
    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: "campaign", label: "Campaign codes", count: campaignDiscounts.length },
        { key: "rewards", label: "Review rewards", count: rewardDiscounts.length },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/ops/control">
                    <Button variant="outline">← Back</Button>
                </Link>
                <h1 className="text-2xl font-semibold">Discounts</h1>
                <Link href="/ops/control/discounts/new" className="ml-auto">
                    <Button>Add Discount</Button>
                </Link>
            </div>

            <div role="tablist" aria-label="Discount type" className="flex gap-2 border-b">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === t.key}
                        onClick={() => setTab(t.key)}
                        className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            tab === t.key
                                ? "border-foreground text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {tab === "campaign" && campaignDiscounts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No discounts created yet.
                </div>
            )}

            {tab === "rewards" && rewardDiscounts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No review reward coupons issued yet.
                </div>
            )}

            {tab === "rewards" &&
                rewardDiscounts.map((d) => {
                    const used = (d._count?.usages ?? 0) > 0;
                    const expired =
                        d.expiresAt && new Date(d.expiresAt) < new Date();
                    const status = used
                        ? { label: "Used", className: "bg-blue-100 text-blue-700" }
                        : d.reviewReward.cancelledAt
                          ? { label: "Cancelled (refunded)", className: "bg-gray-100" }
                          : expired
                            ? { label: "Expired", className: "bg-red-100 text-red-700" }
                            : !d.isActive
                              ? { label: "Inactive", className: "bg-gray-100" }
                              : { label: "Unused", className: "bg-green-100 text-green-700" };
                    const customer = d.user?.name || d.user?.email || "Unknown customer";

                    return (
                        <Card
                            key={d.id}
                            className="p-4 flex justify-between items-start gap-4"
                        >
                            <div className="min-w-0">
                                <div className="font-semibold">{d.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {d.code} •{" "}
                                    {d.valueType === "percentage"
                                        ? `${d.value}%`
                                        : `₹${d.value}`}
                                    {d.maxDiscount != null && ` (max ₹${d.maxDiscount})`}
                                </div>
                                <div className="text-sm text-muted-foreground mt-0.5 break-words">
                                    Customer: {customer}
                                    {d.user?.name && d.user?.email && ` (${d.user.email})`}
                                </div>
                                <div className="text-sm text-muted-foreground mt-0.5">
                                    Issued {formatDate(d.createdAt)}
                                    {d.expiresAt && ` • ${expired ? "Expired" : "Expires"} ${formatDate(d.expiresAt)}`}
                                </div>
                                <div className="flex gap-2 mt-2 text-xs flex-wrap">
                                    <span className={`px-2 py-1 rounded ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            <label className="text-xs flex gap-2 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={d.isActive}
                                    onChange={(e) =>
                                        toggle(d.id, "isActive", e.target.checked)
                                    }
                                />
                                Active
                            </label>
                        </Card>
                    );
                })}

            {tab === "campaign" && campaignDiscounts.map((d) => {
                const expired =
                    d.expiresAt && new Date(d.expiresAt) < new Date();
                const itemTypeNames = (d.itemTypes ?? [])
                    .map((t: { itemType: string }) => t.itemType)
                    .join(", ");
                const totalUsages = d._count?.usages ?? 0;

                return (
                    <Card
                        key={d.id}
                        className="p-4 flex justify-between items-start"
                    >
                        <div>
                            <div className="font-semibold">{d.name}</div>
                            <div className="text-sm text-muted-foreground">
                                {d.code} •{" "}
                                {d.valueType === "percentage"
                                    ? `${d.value}%`
                                    : `₹${d.value}`}
                            </div>

                            {/* Scope and item types */}
                            <div className="text-sm text-muted-foreground mt-0.5">
                                {d.scope === "item_type" && itemTypeNames
                                    ? `Applies to: ${itemTypeNames}`
                                    : "Applies to: entire cart"}
                            </div>

                            {/* Usage restrictions info */}
                            {(d.firstOrderOnly || d.maxUsesPerUser != null) && (
                                <div className="text-sm text-muted-foreground mt-0.5">
                                    {[
                                        d.firstOrderOnly
                                            ? "First order only"
                                            : null,
                                        d.maxUsesPerUser != null
                                            ? `Max ${d.maxUsesPerUser} use${d.maxUsesPerUser === 1 ? "" : "s"}/customer`
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(" • ")}
                                </div>
                            )}

                            {/* Total usage count */}
                            {totalUsages > 0 && (
                                <div className="text-sm text-muted-foreground mt-0.5">
                                    Total redemptions: {totalUsages}
                                </div>
                            )}

                            <div className="flex gap-2 mt-2 text-xs flex-wrap">
                                {d.isActive ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                        Active
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                        Inactive
                                    </span>
                                )}
                                {d.isHidden && (
                                    <span className="px-2 py-1 bg-yellow-100 rounded">
                                        Hidden
                                    </span>
                                )}
                                {expired && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                        Expired
                                    </span>
                                )}
                                {d.scope === "item_type" && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        Scoped
                                    </span>
                                )}
                                {d.firstOrderOnly && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
                                        New User
                                    </span>
                                )}
                                {d.maxUsesPerUser != null && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                        {d.maxUsesPerUser}× limit
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                                <Link href={`/ops/control/discounts/${d.id}`}>
                                    <Button size="sm" variant="outline">
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => del(d.id)}
                                >
                                    Delete
                                </Button>
                            </div>

                            <label className="text-xs flex gap-2">
                                <input
                                    type="checkbox"
                                    checked={d.isActive}
                                    onChange={(e) =>
                                        toggle(
                                            d.id,
                                            "isActive",
                                            e.target.checked,
                                        )
                                    }
                                />
                                Active
                            </label>

                            <label className="text-xs flex gap-2">
                                <input
                                    type="checkbox"
                                    checked={d.isHidden}
                                    onChange={(e) =>
                                        toggle(
                                            d.id,
                                            "isHidden",
                                            e.target.checked,
                                        )
                                    }
                                />
                                Hidden
                            </label>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
