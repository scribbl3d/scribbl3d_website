"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, User, Heart } from "lucide-react";

interface ProfileSidebarProps {
  activeTab: string;
}

export function ProfileSidebar({ activeTab }: ProfileSidebarProps) {
  const tabs = [
    {
      name: "Overview",
      href: "/profile?tab=overview",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      href: "/profile?tab=orders",
      icon: Package,
    },
    {
      name: "Wishlist",
      href: "/profile?tab=wishlist",
      icon: Heart,
    },
    {
      name: "Account",
      href: "/profile?tab=account",
      icon: User,
    },
  ];

  return (
    <div className="w-64 space-y-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.href.split("=")[1];
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
              isActive
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <tab.icon className="h-5 w-5" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
