"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, User, Heart } from "lucide-react";

interface MobileNavProps {
  activeTab: string;
}

export function MobileNav({ activeTab }: MobileNavProps) {
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
    <nav className="flex items-center justify-around p-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.href.split("=")[1];
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all",
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
