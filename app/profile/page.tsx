import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { DbOrder, User } from "@/app/types";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Orders } from "./_components/orders";
import { Overview } from "./_components/overview";
import { PersonalInfo } from "./_components/personal-info";
import { ProfileSidebar } from "./_components/profile-sidebar";

import { MobileNav } from "./_components/mobile-nav";

interface SearchParams {
    tab?: string;
}

interface PageProps {
    searchParams: Promise<SearchParams>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const user: User = {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || "",
        image: session.user.image,
        role: "user",
        createdAt: new Date(),
    };

    const orders = (await db.order.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    })) as DbOrder[];

    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams.tab || "overview";

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <Overview user={user} orders={orders} />;
            case "orders":
                return <Orders orders={orders} />;

            case "account":
                return <PersonalInfo user={user} />;
            default:
                return <Overview user={user} orders={orders} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f6fbff] to-[#e3f0fa]">
            <div className="pt-[100px] md:pt-[150px]">
                <div className="container mx-auto px-4">
                    {/* Mobile Header */}
                    <div className="md:hidden mb-6">
                        <div className="flex items-center gap-4 bg-white/80 rounded-lg shadow-sm p-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                                {user.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-semibold">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">
                                    {user.name || "User"}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Desktop Sidebar */}
                        <div className="hidden md:block">
                            <ProfileSidebar activeTab={activeTab} />
                        </div>

                        {/* Main Content */}
                        <main className="flex-1">
                            <div className="bg-white/80 rounded-lg shadow-sm p-4 md:p-6">
                                {renderContent()}
                            </div>
                        </main>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
                        <MobileNav activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
}
