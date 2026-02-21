"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ITEM_TYPES = ["product", "prebuilt", "printer", "resin"];

export default function NewDiscountPage() {
    const router = useRouter();

    const [data, setData] = useState({
        name: "",
        code: "",
        scope: "cart" as "cart" | "item_type",
        valueType: "percentage" as "percentage" | "flat",
        value: "",
        minOrderValue: "",
        maxDiscount: "",
        expiresAt: "",
        isActive: true,
        isHidden: false,
        itemTypes: [] as string[],
    });

    async function saveDiscount() {
        if (!data.name || !data.code || !data.value) {
            alert("Name, Code and Discount Value are required");
            return;
        }

        await fetch("/api/discounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: data.name,
                code: data.code,
                scope: data.scope,
                valueType: data.valueType,
                value: Number(data.value),
                minOrderValue: data.minOrderValue
                    ? Number(data.minOrderValue)
                    : null,
                maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
                expiresAt: data.expiresAt || null,
                isActive: data.isActive,
                isHidden: data.isHidden,
                itemTypes: data.scope === "item_type" ? data.itemTypes : [],
            }),
        });

        router.push("/admin/discounts");
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-semibold">Create Discount</h1>
            </div>

            <Card className="p-6 space-y-6">
                {/* NAME */}
                <div>
                    <Label>Name</Label>
                    <Input
                        placeholder="e.g. Diwali Sale"
                        value={data.name}
                        onChange={(e) =>
                            setData({ ...data, name: e.target.value })
                        }
                    />
                </div>

                {/* CODE */}
                <div>
                    <Label>Coupon Code</Label>
                    <Input
                        placeholder="e.g. SAVE10"
                        value={data.code}
                        onChange={(e) =>
                            setData({
                                ...data,
                                code: e.target.value.toUpperCase(),
                            })
                        }
                    />
                </div>

                {/* SCOPE */}
                <div>
                    <Label>Discount applies to</Label>
                    <div className="mt-2 space-y-2">
                        <label className="flex gap-2 items-start">
                            <input
                                type="radio"
                                checked={data.scope === "cart"}
                                onChange={() =>
                                    setData({ ...data, scope: "cart" })
                                }
                            />
                            <div>
                                <div className="font-medium">Entire Cart</div>
                                <div className="text-sm text-muted-foreground">
                                    Discount applies on total cart value
                                </div>
                            </div>
                        </label>

                        <label className="flex gap-2 items-start">
                            <input
                                type="radio"
                                checked={data.scope === "item_type"}
                                onChange={() =>
                                    setData({ ...data, scope: "item_type" })
                                }
                            />
                            <div>
                                <div className="font-medium">
                                    Specific Item Types
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Discount applies only to selected item
                                    categories
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* ITEM TYPES */}
                {data.scope === "item_type" && (
                    <div>
                        <Label>Applicable Item Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {ITEM_TYPES.map((type) => (
                                <label
                                    key={type}
                                    className="flex items-center gap-2 border rounded-md p-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.itemTypes.includes(type)}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                itemTypes: e.target.checked
                                                    ? [...data.itemTypes, type]
                                                    : data.itemTypes.filter(
                                                          (t) => t !== type,
                                                      ),
                                            })
                                        }
                                    />
                                    <span className="capitalize">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* DISCOUNT TYPE */}
                <div>
                    <Label>Discount Type</Label>
                    <div className="flex gap-2 mt-2">
                        <Button
                            type="button"
                            variant={
                                data.valueType === "percentage"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                setData({
                                    ...data,
                                    valueType: "percentage",
                                })
                            }
                        >
                            Percentage (%)
                        </Button>
                        <Button
                            type="button"
                            variant={
                                data.valueType === "flat"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                setData({ ...data, valueType: "flat" })
                            }
                        >
                            Flat (₹)
                        </Button>
                    </div>
                </div>

                {/* VALUE */}
                <div>
                    <Label>
                        {data.valueType === "percentage"
                            ? "Discount Percentage"
                            : "Discount Amount (₹)"}
                    </Label>
                    <Input
                        type="number"
                        placeholder={
                            data.valueType === "percentage"
                                ? "e.g. 10"
                                : "e.g. 500"
                        }
                        value={data.value}
                        onChange={(e) =>
                            setData({ ...data, value: e.target.value })
                        }
                    />
                </div>

                {/* MIN ORDER */}
                <div>
                    <Label>Minimum Order Value (optional)</Label>
                    <Input
                        type="number"
                        value={data.minOrderValue}
                        onChange={(e) =>
                            setData({
                                ...data,
                                minOrderValue: e.target.value,
                            })
                        }
                    />
                </div>

                {/* MAX CAP */}
                <div>
                    <Label>Maximum Discount Cap (optional)</Label>
                    <Input
                        type="number"
                        value={data.maxDiscount}
                        onChange={(e) =>
                            setData({
                                ...data,
                                maxDiscount: e.target.value,
                            })
                        }
                    />
                </div>

                {/* EXPIRY */}
                <div>
                    <Label>Expiry Date (optional)</Label>
                    <Input
                        type="date"
                        value={data.expiresAt}
                        onChange={(e) =>
                            setData({
                                ...data,
                                expiresAt: e.target.value,
                            })
                        }
                    />
                </div>

                {/* VISIBILITY */}
                <div className="border rounded-lg p-4 space-y-3">
                    <Label>Visibility</Label>

                    <label className="flex gap-2 items-start">
                        <input
                            type="checkbox"
                            checked={data.isActive}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    isActive: e.target.checked,
                                })
                            }
                        />
                        <div>
                            <div className="font-medium">Coupon is active</div>
                            <div className="text-sm text-muted-foreground">
                                Can be applied at checkout
                            </div>
                        </div>
                    </label>

                    <label className="flex gap-2 items-start">
                        <input
                            type="checkbox"
                            checked={data.isHidden}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    isHidden: e.target.checked,
                                })
                            }
                        />
                        <div>
                            <div className="font-medium">
                                Hidden from customers
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Secret coupon — not shown in customer discount
                                list
                            </div>
                        </div>
                    </label>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button onClick={saveDiscount}>Save Discount</Button>
                </div>
            </Card>
        </div>
    );
}
