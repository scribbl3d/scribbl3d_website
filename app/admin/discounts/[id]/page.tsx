"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ITEM_TYPES = ["product", "prebuilt", "printer", "resin"];

export default function EditDiscountPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [form, setForm] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/discounts/${id}`)
            .then((res) => res.json())
            .then((d) =>
                setForm({
                    ...d,
                    minOrderValue: d.minOrderValue ?? "",
                    maxDiscount: d.maxDiscount ?? "",
                    expiresAt: d.expiresAt ? d.expiresAt.split("T")[0] : "",
                    // Extract itemType strings from the relation objects
                    itemTypes: (d.itemTypes ?? []).map(
                        (t: { itemType: string }) => t.itemType,
                    ),
                }),
            );
    }, [id]);

    if (!form) return null;

    async function save() {
        await fetch(`/api/discounts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                value: Number(form.value),
                minOrderValue: form.minOrderValue
                    ? Number(form.minOrderValue)
                    : null,
                maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
                expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
                itemTypes: form.scope === "item_type" ? form.itemTypes : [],
            }),
        });

        router.push("/admin/discounts");
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-semibold">Edit Discount</h1>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    {/* NAME */}
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </div>

                    {/* CODE */}
                    <div>
                        <Label>Coupon Code</Label>
                        <Input value={form.code} disabled />
                    </div>

                    {/* SCOPE */}
                    <div>
                        <Label>Discount applies to</Label>
                        <div className="mt-2 space-y-2">
                            <label className="flex gap-2 items-start">
                                <input
                                    type="radio"
                                    checked={form.scope === "cart"}
                                    onChange={() =>
                                        setForm({ ...form, scope: "cart" })
                                    }
                                />
                                <div>
                                    <div className="font-medium">
                                        Entire Cart
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Discount applies on total cart value
                                    </div>
                                </div>
                            </label>

                            <label className="flex gap-2 items-start">
                                <input
                                    type="radio"
                                    checked={form.scope === "item_type"}
                                    onChange={() =>
                                        setForm({
                                            ...form,
                                            scope: "item_type",
                                        })
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
                    {form.scope === "item_type" && (
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
                                            checked={(
                                                form.itemTypes ?? []
                                            ).includes(type)}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    itemTypes: e.target.checked
                                                        ? [
                                                              ...(form.itemTypes ??
                                                                  []),
                                                              type,
                                                          ]
                                                        : (
                                                              form.itemTypes ??
                                                              []
                                                          ).filter(
                                                              (t: string) =>
                                                                  t !== type,
                                                          ),
                                                })
                                            }
                                        />
                                        <span className="capitalize">
                                            {type}
                                        </span>
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
                                    form.valueType === "percentage"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setForm({
                                        ...form,
                                        valueType: "percentage",
                                    })
                                }
                            >
                                Percentage (%)
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    form.valueType === "flat"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setForm({ ...form, valueType: "flat" })
                                }
                            >
                                Flat (₹)
                            </Button>
                        </div>
                    </div>

                    {/* VALUE */}
                    <div>
                        <Label>
                            {form.valueType === "percentage"
                                ? "Discount Percentage"
                                : "Flat Discount Amount"}
                        </Label>
                        <Input
                            type="number"
                            value={form.value}
                            onChange={(e) =>
                                setForm({ ...form, value: e.target.value })
                            }
                        />
                    </div>

                    {/* MIN ORDER */}
                    <div>
                        <Label>Minimum Order Value (optional)</Label>
                        <Input
                            type="number"
                            value={form.minOrderValue}
                            onChange={(e) =>
                                setForm({
                                    ...form,
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
                            value={form.maxDiscount}
                            onChange={(e) =>
                                setForm({
                                    ...form,
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
                            value={form.expiresAt}
                            onChange={(e) =>
                                setForm({
                                    ...form,
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
                                checked={form.isActive}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        isActive: e.target.checked,
                                    })
                                }
                            />
                            <div>
                                <p className="font-medium">Coupon is active</p>
                                <p className="text-sm text-muted-foreground">
                                    Can be applied at checkout
                                </p>
                            </div>
                        </label>

                        <label className="flex gap-2 items-start">
                            <input
                                type="checkbox"
                                checked={form.isHidden}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        isHidden: e.target.checked,
                                    })
                                }
                            />
                            <div>
                                <p className="font-medium">
                                    Hidden from customers
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Secret coupon — not shown in customer
                                    discount list
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button onClick={save}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
