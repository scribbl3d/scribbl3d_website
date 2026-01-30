"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewDiscountPage() {
    const router = useRouter();

    const [data, setData] = useState({
        name: "",
        code: "",
        scope: "cart",
        applicableItemType: "",
        valueType: "percentage",
        value: 0,
        minCartValue: undefined as number | undefined,
        isActive: true,
    });

    async function saveDiscount() {
        await fetch("/api/discounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        router.push("/admin/discounts");
    }

    return (
        <div className="flex justify-center py-10 px-4">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>Create Discount</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* BASIC INFO */}
                    <div className="space-y-3">
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

                        <div>
                            <Label>Code</Label>
                            <Input
                                placeholder="e.g. DIWALI10"
                                value={data.code}
                                onChange={(e) =>
                                    setData({ ...data, code: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* DISCOUNT SCOPE */}
                    <div className="space-y-3">
                        <Label>Discount Applies To</Label>

                        <Select
                            value={data.scope}
                            onValueChange={(v) =>
                                setData({ ...data, scope: v })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cart">
                                    Entire Cart
                                </SelectItem>
                                <SelectItem value="item_type">
                                    Specific Item Type
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {data.scope === "item_type" && (
                            <Select
                                value={data.applicableItemType}
                                onValueChange={(v) =>
                                    setData({
                                        ...data,
                                        applicableItemType: v,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select item type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="product">
                                        Product
                                    </SelectItem>
                                    <SelectItem value="prebuilt">
                                        Prebuilt
                                    </SelectItem>
                                    <SelectItem value="printer">
                                        Printer
                                    </SelectItem>
                                    <SelectItem value="resin">Resin</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <Separator />

                    {/* VALUE */}
                    <div className="space-y-3">
                        <Label>Discount Type</Label>

                        <Select
                            value={data.valueType}
                            onValueChange={(v) =>
                                setData({ ...data, valueType: v })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">
                                    Percentage (%)
                                </SelectItem>
                                <SelectItem value="flat">
                                    Flat Amount (₹)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div>
                            <Label>Discount Value</Label>
                            <Input
                                type="number"
                                placeholder="Enter value"
                                value={data.value}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        value: Number(e.target.value),
                                    })
                                }
                            />
                        </div>

                        {data.scope === "cart" && (
                            <div>
                                <Label>Minimum Cart Value (optional)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 2000"
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            minCartValue: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <Separator />

                    <Button className="w-full h-11" onClick={saveDiscount}>
                        Save Discount
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
