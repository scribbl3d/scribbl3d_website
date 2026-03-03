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

export default async function ProfilePage({ searchParams }: PageProps) {
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //     redirect("/login");
    // }
    // /* ---------- USER ---------- */
    // const user: User = {
    //     id: session.user.id,
    //     name: session.user.name || null,
    //     email: session.user.email || "",
    //     image: session.user.image,
    //     role: "user",
    //     createdAt: new Date(),
    // };
    // /* ---------- ORDERS (RAW FROM DB) ---------- */
    // const ordersFromDb = await db.order.findMany({
    //     where: { userId: session.user.id },
    //     orderBy: { createdAt: "desc" },
    //     include: {
    //         shipments: {
    //             // ✅ Changed from 'shipment' to 'shipments'
    //             select: {
    //                 waybill: true,
    //                 status: true,
    //                 syncing: true,
    //                 lastSyncedAt: true,
    //                 isMaster: true, // Added for MPS support
    //                 shipmentType: true, // Added for MPS support
    //             },
    //         },
    //     },
    // });
    // /* 🔥 TEST LOG */
    // console.log(
    //     "[PROFILE] Orders fetched:",
    //     ordersFromDb.map((o) => {
    //         const masterShipment =
    //             o.shipments?.find((s) => s.isMaster) || o.shipments?.[0];
    //         return {
    //             id: o.id,
    //             hasShipment: o.shipments?.length > 0,
    //             shipmentCount: o.shipments?.length || 0,
    //             syncing: masterShipment?.syncing,
    //             lastSyncedAt: masterShipment?.lastSyncedAt,
    //             status: masterShipment?.status,
    //         };
    //     }),
    // );
    // for (const order of ordersFromDb) {
    //     // Get master shipment from array
    //     const masterShipment =
    //         order.shipments?.find((s) => s.isMaster) || order.shipments?.[0];
    //     if (!masterShipment) continue;
    //     const shouldSync = shouldSyncShipment(masterShipment);
    //     if (shouldSync) {
    //         // 🚨 DO NOT await (important)
    //         triggerShipmentSync(order.id);
    //     }
    // }
    // /* ✅ CAST STATUS LOCALLY & ADD BACKWARD COMPATIBLE shipment FIELD */
    // const orders = ordersFromDb.map((order) => {
    //     // Get master shipment for backward compatibility
    //     const masterShipment =
    //         order.shipments?.find((s) => s.isMaster) ||
    //         order.shipments?.[0] ||
    //         null;
    //     return {
    //         ...order,
    //         status: order.status as LocalOrderStatus,
    //         // Add singular 'shipment' for backward compatibility with UI components
    //         shipment: masterShipment,
    //     };
    // });
    // /* ---------- WISHLIST ---------- */
    // const wishlist = await db.wishlist.findUnique({
    //     where: { userId: session.user.id },
    //     include: {
    //         items: {
    //             include: {
    //                 product: {
    //                     select: {
    //                         id: true,
    //                         name: true,
    //                         price: true,
    //                         images: true,
    //                     },
    //                 },
    //                 prebuiltProduct: {
    //                     select: {
    //                         id: true,
    //                         name: true,
    //                         price: true,
    //                         images: true,
    //                     },
    //                 },
    //             },
    //         },
    //     },
    // });
    // const resolvedSearchParams = await searchParams;
    // const activeTab = resolvedSearchParams.tab || "overview";
    // /* ---------- TAB RENDER ---------- */
    // const renderContent = () => {
    //     switch (activeTab) {
    //         case "overview":
    //             return (
    //                 <Overview
    //                     user={user}
    //                     orders={orders as any}
    //                     wishlist={wishlist?.items || []}
    //                 />
    //             );
    //         case "orders":
    //             return <Orders orders={orders as any} />;
    //         case "wishlist":
    //             return <Wishlist />;
    //         case "account":
    //             return <PersonalInfo user={user} />;
    //         default:
    //             return (
    //                 <Overview
    //                     user={user}
    //                     orders={orders as any}
    //                     wishlist={wishlist?.items || []}
    //                 />
    //             );
    //     }
    // };
    // return (
    //     <div className="min-h-screen bg-gradient-to-br from-white via-[#f6fbff] to-[#e3f0fa]">
    //         <div className="pt-[100px] md:pt-[150px]">
    //             <div className="container mx-auto px-4">
    //                 {/* ---------- MOBILE HEADER ---------- */}
    //                 <div className="md:hidden mb-6">
    //                     <div className="flex items-center gap-4 bg-white/80 rounded-lg shadow-sm p-4">
    //                         <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
    //                             {user.image ? (
    //                                 <img
    //                                     src={user.image}
    //                                     alt={user.name || "User"}
    //                                     className="h-full w-full object-cover"
    //                                 />
    //                             ) : (
    //                                 <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-semibold">
    //                                     {user.name?.[0]?.toUpperCase() || "U"}
    //                                 </div>
    //                             )}
    //                         </div>
    //                         <div>
    //                             <h1 className="text-lg font-semibold">
    //                                 {user.name || "User"}
    //                             </h1>
    //                             <p className="text-sm text-gray-500">
    //                                 {user.email}
    //                             </p>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="flex flex-col md:flex-row gap-8">
    //                     {/* ---------- DESKTOP SIDEBAR ---------- */}
    //                     <div className="hidden md:block">
    //                         <ProfileSidebar activeTab={activeTab} />
    //                     </div>
    //                     {/* ---------- MAIN CONTENT ---------- */}
    //                     <main className="flex-1">
    //                         <div className="bg-white/80 rounded-lg shadow-sm p-4 md:p-6">
    //                             {renderContent()}
    //                         </div>
    //                     </main>
    //                 </div>
    //                 {/* ---------- MOBILE NAV ---------- */}
    //                 <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
    //                     <MobileNav activeTab={activeTab} />
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
}
