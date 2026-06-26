"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarkViewed } from "@/hooks/use-mark-viewed";

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
import { PaymentFailedTab } from "./tabs/PaymentFailedTab";

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
import { PickupInfo } from "./types";

const PICKUP_LOCATION = "Scribbl3D";

export default function OrdersPage() {
    const { orders, fetchOrders } = useOrders();
    useMarkViewed("orders");

    // ================= STATE =================
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
    const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

    const [pickupOpen, setPickupOpen] = useState(false);
    const [pickupInfo, setPickupInfo] = useState<PickupInfo[] | null>(null);

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
                setPickupInfo([
                    {
                        pickupDate: data.pickupDate,
                        pickupTime: data.pickupTime,
                    },
                ]);
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

    /**
     * Generate label - handles both SPS and MPS
     */
    async function handleGenerateLabel(order: Order, waybill?: string) {
        try {
            // If specific waybill provided, download that single label
            if (waybill) {
                await downloadSingleLabel(waybill);
                return;
            }

            // Get master shipment
            const masterShipment =
                order.shipment || order.shipments?.find((s) => s.isMaster);

            if (!masterShipment?.waybill && !order.trackingInfo?.waybill) {
                return alert("Waybill not found");
            }

            // Check if MPS (multiple packages)
            const isMPS =
                masterShipment?.shipmentType === "MPS" ||
                (order.shipments && order.shipments.length > 1) ||
                order.trackingInfo?.shipmentType === "MPS";

            if (isMPS) {
                // MPS: Download all labels
                await downloadAllLabels(order.id);
            } else {
                // SPS: Download single label
                const singleWaybill =
                    masterShipment?.waybill || order.trackingInfo?.waybill;
                if (singleWaybill) {
                    await downloadSingleLabel(singleWaybill);
                }
            }
        } catch (err: any) {
            alert(err.message || "Failed to generate label");
        }
    }

    /**
     * Download single label by waybill
     */
    async function downloadSingleLabel(waybill: string) {
        const res = await fetch(
            `/api/internal/generate-label?waybill=${waybill}`,
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to generate label");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `label-${waybill}.pdf`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Download all labels for MPS order
     */
    async function downloadAllLabels(orderId: string) {
        const res = await fetch(
            `/api/internal/generate-label?orderId=${orderId}&all=true`,
        );

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to generate labels");
        }

        const contentType = res.headers.get("content-type");

        if (contentType?.includes("application/pdf")) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `labels-${orderId}.pdf`;
            a.click();

            URL.revokeObjectURL(url);
        } else {
            // JSON response with multiple label links
            const data = await res.json();

            if (data.packages && data.packages.length > 0) {
                // Download each label
                for (const pkg of data.packages) {
                    if (pkg.waybill) {
                        await downloadSingleLabel(pkg.waybill);
                    }
                }
            }
        }
    }

    async function handleDownloadInvoice(order: Order) {
        try {
            console.log(`📄 Downloading invoice for order: ${order.id}`);
            
            const res = await fetch(`/api/orders/${order.id}/invoice`, {
                credentials: "include",
            });

            if (!res.ok) {
                let errorMsg = "Failed to download invoice";
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.error || errorMsg;
                } catch {
                    const text = await res.text();
                    errorMsg = text || errorMsg;
                }
                console.error("Invoice API error:", errorMsg);
                throw new Error(errorMsg);
            }

            const blob = await res.blob();
            
            // Verify we got a PDF
            if (blob.type !== "application/pdf") {
                console.error("Invalid response type:", blob.type);
                throw new Error("Invalid response: Expected PDF file");
            }
            
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;

            // Extract filename safely
            const disposition = res.headers.get("Content-Disposition");
            const match = disposition?.match(/filename="(.+)"/);

            a.download = match?.[1] || `Invoice_${order.id}.pdf`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
            
            console.log(`✅ Invoice downloaded successfully: ${a.download}`);
        } catch (err: any) {
            console.error("❌ Invoice download failed:", err);
            alert(`Failed to download invoice: ${err.message || "Unknown error"}. Please try again.`);
        }
    }

    // ================= RENDER =================
    return (
        <div className="px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* ===== HEADER ===== */}
            <div className="space-y-2">
                <Link
                    href="/ops/control"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                    ← Back to Admin
                </Link>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Manage Orders
                </h1>
            </div>

            {/* ===== TABS WRAPPER ===== */}
            <div className="rounded-lg sm:rounded-2xl border-2 border-border bg-background shadow-md">
                <Tabs defaultValue="payment">
                    {/* ===== STICKY TABS ===== */}
                    <div className="sticky top-[64px] z-30 border-b-2 border-border bg-background/95 backdrop-blur overflow-x-auto">
                        <TabsList className="flex w-full justify-start sm:justify-center gap-4 sm:gap-6 lg:gap-10 px-3 sm:px-6 py-3 sm:py-4 min-w-max sm:min-w-0">
                            {[
                                { value: "payment", label: "Payment" },
                                { value: "failed", label: "Failed" },
                                { value: "confirmed", label: "Confirmed" },
                                { value: "transit", label: "Transit" },
                                { value: "delivered", label: "Delivered" },
                                { value: "cancelled", label: "Cancelled" },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="relative px-2 sm:px-3 py-2 text-sm sm:text-base font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:-bottom-[14px] data-[state=active]:after:left-0 data-[state=active]:after:h-[3px] data-[state=active]:after:w-full data-[state=active]:after:rounded-full data-[state=active]:after:bg-foreground whitespace-nowrap"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    {/* ===== CONTENT ===== */}
                    <div className="p-3 sm:p-6">
                        <TabsContent value="payment">
                            <PaymentPendingTab
                                orders={orders.filter(filters.paymentPending)}
                                onView={setActiveOrder}
                            />
                        </TabsContent>

                        <TabsContent value="failed">
                            <PaymentFailedTab
                                orders={orders.filter(filters.paymentFailed)}
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
                                onDownloadInvoice={handleDownloadInvoice}
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
                                onDownloadInvoice={handleDownloadInvoice}
                            />
                        </TabsContent>

                        <TabsContent value="delivered">
                            <DeliveredTab
                                orders={orders.filter(filters.delivered)}
                                onView={setActiveOrder}
                                onDownloadInvoice={handleDownloadInvoice}
                            />
                        </TabsContent>

                        <TabsContent value="cancelled">
                            <CancelledTab
                                orders={orders.filter(filters.cancelled)}
                                onView={setActiveOrder}
                                onDownloadInvoice={handleDownloadInvoice}
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
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            cancelledBy: "admin",
                                        }),
                                    },
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
