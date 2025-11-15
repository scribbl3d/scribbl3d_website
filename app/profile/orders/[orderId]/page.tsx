import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { notFound, redirect } from "next/navigation";
import { IndianRupee } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const [{ orderId }] = await Promise.all([params, searchParams]);
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  // Parse items and addresses if stored as JSON strings
  let items = [];
  try {
    items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch {
    items = [];
  }
  let shippingAddress = order.shippingAddress;
  try {
    shippingAddress =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
  } catch {}

  // --- Fetch correct images for each item ---
  // Build a map of id -> image
  const productIds = items
    .filter((item: any) => item.productId)
    .map((item: any) => item.productId);
  const prebuiltProductIds = items
    .filter((item: any) => item.prebuiltProductId)
    .map((item: any) => item.prebuiltProductId);

  // Fetch all products and prebuilt products in parallel
  const [products, prebuiltProducts] = await Promise.all([
    productIds.length > 0
      ? db.product.findMany({ where: { id: { in: productIds } } })
      : Promise.resolve([]),
    prebuiltProductIds.length > 0
      ? db.prebuiltProduct.findMany({
          where: { id: { in: prebuiltProductIds } },
        })
      : Promise.resolve([]),
  ]);

  // Build lookup maps
  const productImageMap = Object.fromEntries(
    products.map((p: any) => [
      p.id,
      Array.isArray(p.images)
        ? p.images[0]
        : typeof p.images === "string"
          ? p.images
          : null,
    ])
  );
  const prebuiltProductImageMap = Object.fromEntries(
    prebuiltProducts.map((p: any) => [
      p.id,
      Array.isArray(p.images)
        ? p.images[0]
        : typeof p.images === "string"
          ? p.images
          : null,
    ])
  );

  // Helper to get the correct image for an item
  function getItemImage(item: any) {
    if (item.productId && productImageMap[item.productId])
      return productImageMap[item.productId];
    if (
      item.prebuiltProductId &&
      prebuiltProductImageMap[item.prebuiltProductId]
    )
      return prebuiltProductImageMap[item.prebuiltProductId];
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white/80 rounded-lg shadow-sm mt-10">
      {/* Breadcrumb and Back Button */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/profile?tab=orders"
          className="text-blue-600 hover:underline font-medium flex items-center gap-1"
        >
          <span className="text-lg">←</span>
          Back to Orders
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/profile" className="text-gray-500 hover:underline">
          Profile
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link
          href="/profile?tab=orders"
          className="text-gray-500 hover:underline"
        >
          Orders
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700 font-semibold">Order Details</span>
      </div>
      <h1 className="text-3xl font-bold mb-4">Order Details</h1>
      <div className="mb-6">
        <div className="text-gray-600 text-sm">
          Order ID: <span className="select-all">{order.id}</span>
        </div>
        <div className="text-gray-600 text-sm">
          Placed on: {new Date(order.createdAt).toLocaleString()}
        </div>
        <div className="text-gray-600 text-sm">
          Status: <span className="font-semibold">{order.status}</span>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        {Array.isArray(items) && items.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {items.map((item: any, idx: number) => {
              const image = getItemImage(item);
              return (
                <li key={idx} className="py-3 flex items-center gap-4">
                  {image ? (
                    <img
                      src={image}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 border">
                      <span className="text-2xl">🛍️</span>
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
                  <div className="flex flex-col items-end">
                    <span className="text-sm">Qty: {item.quantity || 1}</span>
                    <span className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
                      <IndianRupee className="w-4 h-4" />
                      {item.price || 0}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-gray-400 text-sm italic">No items found</div>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
        {shippingAddress &&
        typeof shippingAddress === "object" &&
        !Array.isArray(shippingAddress) ? (
          <div className="text-gray-700 text-sm">
            <div>
              {typeof shippingAddress.name === "string"
                ? shippingAddress.name
                : typeof shippingAddress.fullName === "string"
                  ? shippingAddress.fullName
                  : ""}
            </div>
            <div>
              {typeof shippingAddress.street === "string"
                ? shippingAddress.street
                : ""}
            </div>
            <div>
              {typeof shippingAddress.city === "string"
                ? shippingAddress.city
                : ""}
              ,{" "}
              {typeof shippingAddress.state === "string"
                ? shippingAddress.state
                : ""}{" "}
              {typeof shippingAddress.zipCode === "string"
                ? shippingAddress.zipCode
                : ""}
            </div>
            <div>
              {typeof shippingAddress.country === "string"
                ? shippingAddress.country
                : ""}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm italic">
            No shipping address
          </div>
        )}
      </div>
    </div>
  );
}
