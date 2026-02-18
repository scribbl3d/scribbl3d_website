"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

const PICKUP_LOCATION =
    process.env.NEXT_PUBLIC_PICKUP_LOCATION || "Scribbl3D Warehouse";

const PICKUP_SLOTS = [
    { label: "10:00 – 12:00", value: "10:00" },
    { label: "12:00 – 14:00", value: "12:00" },
    { label: "14:00 – 18:00", value: "14:00" },
];

function isSlotDisabled(
    slotTime: string,
    selectedDate: string,
    todayStr: string,
) {
    if (selectedDate !== todayStr) return false;

    const now = new Date();
    const [slotHour] = slotTime.split(":").map(Number);

    const slotDateTime = new Date();
    slotDateTime.setHours(slotHour, 0, 0, 0);

    return now >= slotDateTime;
}

export function PickupRequestDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose(): void;
}) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const tomorrowStr = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
    })();

    const [pickupData, setPickupData] = useState({
        pickup_date: todayStr,
        pickup_time: "",
        pickup_location: PICKUP_LOCATION,
        expected_package_count: "",
    });

    const [loading, setLoading] = useState(false);

    async function requestPickup() {
        try {
            setLoading(true);

            const res = await fetch("/api/internal/request-pickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pickupData),
            });

            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            toast({
                title: data.alreadyExists
                    ? "Pickup already scheduled"
                    : "Pickup requested",
                description: data.message,
            });

            onClose();
        } catch (err: any) {
            toast({
                title: "Pickup failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Pickup</DialogTitle>
                    <DialogDescription>
                        Raise a pickup request for manifested shipments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* ===== PICKUP DAY ===== */}
                    <div>
                        <Label>Pickup Day</Label>
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant={
                                    pickupData.pickup_date === todayStr
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setPickupData((p) => ({
                                        ...p,
                                        pickup_date: todayStr,
                                        pickup_time: "",
                                    }))
                                }
                            >
                                Today
                            </Button>

                            <Button
                                variant={
                                    pickupData.pickup_date === tomorrowStr
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() =>
                                    setPickupData((p) => ({
                                        ...p,
                                        pickup_date: tomorrowStr,
                                        pickup_time: "",
                                    }))
                                }
                            >
                                Tomorrow
                            </Button>
                        </div>
                    </div>

                    {/* ===== PICKUP SLOT ===== */}
                    <div>
                        <Label>Pickup Slot</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {PICKUP_SLOTS.map((slot) => {
                                const disabled = isSlotDisabled(
                                    slot.value,
                                    pickupData.pickup_date,
                                    todayStr,
                                );

                                return (
                                    <Button
                                        key={slot.value}
                                        variant={
                                            pickupData.pickup_time ===
                                            slot.value
                                                ? "default"
                                                : "outline"
                                        }
                                        disabled={disabled}
                                        onClick={() =>
                                            setPickupData((p) => ({
                                                ...p,
                                                pickup_time: slot.value,
                                            }))
                                        }
                                        className={
                                            disabled
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }
                                    >
                                        {slot.label}
                                    </Button>
                                );
                            })}
                        </div>

                        {pickupData.pickup_date === todayStr && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Slots earlier than current time are disabled.
                            </p>
                        )}
                    </div>

                    {/* ===== PACKAGE COUNT ===== */}
                    <div>
                        <Label>Expected Package Count</Label>
                        <Input
                            type="number"
                            min={1}
                            value={pickupData.expected_package_count}
                            onChange={(e) =>
                                setPickupData((p) => ({
                                    ...p,
                                    expected_package_count: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={
                            loading ||
                            !pickupData.pickup_time ||
                            !pickupData.expected_package_count
                        }
                        onClick={requestPickup}
                    >
                        {loading ? "Requesting…" : "Request Pickup"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
