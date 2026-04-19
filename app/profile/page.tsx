import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { User } from "@/app/types";
import { db } from "@/lib/db";
import { shouldSyncShipment } from "@/lib/shipment/shouldSync";
import { triggerShipmentSync } from "@/lib/shipment/triggerSync";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { MobileNav } from "./_components/mobile-nav";

// Force dynamic rendering to prevent caching of authenticated pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Orders } from "./_components/orders";
import { Overview } from "./_components/overview";
import { PersonalInfo } from "./_components/personal-info";
import { ProfileSidebar } from "./_components/profile-sidebar";
import Wishlist from "./_components/wishlist";

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */

type LocalOrderStatus =
    | "payment_pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "error";

interface SearchParams {
    tab?: string;
}

interface PageProps {
    searchParams: Promise<SearchParams>;
}

/* ─────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────── */

export default async function ProfilePage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    /* ---------- USER ---------- */
    const user: User = {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || "",
        image: session.user.image,
        role: "user",
        createdAt: new Date(),
    };

    /* ---------- ORDERS ---------- */
    const ordersFromDb = await db.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            shipments: {
                select: {
                    waybill: true,
                    status: true,
                    syncing: true,
                    lastSyncedAt: true,
                    isMaster: true,
                    shipmentType: true,
                },
            },
        },
    });

    console.log(
        "[PROFILE] Orders fetched:",
        ordersFromDb.map((o) => {
            const masterShipment =
                o.shipments?.find((s) => s.isMaster) || o.shipments?.[0];
            return {
                id: o.id,
                hasShipment: o.shipments?.length > 0,
                shipmentCount: o.shipments?.length || 0,
                syncing: masterShipment?.syncing,
                lastSyncedAt: masterShipment?.lastSyncedAt,
                status: masterShipment?.status,
            };
        }),
    );

    for (const order of ordersFromDb) {
        const masterShipment =
            order.shipments?.find((s) => s.isMaster) || order.shipments?.[0];
        if (!masterShipment) continue;
        const shouldSync = shouldSyncShipment(masterShipment);
        if (shouldSync) {
            triggerShipmentSync(order.id); // ✅ fire-and-forget, no await
        }
    }

    const orders = ordersFromDb.map((order) => {
        const masterShipment =
            order.shipments?.find((s) => s.isMaster) ||
            order.shipments?.[0] ||
            null;
        return {
            ...order,
            status: order.status as LocalOrderStatus,
            shipment: masterShipment, // backward-compat singular field
        };
    });

    /* ---------- WISHLIST ---------- */
    const wishlist = await db.wishlist.findUnique({
        where: { userId: session.user.id },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            images: true,
                        },
                    },
                    prebuiltProduct: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            // ✅ PrebuiltProducts has no `price` field —
                            //    price lives on PrebuiltVariants
                            images: {
                                where: { isMain: true },
                                take: 1,
                                select: { url: true, altText: true },
                            },
                            variants: {
                                where: { isActive: true },
                                orderBy: { price: "asc" },
                                take: 1,
                                select: {
                                    id: true,
                                    price: true,
                                    originalPrice: true,
                                    colorName: true,
                                    colorHex: true,
                                    sizeName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    /* ---------- ACTIVE TAB ---------- */
    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams.tab || "overview";

    /* ---------- TRANSFORM WISHLIST ---------- */
    const transformedWishlist = (wishlist?.items || []).map((item) => {
        if (item.product) {
            return {
                product: item.product,
                prebuiltProduct: null,
            };
        }
        if (item.prebuiltProduct) {
            const lowestPrice = item.prebuiltProduct.variants?.[0]?.price || 0;
            const images = item.prebuiltProduct.images.map((img) => img.url);
            return {
                product: null,
                prebuiltProduct: {
                    id: item.prebuiltProduct.id,
                    name: item.prebuiltProduct.name,
                    price: lowestPrice,
                    images,
                },
            };
        }
        return item as any;
    });

    /* ---------- TAB RENDER ---------- */
    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <Overview
                        user={user}
                        orders={orders as any}
                        wishlist={transformedWishlist}
                    />
                );
            case "orders":
                return <Orders orders={orders as any} />;
            case "wishlist":
                return <Wishlist />;
            case "account":
                return <PersonalInfo user={user} />;
            default:
                return (
                    <Overview
                        user={user}
                        orders={orders as any}
                        wishlist={transformedWishlist}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f6fbff] to-[#e3f0fa]">
            <div className="pt-[90px] md:pt-[100px] lg:pt-[150px]">
                <div className="container mx-auto px-3 md:px-4">
                    {/* ---------- MOBILE HEADER ---------- */}
                    <div className="md:hidden mb-4">
                        <div className="flex items-center gap-3 bg-white/80 rounded-lg shadow-sm p-3">
                            <div className="h-11 w-11 rounded-full bg-gray-200 overflow-hidden">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600 text-lg font-semibold">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-base font-semibold">
                                    {user.name || "User"}
                                </h1>
                                <p className="text-xs text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-5 md:gap-8">
                        {/* ---------- DESKTOP SIDEBAR ---------- */}
                        <div className="hidden md:block">
                            <ProfileSidebar activeTab={activeTab} />
                        </div>

                        {/* ---------- MAIN CONTENT ---------- */}
                        <main className="flex-1 pb-20 md:pb-0">
                            <div className="bg-white/80 rounded-lg shadow-sm p-3 md:p-4 lg:p-6">
                                {renderContent()}
                            </div>
                        </main>
                    </div>

                    {/* ---------- MOBILE NAV ---------- */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
                        <MobileNav activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
}
