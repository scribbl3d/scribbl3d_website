"use client";

import { useState } from "react";
import AboutHeroAdmin from "./components/AboutHeroAdmin";
import TrustedByAdmin from "./components/TrustedByAdmin";

export default function AboutAdminPage() {
    // State to manage active tabs. Easy to add more later!
    const [activeTab, setActiveTab] = useState("trusted-by");

    return (
        <div className="p-8 max-w-[1240px] mx-auto min-h-screen bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    About Page Content
                </h1>
                <p className="text-gray-500 mt-2">
                    Manage the content displayed on the public About page.
                </p>
            </div>

            {/* ── Tabs Navigation ── */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("trusted-by")}
                    className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "trusted-by"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                    Trusted By Section
                </button>
                <button
                    onClick={() => setActiveTab("hero-section")}
                    className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === "hero-section"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                    Hero Section
                </button>
            </div>

            {/* ── Tab Content Container ── */}
            <div className="bg-transparent">
                {activeTab === "trusted-by" && <TrustedByAdmin />}

                {activeTab === "hero-section" && <AboutHeroAdmin />}
            </div>
        </div>
    );
}
