"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CreateShipmentDialog } from "./components/CreateShipmentDialog";
import { PickupRequestDialog } from "./components/PickupRequestDialog";
import { StatusDialog } from "./components/StatusDialog";
import { ViewOrderDialog } from "./components/ViewOrderDialog";

import { useOrders } from "./hooks/useOrders";
import { CancelledTab } from "./tabs/CancelledTab";
import { ConfirmedProcessingTab } from "./tabs/ConfirmedProcessingTab";
import { DeliveredTab } from "./tabs/DeliveredTab";
import { InTransitTab } from "./tabs/InTransitTab";
import { PaymentPendingTab } from "./tabs/PaymentPendingTab";

import { Order } from "./types";
import * as filters from "./utils/filters";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const PICKUP_LOCATION = "Scribble3D Warehouse";

export default function OrdersPage() {
    const { orders, fetchOrders } = useOrders();

    // ================= STATE =================
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
    const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

    const [pickupOpen, setPickupOpen] = useState(false);
    const [pickupInfo, setPickupInfo] = useState<{
        pickupDate: string;
        pickupTime: string;
    } | null>(null);

    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    // ================= PICKUP STATUS =================
    async function fetchPickupStatus() {
        try {
            const res = await fetch(
                `/api/internal/pickup-status?pickup_location=${encodeURIComponent(
                    PICKUP_LOCATION,
                )}`,
            );
            const data = await res.json();

            if (data.ok && data.scheduled) {
                setPickupInfo({
                    pickupDate: data.pickupDate,
                    pickupTime: data.pickupTime,
                });
            } else {
                setPickupInfo(null);
            }
        } catch {
            setPickupInfo(null);
        }
    }

    useEffect(() => {
        fetchPickupStatus();
    }, []);

    // ================= HELPERS =================
    function handleTrackOrder(order: Order) {
        const t =
            order.trackingInfo ||
            (order.shipment ? { waybill: order.shipment.waybill } : null);

        if (t?.trackingUrl) {
            window.open(t.trackingUrl, "_blank");
            return;
        }

        if (t?.waybill) {
            const base =
                process.env.NEXT_PUBLIC_DELHIVERY_TRACK_URL ||
                "https://delhivery.com/track/package/";
            window.open(`${base}${t.waybill}`, "_blank");
            return;
        }

        alert("No tracking information available");
    }

    async function handleGenerateLabel(order: Order) {
        const waybill = order.shipment?.waybill || order.trackingInfo?.waybill;
        if (!waybill) return alert("Waybill not found");

        const res = await fetch(
            `/api/internal/generate-label?waybill=${waybill}`,
        );

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `label-${waybill}.pdf`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // ================= RENDER =================
    return (
        <div className="px-6 py-6 space-y-6">
            {/* ===== HEADER ===== */}
            <div className="space-y-2">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                    ← Back to Admin
                </Link>

                <h1 className="text-3xl font-bold tracking-tight">
                    Manage Orders
                </h1>
            </div>

            {/* ===== TABS WRAPPER ===== */}
            <div className="rounded-2xl border-2 border-border bg-background shadow-md">
                <Tabs defaultValue="payment">
                    {/* ===== STICKY TABS ===== */}
                    <TabsList className="sticky top-[64px] z-30 flex w-full justify-center gap-10 border-b-2 border-border bg-background/95 px-6 py-4 backdrop-blur">
                        {[
                            { value: "payment", label: "Payment" },
                            { value: "confirmed", label: "Confirmed" },
                            { value: "transit", label: "Transit" },
                            { value: "delivered", label: "Delivered" },
                            { value: "cancelled", label: "Cancelled" },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="relative px-3 py-2 text-base font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:-bottom-[14px] data-[state=active]:after:left-0 data-[state=active]:after:h-[3px] data-[state=active]:after:w-full data-[state=active]:after:rounded-full data-[state=active]:after:bg-foreground"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* ===== CONTENT ===== */}
                    <div className="p-6">
                        <TabsContent value="payment">
                            <PaymentPendingTab
                                orders={orders.filter(filters.paymentPending)}
                                onView={setActiveOrder}
                            />
                        </TabsContent>

                        <TabsContent value="confirmed">
                            <ConfirmedProcessingTab
                                orders={orders.filter(
                                    filters.confirmedProcessing,
                                )}
                                onView={setActiveOrder}
                                onCreateShipment={setShipmentOrder}
                                onCancel={(order) => {
                                    setCancelOrder(order);
                                    setShowCancelDialog(true);
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="transit">
                            <InTransitTab
                                orders={orders.filter(filters.inTransit)}
                                onView={setActiveOrder}
                                onTrack={handleTrackOrder}
                                onGenerateLabel={handleGenerateLabel}
                                onRequestPickup={() => setPickupOpen(true)}
                                pickupInfo={pickupInfo}
                            />
                        </TabsContent>

                        <TabsContent value="delivered">
                            <DeliveredTab
                                orders={orders.filter(filters.delivered)}
                                onView={setActiveOrder}
                            />
                        </TabsContent>

                        <TabsContent value="cancelled">
                            <CancelledTab
                                orders={orders.filter(filters.cancelled)}
                                onView={setActiveOrder}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* ================= DIALOGS ================= */}

            <ViewOrderDialog
                order={activeOrder}
                open={!!activeOrder}
                onClose={() => setActiveOrder(null)}
                onChangeStatus={(order) => {
                    setPendingOrder(order);
                    setShowStatusDialog(true);
                }}
            />

            <StatusDialog
                order={pendingOrder}
                open={showStatusDialog}
                onClose={() => {
                    setShowStatusDialog(false);
                    setPendingOrder(null);
                }}
                onUpdated={fetchOrders}
            />

            <CreateShipmentDialog
                order={shipmentOrder}
                open={!!shipmentOrder}
                onClose={() => setShipmentOrder(null)}
                onCreated={fetchOrders}
            />

            <PickupRequestDialog
                open={pickupOpen}
                onClose={() => {
                    setPickupOpen(false);
                    fetchPickupStatus();
                }}
            />

            {/* ===== CANCEL + REFUND ===== */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Order & Refund</DialogTitle>
                        <DialogDescription>
                            This will cancel the order and initiate a refund.
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setCancelOrder(null);
                            }}
                        >
                            Keep Order
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!cancelOrder) return;

                                await fetch(
                                    `/api/admin/orders/${cancelOrder.id}/cancel`,
                                    { method: "POST" },
                                );

                                setShowCancelDialog(false);
                                setCancelOrder(null);
                                fetchOrders();
                            }}
                        >
                            Cancel & Refund
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
