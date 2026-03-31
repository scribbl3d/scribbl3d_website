"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Order } from "../types";

interface Props {
    order: Order | null;
    open: boolean;
    onClose(): void;
    onUpdated(): void;
}

export function StatusDialog({ order, open, onClose, onUpdated }: Props) {
    const [status, setStatus] = useState(order?.status ?? "");
    const [loading, setLoading] = useState(false);

    if (!order) return null;

    async function updateStatus() {
        try {
            setLoading(true);

            const res = await fetch(`/api/admin/orders/${order?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Failed");

            toast({
                title: "Order updated",
                description: "Order status updated successfully",
            });

            onUpdated();
            onClose();
        } catch {
            toast({
                title: "Update failed",
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
                    <DialogTitle>Change Order Status</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payment_pending">
                                    Payment Pending
                                </SelectItem>
                                <SelectItem value="confirmed">
                                    Confirmed
                                </SelectItem>
                                <SelectItem value="processing">
                                    Processing
                                </SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">
                                    Delivered
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Cancelled
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button disabled={loading} onClick={updateStatus}>
                            {loading ? "Updating..." : "Confirm"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
