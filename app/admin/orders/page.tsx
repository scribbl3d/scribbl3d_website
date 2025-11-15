"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  userId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  trackingInfo?: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  transactionId?: string;
  user?: {
    name: string | null;
    email: string | null;
    phone?: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    trackingLink: "",
    carrier: "",
  });
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          trackingInfo: newStatus === "shipped" ? trackingInfo : undefined,
          notifyCustomer,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
        fetchOrders(); // Refresh the orders list
        setTrackingInfo({ trackingNumber: "", trackingLink: "", carrier: "" }); // Reset tracking info
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "payment_pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper to format price in rupees
  const formatRupees = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Split orders by status
  const confirmedOrders = orders.filter(
    (order) => order.status === "confirmed" || order.status === "processing"
  );
  const shippedOrders = orders.filter((order) => order.status === "shipped");
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  );

  // Table rendering helper
  const renderOrdersTable = (
    ordersToShow: Order[],
    tableTitle: string,
    colorClass: string
  ) => (
    <div className={`mb-8 rounded-lg shadow border ${colorClass} p-4`}>
      <h3 className="text-2xl font-semibold mb-4">{tableTitle}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersToShow.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id.slice(-6)}</TableCell>
              <TableCell>
                {order.shippingAddress.name || order.user?.name || "Anonymous"}
              </TableCell>
              <TableCell>{formatRupees(order.totalAmount)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.paymentMethod}</TableCell>
              <TableCell className="flex flex-col gap-2">
                <Dialog
                  open={isDialogOpen && selectedOrder?.id === order.id}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                      setSelectedOrder(null);
                      setTrackingInfo({
                        trackingNumber: "",
                        trackingLink: "",
                        carrier: "",
                      });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                      <DialogDescription>
                        Order #{selectedOrder?.id.slice(-6)}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedOrder &&
                      (() => {
                        // Ensure trackingInfo is an object
                        let trackingInfoObj: any = selectedOrder.trackingInfo;
                        if (
                          trackingInfoObj &&
                          typeof trackingInfoObj === "string"
                        ) {
                          try {
                            trackingInfoObj = JSON.parse(trackingInfoObj);
                          } catch {
                            trackingInfoObj = {};
                          }
                        }
                        return (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Shipping Address
                                </h4>
                                <p>{selectedOrder.shippingAddress.name}</p>
                                <p>{selectedOrder.shippingAddress.street}</p>
                                <p>
                                  {selectedOrder.shippingAddress.city},{" "}
                                  {selectedOrder.shippingAddress.state}{" "}
                                  {selectedOrder.shippingAddress.zipCode}
                                </p>
                                <p>{selectedOrder.shippingAddress.country}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Order Status
                                </h4>
                                <p>{selectedOrder.status}</p>
                                <h4 className="font-semibold mb-2 mt-4">
                                  Customer Email
                                </h4>
                                <p>{selectedOrder.user?.email || "N/A"}</p>
                                <h4 className="font-semibold mb-2 mt-4">
                                  Mobile Number
                                </h4>
                                <p>
                                  {selectedOrder.shippingAddress.phone ||
                                    selectedOrder.user?.phone ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">
                                Order Created:
                              </h4>
                              <p>
                                {formatDate((selectedOrder as any).createdAt)}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Items:</h4>
                              <ul className="list-disc pl-5">
                                {(Array.isArray(selectedOrder.items)
                                  ? selectedOrder.items
                                  : []
                                ).length > 0 ? (
                                  (selectedOrder.items || []).map(
                                    (item, index) => (
                                      <li key={index}>
                                        {item.name} - Quantity: {item.quantity}{" "}
                                        - {formatRupees(item.price)}
                                      </li>
                                    )
                                  )
                                ) : (
                                  <li>No items found in this order.</li>
                                )}
                              </ul>
                            </div>
                            {trackingInfoObj &&
                              (trackingInfoObj.trackingNumber ||
                                trackingInfoObj.carrier ||
                                trackingInfoObj.trackingLink) && (
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Tracking Info:
                                  </h4>
                                  <p>
                                    <strong>Number:</strong>{" "}
                                    {trackingInfoObj.trackingNumber || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Carrier:</strong>{" "}
                                    {trackingInfoObj.carrier || "N/A"}
                                  </p>
                                  {trackingInfoObj.trackingLink && (
                                    <p>
                                      <strong>Link:</strong>{" "}
                                      <a
                                        href={trackingInfoObj.trackingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                      >
                                        Track Package
                                      </a>
                                    </p>
                                  )}
                                </div>
                              )}
                            <div>
                              <h4 className="font-semibold mb-2">
                                Total Amount:
                              </h4>
                              <p>{formatRupees(selectedOrder.totalAmount)}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">
                                Update Status
                              </h4>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setPendingOrder(selectedOrder);
                                  setShowStatusDialog(true);
                                  setPendingStatus(selectedOrder.status);
                                }}
                              >
                                Change Status
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Status change confirmation dialog
  const statusDialog = (
    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={pendingStatus} onValueChange={setPendingStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {pendingStatus === "shipped" && (
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={trackingInfo.trackingNumber}
                onChange={(e) =>
                  setTrackingInfo({
                    ...trackingInfo,
                    trackingNumber: e.target.value,
                  })
                }
                placeholder="Enter tracking number"
              />
              <Label htmlFor="trackingLink">Tracking Link</Label>
              <Input
                id="trackingLink"
                value={trackingInfo.trackingLink}
                onChange={(e) =>
                  setTrackingInfo({
                    ...trackingInfo,
                    trackingLink: e.target.value,
                  })
                }
                placeholder="Enter tracking URL"
              />
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={trackingInfo.carrier}
                onChange={(e) =>
                  setTrackingInfo({
                    ...trackingInfo,
                    carrier: e.target.value,
                  })
                }
                placeholder="Enter carrier name"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="notifyCustomer"
              checked={notifyCustomer}
              onChange={() => setNotifyCustomer((v) => !v)}
              className="accent-primary"
            />
            <Label htmlFor="notifyCustomer">
              Notify customer about this status change
            </Label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdating}
              onClick={async () => {
                if (!pendingOrder) return;
                setIsUpdating(true);
                try {
                  if (pendingStatus === "shipped") {
                    if (!trackingInfo.trackingNumber || !trackingInfo.carrier) {
                      toast({
                        title: "Tracking info required",
                        description:
                          "Please provide tracking number and carrier.",
                        variant: "destructive",
                      });
                      setIsUpdating(false);
                      return;
                    }
                    await updateOrderStatus(pendingOrder.id, "shipped");
                  } else {
                    await updateOrderStatus(pendingOrder.id, pendingStatus);
                  }
                  setShowStatusDialog(false);
                  setIsDialogOpen(false);
                  setPendingOrder(null);
                  fetchOrders();
                  toast({
                    title: "Order status updated",
                    description:
                      "The order status has been updated successfully.",
                  });
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="bg-primary text-white"
            >
              {isUpdating ? "Updating..." : "Confirm & Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Manage Orders</h2>
      {statusDialog}
      {renderOrdersTable(
        confirmedOrders,
        "Confirmed & Processing Orders",
        "bg-blue-50"
      )}
      {renderOrdersTable(shippedOrders, "Shipped Orders", "bg-purple-50")}
      {renderOrdersTable(deliveredOrders, "Delivered Orders", "bg-green-50")}
    </div>
  );
}
