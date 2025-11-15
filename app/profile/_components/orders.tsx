"use client";

import { DbOrder } from "@/app/types";

import { Calendar, IndianRupee } from "lucide-react";

interface OrdersProps {
  orders: DbOrder[];
}

export function Orders({ orders }: OrdersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your Orders</h1>
        <p className="text-gray-500 mt-1">View and manage your orders</p>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#f6fbff] flex flex-col md:flex-row items-stretch rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer group mb-4 relative overflow-hidden"
              tabIndex={0}
              role="button"
              aria-label={`View details for order ${order.id}`}
              onClick={() =>
                (window.location.href = `/profile/orders/${order.id}`)
              }
            >
              {/* Left: Date, Order ID, Total Price */}
              <div className="flex flex-col items-start justify-center px-4 py-4 md:py-6 w-full md:w-1/5 min-w-[140px] gap-2 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{order.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">Order ID:</span>{" "}
                  <span className="select-all">{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xl font-bold text-gray-900">
                  <IndianRupee className="w-5 h-5" />
                  {order.totalAmount}
                </div>
              </div>
              {/* Middle: Items List */}
              <div className="flex flex-col justify-center px-4 py-4 md:py-6 w-full md:w-3/5 gap-2">
                <div className="flex flex-col gap-2 bg-white/70 rounded-lg p-2">
                  {(() => {
                    let items: any[] = [];
                    if (Array.isArray(order.items)) {
                      items = order.items;
                    } else if (typeof order.items === "string") {
                      try {
                        const parsed = JSON.parse(order.items);
                        if (Array.isArray(parsed)) items = parsed;
                        else if (parsed && typeof parsed === "object")
                          items = Object.values(parsed);
                      } catch {
                        items = [];
                      }
                    } else if (order.items && typeof order.items === "object") {
                      items = Object.values(order.items);
                    }
                    if (items.length > 0) {
                      return items.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-3 border-b last:border-b-0 border-gray-200 py-2"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 border">
                              <span className="text-xl">🛍️</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base text-gray-900 truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.description || ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                              x{item.quantity || 1}
                            </span>
                            <span className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
                              <IndianRupee className="w-4 h-4" />
                              {item.price || 0}
                            </span>
                          </div>
                        </div>
                      ));
                    } else {
                      return (
                        <div className="text-gray-400 text-sm italic py-2">
                          No items found
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              {/* Right: Status badge & View Details button */}
              <div className="flex flex-col justify-between items-end px-4 py-4 md:py-6 w-full md:w-1/4 min-w-[160px]">
                <span
                  className={`flex items-center gap-1 text-sm font-bold px-4 py-1 rounded-full shadow-sm mb-4 self-end
                  ${
                    order.status === "delivered"
                      ? "bg-green-200 text-green-900"
                      : order.status === "shipped"
                        ? "bg-blue-200 text-blue-900"
                        : order.status === "pending"
                          ? "bg-yellow-200 text-yellow-900"
                          : order.status === "cancelled"
                            ? "bg-red-200 text-red-900"
                            : "bg-gray-200 text-gray-700"
                  }
                `}
                >
                  {order.status === "delivered" && (
                    <span className="text-lg">✅</span>
                  )}
                  {order.status === "shipped" && (
                    <span className="text-lg">🚚</span>
                  )}
                  {order.status === "pending" && (
                    <span className="text-lg">⏳</span>
                  )}
                  {order.status === "cancelled" && (
                    <span className="text-lg">❌</span>
                  )}
                  {order.status}
                </span>
                <button
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg font-semibold text-base hover:from-blue-600 hover:to-blue-800 hover:scale-105 transition-all border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-auto"
                  style={{ minWidth: 140 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/profile/orders/${order.id}`;
                  }}
                  tabIndex={0}
                  aria-label={`View details for order ${order.id}`}
                >
                  <span className="text-lg">🔍</span> View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No orders found</p>
        )}
      </div>
    </div>
  );
}
