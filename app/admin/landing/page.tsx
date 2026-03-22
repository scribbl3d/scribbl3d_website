"use client";

import {
    ChevronLeft,
    LayoutGrid,
    MessageSquareQuote,
    Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommunityShowcaseTab from "./components/CommunityShowcaseTab";
import CustomerReviewsTab from "./components/CustomerReviewsTab";
import HeroBannersTab from "./components/HeroBannersTab";

type Tab = "hero" | "community" | "reviews";

const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "hero", label: "Hero Banners", icon: Sparkles },
    { key: "community", label: "Community Showcase", icon: LayoutGrid },
    { key: "reviews", label: "Customer Reviews", icon: MessageSquareQuote },
];

export default function AdminLandingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("hero");

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.push("/admin")}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Landing Page
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage homepage content sections
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                    activeTab === tab.key
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                {activeTab === "hero" && <HeroBannersTab />}
                {activeTab === "community" && <CommunityShowcaseTab />}
                {activeTab === "reviews" && <CustomerReviewsTab />}
            </div>
        </div>
    );
}
